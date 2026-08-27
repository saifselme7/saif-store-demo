-- ==========================================================
-- SAIF STORE - Ordering System Migration
-- Adds secure order storage, product price snapshots, status tracking,
-- admin/customer RLS policies, and trusted order creation RPC.
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Shared admin helper used by order RLS policies.
-- SECURITY DEFINER prevents policy recursion and uses the existing profiles.role model.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
  );
$$;

-- 2. Order status enum/check values are enforced via CHECK to keep TypeScript simple.
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  public_token UUID NOT NULL DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) >= 2),
  customer_phone TEXT NOT NULL CHECK (char_length(trim(customer_phone)) >= 7),
  customer_email TEXT,
  delivery_address TEXT NOT NULL CHECK (char_length(trim(delivery_address)) >= 5),
  notes TEXT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 99),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS orders_public_token_idx ON public.orders(public_token);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 3. Orders RLS: no anonymous direct reads/writes. Guest tracking is through RPC token verification.
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;
CREATE POLICY "Admins can update order status"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
CREATE POLICY "Customers can view own order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );

-- 4. Trusted order creation RPC.
-- The frontend sends only product_id and quantity. This function reads products itself,
-- validates availability, snapshots product_name/unit_price, calculates totals, and inserts atomically.
CREATE OR REPLACE FUNCTION public.create_store_order(
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  delivery_address TEXT,
  notes TEXT,
  cart_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_order public.orders%ROWTYPE;
  item JSONB;
  product_record public.products%ROWTYPE;
  requested_quantity INTEGER;
  calculated_subtotal NUMERIC(10, 2) := 0;
  line_subtotal NUMERIC(10, 2);
BEGIN
  IF customer_name IS NULL OR char_length(trim(customer_name)) < 2 THEN
    RAISE EXCEPTION 'invalid_customer_name' USING ERRCODE = '22023';
  END IF;

  IF customer_phone IS NULL OR char_length(trim(customer_phone)) < 7 THEN
    RAISE EXCEPTION 'invalid_customer_phone' USING ERRCODE = '22023';
  END IF;

  IF delivery_address IS NULL OR char_length(trim(delivery_address)) < 5 THEN
    RAISE EXCEPTION 'invalid_delivery_address' USING ERRCODE = '22023';
  END IF;

  IF cart_items IS NULL OR jsonb_typeof(cart_items) <> 'array' OR jsonb_array_length(cart_items) = 0 THEN
    RAISE EXCEPTION 'empty_cart' USING ERRCODE = '22023';
  END IF;

  -- First pass: validate all lines before inserting anything.
  FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    IF item->>'product_id' IS NULL THEN
      RAISE EXCEPTION 'invalid_product' USING ERRCODE = '22023';
    END IF;

    requested_quantity := COALESCE((item->>'quantity')::INTEGER, 0);
    IF requested_quantity <= 0 OR requested_quantity > 99 THEN
      RAISE EXCEPTION 'invalid_quantity' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO product_record
    FROM public.products
    WHERE id = (item->>'product_id')::UUID
      AND is_available = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_unavailable' USING ERRCODE = '22023';
    END IF;

    calculated_subtotal := calculated_subtotal + (product_record.price * requested_quantity);
  END LOOP;

  INSERT INTO public.orders (
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    notes,
    subtotal,
    total,
    status
  ) VALUES (
    auth.uid(),
    trim(customer_name),
    trim(customer_phone),
    NULLIF(trim(COALESCE(customer_email, '')), ''),
    trim(delivery_address),
    NULLIF(trim(COALESCE(notes, '')), ''),
    calculated_subtotal,
    calculated_subtotal,
    'pending'
  )
  RETURNING * INTO created_order;

  -- Second pass: insert price/name snapshots.
  FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    requested_quantity := (item->>'quantity')::INTEGER;

    SELECT * INTO product_record
    FROM public.products
    WHERE id = (item->>'product_id')::UUID
      AND is_available = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_unavailable' USING ERRCODE = '22023';
    END IF;

    line_subtotal := product_record.price * requested_quantity;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal
    ) VALUES (
      created_order.id,
      product_record.id,
      product_record.name,
      requested_quantity,
      product_record.price,
      line_subtotal
    );
  END LOOP;

  RETURN jsonb_build_object(
    'id', created_order.id,
    'public_token', created_order.public_token,
    'status', created_order.status,
    'subtotal', created_order.subtotal,
    'total', created_order.total,
    'customer_name', created_order.customer_name
  );
END;
$$;

-- 5. Token-protected guest/customer order tracking RPC.
CREATE OR REPLACE FUNCTION public.get_order_tracking(order_id UUID, order_token UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', o.id,
    'customer_name', o.customer_name,
    'customer_phone', o.customer_phone,
    'customer_email', o.customer_email,
    'delivery_address', o.delivery_address,
    'notes', o.notes,
    'subtotal', o.subtotal,
    'total', o.total,
    'status', o.status,
    'created_at', o.created_at,
    'items', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal
          )
          ORDER BY oi.created_at ASC
        )
        FROM public.order_items oi
        WHERE oi.order_id = o.id
      ),
      '[]'::jsonb
    )
  )
  FROM public.orders o
  WHERE o.id = order_id
    AND (
      o.public_token = order_token
      OR o.customer_id = auth.uid()
      OR public.is_admin()
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.create_store_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_store_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_order_tracking(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_tracking(UUID, UUID) TO anon, authenticated;
