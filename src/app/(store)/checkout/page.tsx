import React from 'react'
import { CheckoutForm } from '@/components/cart/CheckoutForm'

export const metadata = { title: 'Checkout | SAIF STORE' }

export default function CheckoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">Confirm your basket and delivery details before placing your SAIF STORE order.</p>
      </div>
      <CheckoutForm />
    </div>
  )
}
