'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'

export function CartContents({ checkoutMode = false }: { checkoutMode?: boolean }) {
  const { items, subtotal, increaseItem, decreaseItem, removeItem, clearCart } = useCart()
  const defaultImage = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80'

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500 mt-2">Add fresh SAIF STORE items before checking out.</p>
        <Link href="/products" className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">
          Browse products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {items.map((item) => (
          <div key={item.product_id} className="p-4 sm:p-5 flex gap-4">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
              <Image src={item.image_url || defaultImage} alt={item.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <Link href={`/products/${item.slug}`} className="font-black text-slate-900 hover:text-amber-700 line-clamp-1">{item.name}</Link>
                <p className="text-sm text-slate-500 mt-1">{formatPrice(item.unit_price)} each</p>
                <p className="text-sm font-bold text-slate-900 mt-1">Line total: {formatPrice(item.unit_price * item.quantity)}</p>
              </div>
              {!checkoutMode && (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button type="button" onClick={() => decreaseItem(item.product_id)} className="p-2 rounded-lg hover:bg-white" aria-label="Decrease quantity"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                    <button type="button" onClick={() => increaseItem(item.product_id)} className="p-2 rounded-lg hover:bg-white" aria-label="Increase quantity"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.product_id)} className="p-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100" aria-label="Remove item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {checkoutMode && <span className="font-black text-slate-900">× {item.quantity}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Delivery</span>
          <span className="font-bold text-emerald-700">Free</span>
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-lg font-black text-slate-900">Total</span>
          <span className="text-2xl font-black text-slate-900">{formatPrice(subtotal)}</span>
        </div>
        {!checkoutMode && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={clearCart} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm">Clear cart</button>
            <Link href="/checkout" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all">
              Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
