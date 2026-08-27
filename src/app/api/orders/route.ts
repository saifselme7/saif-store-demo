import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RequestItem = { product_id?: string; quantity?: number }
type SupabaseOrderError = {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
}

const friendlyErrors: Record<string, string> = {
  invalid_customer_name: 'اكتب اسم كامل صحيح.',
  invalid_customer_phone: 'اكتب رقم موبايل صحيح.',
  invalid_delivery_address: 'اكتب عنوان توصيل واضح.',
  empty_cart: 'سلتك فاضية.',
  invalid_product: 'في منتج في السلة مش صحيح.',
  invalid_quantity: 'في كمية مش صحيحة في السلة.',
  product_unavailable: 'في منتج مبقاش متاح. حدّث السلة وحاول تاني.',
}

function parseDatabaseError(error: SupabaseOrderError) {
  const message = error.message || ''
  const details = error.details || ''
  const hint = error.hint || ''
  const combined = `${message} ${details} ${hint}`

  const customKey = Object.keys(friendlyErrors).find((code) => combined.includes(code))
  if (customKey) return friendlyErrors[customKey]

  if (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    combined.toLowerCase().includes('could not find the function') ||
    combined.toLowerCase().includes('function public.create_store_order')
  ) {
    return 'الطلب مش متاح مؤقتًا لأن إعداد الداتابيز ناقص. كلم المتجر.'
  }

  if (error.code === '42P01' || combined.toLowerCase().includes('relation') && combined.toLowerCase().includes('does not exist')) {
    return 'الطلب مش متاح مؤقتًا لأن إعداد الداتابيز ناقص. كلم المتجر.'
  }

  if (error.code === '42501' || combined.toLowerCase().includes('permission denied')) {
    return 'الطلب مش متاح مؤقتًا بسبب صلاحيات الداتابيز. كلم المتجر.'
  }

  if (error.code === '22P02' || combined.toLowerCase().includes('invalid input syntax for type uuid')) {
    return 'في منتج في السلة مش صحيح. Please remove it and add it again.'
  }

  return 'معرفناش نأكد الطلب دلوقتي. حاول تاني.'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items = Array.isArray(body.items) ? body.items as RequestItem[] : []

    const cartItems = items.map((item) => ({
      product_id: String(item.product_id || ''),
      quantity: Number(item.quantity || 0),
    }))

    const logPayload = {
      itemCount: cartItems.length,
      items: cartItems,
      hasCustomerName: Boolean(String(body.customer_name || '').trim()),
      hasCustomerPhone: Boolean(String(body.customer_phone || '').trim()),
      hasDeliveryAddress: Boolean(String(body.delivery_address || '').trim()),
      hasCustomerEmail: Boolean(String(body.customer_email || '').trim()),
      hasNotes: Boolean(String(body.notes || '').trim()),
    }

    if (cartItems.length === 0) {
      console.warn('Order rejected before RPC: empty cart', logPayload)
      return NextResponse.json({ error: 'سلتك فاضية.' }, { status: 400 })
    }

    const supabase = createClient()
    const { data, error } = await supabase.rpc('create_store_order', {
      customer_name: String(body.customer_name || ''),
      customer_phone: String(body.customer_phone || ''),
      customer_email: body.customer_email ? String(body.customer_email) : null,
      delivery_address: String(body.delivery_address || ''),
      notes: body.notes ? String(body.notes) : null,
      cart_items: cartItems,
    })

    if (error) {
      console.error('Order RPC error', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payload: logPayload,
      })

      const responseBody: { error: string; debug?: SupabaseOrderError } = {
        error: parseDatabaseError(error),
      }

      if (process.env.NODE_ENV !== 'production') {
        responseBody.debug = {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        }
      }

      return NextResponse.json(responseBody, { status: 400 })
    }

    console.info('Order created successfully', {
      orderId: typeof data === 'object' && data && 'id' in data ? data.id : undefined,
      itemCount: cartItems.length,
    })

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json({ error: 'في مشكلة في الاتصال. حاول تاني.' }, { status: 500 })
  }
}
