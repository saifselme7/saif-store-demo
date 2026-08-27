-- ==========================================================
-- SAIF STORE - Fix order RPC parameter references + schema cache reload
--
-- The original create_store_order RPC used argument names that match orders
-- column names (customer_name, customer_phone, etc.). Depending on PL/pgSQL
-- name resolution, those references can raise runtime ambiguity errors.
-- This version keeps the same public RPC signature for the app, but uses
-- $1..$6 aliases internally and asks PostgREST to reload its schema cache.
-- ==========================================================

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
  v_customer_name ALIAS FOR $1;
  v_customer_phone ALIAS FOR $2;
  v_customer_email ALIAS FOR $3;
  v_delivery_address ALIAS FOR $4;
  v_notes ALIAS FOR $5;
  v_cart_items ALIAS FOR $6;
  created_order public.orders%ROWTYPE;
  item JSONB;
  product_record public.products%ROWTYPE;
  requested_quantity INTEGER;
  calculated_subtotal NUMERIC(10, 2) := 0;
  line_subtotal NUMERIC(10, 2);
BEGIN
  IF v_customer_name IS NULL OR char_length(trim(v_customer_name)) < 2 THEN
    RAISE EXCEPTION 'invalid_customer_name' USING ERRCODE = '22023';
  END IF;

  IF v_customer_phone IS NULL OR char_length(trim(v_customer_phone)) < 7 THEN
    RAISE EXCEPTION 'invalid_customer_phone' USING ERRCODE = '22023';
  END IF;

  IF v_delivery_address IS NULL OR char_length(trim(v_delivery_address)) < 5 THEN
    RAISE EXCEPTION 'invalid_delivery_address' USING ERRCODE = '22023';
  END IF;

  IF v_cart_items IS NULL OR jsonb_typeof(v_cart_items) <> 'array' OR jsonb_array_length(v_cart_items) = 0 THEN
    RAISE EXCEPTION 'empty_cart' USING ERRCODE = '22023';
  END IF;

  -- First pass: validate all lines before inserting anything.
  FOR item IN SELECT * FROM jsonb_array_elements(v_cart_items)
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
    trim(v_customer_name),
    trim(v_customer_phone),
    NULLIF(trim(COALESCE(v_customer_email, '')), ''),
    trim(v_delivery_address),
    NULLIF(trim(COALESCE(v_notes, '')), ''),
    calculated_subtotal,
    calculated_subtotal,
    'pending'
  )
  RETURNING * INTO created_order;

  -- Second pass: insert product name/price snapshots.
  FOR item IN SELECT * FROM jsonb_array_elements(v_cart_items)
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
  WHERE o.id = $1
    AND (
      o.public_token = $2
      OR o.customer_id = auth.uid()
      OR public.is_admin()
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.create_store_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_store_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_order_tracking(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_tracking(UUID, UUID) TO anon, authenticated;

-- Make the RPC changes visible to Supabase/PostgREST immediately after the migration commits.
NOTIFY pgrst, 'reload schema';
