'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'

export function CartContents({ checkoutMode = false }: { checkoutMode?: boolean }) {
  const { items, subtotal, increaseItem, decreaseItem, removeItem, clearCart } = useCart()
  const defaultImage = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80'

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-dashed border-neutral-300 p-8 sm:p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h2 className="text-xl font-black text-neutral-950">سلتك فاضية</h2>
        <p className="text-sm text-neutral-500 mt-2">ضيف منتجات من سيف ستور قبل ما تكمل الطلب.</p>
        <Link href="/products" className="luxury-button px-5 py-3 mt-6 text-sm">
          اتفرج على المنتجات
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm divide-y divide-neutral-100 overflow-hidden">
        {items.map((item) => (
          <div key={item.product_id} className="p-4 sm:p-5 flex gap-4">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-3xl bg-neutral-100 border border-neutral-200">
              <Image src={item.image_url || defaultImage} alt={item.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <Link href={`/products/${item.slug}`} className="font-black text-neutral-950 hover:text-neutral-600 line-clamp-1">{item.name}</Link>
                <p className="text-sm text-neutral-500 mt-1" dir="ltr">{formatPrice(item.unit_price)} لكل قطعة</p>
                <p className="text-sm font-black text-neutral-950 mt-1" dir="ltr">{formatPrice(item.unit_price * item.quantity)}</p>
              </div>
              {!checkoutMode && (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 p-1">
                    <button type="button" onClick={() => decreaseItem(item.product_id)} className="p-2 rounded-full hover:bg-white" aria-label="قلل الكمية"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                    <button type="button" onClick={() => increaseItem(item.product_id)} className="p-2 rounded-full hover:bg-white" aria-label="زود الكمية"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.product_id)} className="p-2.5 rounded-full text-red-700 bg-red-50 hover:bg-red-100" aria-label="شيل المنتج">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {checkoutMode && <span className="font-black text-neutral-950">× {item.quantity}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-neutral-600"><span>المجموع</span><span className="font-black text-neutral-950" dir="ltr">{formatPrice(subtotal)}</span></div>
        <div className="flex items-center justify-between text-sm text-neutral-600"><span>التوصيل</span><span className="font-black text-neutral-950">مجاني</span></div>
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between"><span className="text-lg font-black text-neutral-950">الإجمالي</span><span className="text-2xl font-black text-neutral-950" dir="ltr">{formatPrice(subtotal)}</span></div>
        {!checkoutMode && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={clearCart} className="px-4 py-3 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-black text-sm">فضي السلة</button>
            <Link href="/checkout" className="flex-1 luxury-button px-5 py-3 text-sm">
              إتمام الطلب
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
