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

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((previous) => ({ ...previous, [field]: event.target.value }))

  const validate = () => {
    if (items.length === 0) return 'سلتك فاضية. ضيف منتج الأول.'
    if (form.customer_name.trim().length < 2) return 'اكتب اسمك بالكامل.'
    if (form.customer_phone.trim().length < 7) return 'اكتب رقم موبايل صحيح.'
    if (form.delivery_address.trim().length < 5) return 'اكتب عنوان التوصيل بوضوح.'
    if (form.customer_email && !/^\S+@\S+\.\S+$/.test(form.customer_email.trim())) return 'الإيميل مش واضح. اكتبه صح أو سيبه فاضي.'
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const validationError = validate()
    if (validationError) return setError(validationError)

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })) }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'معرفناش نأكد الطلب دلوقتي. حاول تاني.')

      clearCart()
      router.push(`/orders/${result.order.id}?token=${result.order.public_token}`)
    } catch (err: any) {
      setError(err.message || 'معرفناش نأكد الطلب دلوقتي. حاول تاني.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm p-5 sm:p-7 space-y-5">
        <div>
          <p className="editorial-label">بيانات التوصيل</p>
          <h2 className="text-2xl font-black text-neutral-950 mt-2">اكتب بياناتك</h2>
          <p className="text-sm text-neutral-500 mt-1 leading-7">اكتب بياناتك عشان نأكد طلبك ونوصلهولك.</p>
        </div>

        {error && <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span></div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1.5"><span className="text-xs font-black text-neutral-500">الاسم بالكامل *</span><input value={form.customer_name} onChange={update('customer_name')} required className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-950 text-sm" placeholder="أحمد محمد" /></label>
          <label className="space-y-1.5"><span className="text-xs font-black text-neutral-500">رقم الموبايل *</span><input dir="ltr" value={form.customer_phone} onChange={update('customer_phone')} required className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-950 text-sm" placeholder="010XXXXXXXX" /></label>
        </div>
        <label className="block space-y-1.5"><span className="text-xs font-black text-neutral-500">الإيميل (اختياري)</span><input type="email" value={form.customer_email} onChange={update('customer_email')} className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-950 text-sm" placeholder="customer@example.com" /></label>
        <label className="block space-y-1.5"><span className="text-xs font-black text-neutral-500">عنوان التوصيل *</span><textarea value={form.delivery_address} onChange={update('delivery_address')} required rows={4} className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-950 text-sm" placeholder="العمارة، الشارع، المنطقة، المدينة" /></label>
        <label className="block space-y-1.5"><span className="text-xs font-black text-neutral-500">ملاحظات</span><textarea value={form.notes} onChange={update('notes')} rows={3} className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-950 text-sm" placeholder="أي تعليمات خاصة؟" /></label>

        <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 text-sm text-neutral-700 flex gap-3 leading-7"><ShieldCheck className="w-5 h-5 shrink-0 text-neutral-950" /><p>الأسعار والتوافر بيتأكدوا من الداتابيز وقت الطلب. أي تعديل من المتصفح مش هيغير الإجمالي الحقيقي.</p></div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="mb-2"><p className="editorial-label">ملخص الطلب</p></div>
        <CartContents checkoutMode />
        <button type="submit" disabled={isSubmitting || items.length === 0} className="w-full luxury-button px-6 py-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          <span>{isSubmitting ? 'بنأكد الطلب...' : `أكد الطلب • ${formatPrice(subtotal)}`}</span>
        </button>
      </aside>
    </form>
  )
}
