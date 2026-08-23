import React from 'react'
import { CartContents } from '@/components/cart/CartContents'

export const metadata = { title: 'Cart | SAIF STORE' }

export default function CartPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">Review quantities, remove items, and continue to secure checkout.</p>
      </div>
      <CartContents />
    </div>
  )
}
