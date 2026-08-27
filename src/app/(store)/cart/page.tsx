import React from 'react'
import { CartContents } from '@/components/cart/CartContents'

export const metadata = { title: 'السلة | SAIF STORE' }

export default function CartPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <p className="editorial-label">سلة الشراء</p>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight mt-2">سلتك</h1>
        <p className="text-neutral-500 mt-3 text-sm sm:text-base leading-7">راجع المنتجات والكميات قبل ما تكمل إتمام الطلب.</p>
      </div>
      <CartContents />
    </div>
  )
}
