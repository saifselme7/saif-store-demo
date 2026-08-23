'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from './CartProvider'
import { CartContents } from './CartContents'
import { formatPrice } from '@/lib/utils'
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react'

export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', delivery_address: '', notes: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const validate = () => {
    if (items.length === 0) return 'Your cart is empty.'
    if (form.customer_name.trim().length < 2) return 'Please enter your full name.'
    if (form.customer_phone.trim().length < 7) return 'Please enter a valid phone number.'
    if (form.delivery_address.trim().length < 5) return 'Please enter your delivery address.'
    if (form.customer_email && !/^\S+@\S+\.\S+$/.test(form.customer_email.trim())) return 'Please enter a valid email address or leave it empty.'
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to place order.')

      clearCart()
      const orderId = result.order.id
      const token = result.order.public_token
      router.push(`/orders/${orderId}?token=${token}`)
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">Delivery Information</h2>
          <p className="text-sm text-slate-500 mt-1">We will use these details to confirm and deliver your order.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Full name *</span>
            <input value={form.customer_name} onChange={update('customer_name')} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="Ahmed Mohamed" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone number *</span>
            <input value={form.customer_phone} onChange={update('customer_phone')} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="010XXXXXXXX" />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Email address (optional)</span>
          <input type="email" value={form.customer_email} onChange={update('customer_email')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="customer@example.com" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery address *</span>
          <textarea value={form.delivery_address} onChange={update('delivery_address')} required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="Building, street, area, city" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes</span>
          <textarea value={form.notes} onChange={update('notes')} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="Any special instructions?" />
        </label>

        <div className="rounded-2xl bg-amber-50 border border-amber-200/70 p-4 text-sm text-amber-900 flex gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 text-amber-700" />
          <p>Prices and availability are verified securely from Supabase when you place the order. Browser totals cannot change the charged amount.</p>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <CartContents checkoutMode />
        <button type="submit" disabled={isSubmitting || items.length === 0} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          <span>{isSubmitting ? 'Placing order...' : `Place Order • ${formatPrice(subtotal)}`}</span>
        </button>
      </aside>
    </form>
  )
}
