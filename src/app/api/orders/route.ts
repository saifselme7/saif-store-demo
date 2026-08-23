import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RequestItem = { product_id?: string; quantity?: number }

const friendlyErrors: Record<string, string> = {
  invalid_customer_name: 'Please enter a valid full name.',
  invalid_customer_phone: 'Please enter a valid phone number.',
  invalid_delivery_address: 'Please enter a valid delivery address.',
  empty_cart: 'Your cart is empty.',
  invalid_product: 'One of the cart products is invalid.',
  invalid_quantity: 'One of the item quantities is invalid.',
  product_unavailable: 'One of the selected products is no longer available. Please update your cart.',
}

function parseDatabaseError(message: string) {
  const key = Object.keys(friendlyErrors).find((code) => message.includes(code))
  return key ? friendlyErrors[key] : 'We could not place your order right now. Please try again.'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items = Array.isArray(body.items) ? body.items as RequestItem[] : []

    const cartItems = items.map((item) => ({
      product_id: String(item.product_id || ''),
      quantity: Number(item.quantity || 0),
    }))

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
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
      console.error('Order RPC error:', error)
      return NextResponse.json({ error: parseDatabaseError(error.message) }, { status: 400 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json({ error: 'Network or server error. Please try again.' }, { status: 500 })
  }
}
