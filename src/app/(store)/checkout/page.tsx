import React from 'react'
import { CheckoutForm } from '@/components/cart/CheckoutForm'

export const metadata = { title: 'إتمام الطلب | SAIF STORE' }

export default function CheckoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <p className="editorial-label">إتمام الطلب</p>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight mt-2">أكد طلبك</h1>
        <p className="text-neutral-500 mt-3 text-sm sm:text-base leading-7">أكد المنتجات وبيانات التوصيل قبل ما تبعت الطلب لسيف ستور.</p>
      </div>
      <CheckoutForm />
    </div>
  )
}
