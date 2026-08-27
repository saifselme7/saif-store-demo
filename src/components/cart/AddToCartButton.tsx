'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/types/database'
import { useCart } from './CartProvider'
import { ShoppingCart, Check, AlertCircle, Plus, Minus } from 'lucide-react'

export function AddToCartButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleAdd = () => {
    const result = addItem(product, quantity)
    setFeedback({ type: result.ok ? 'success' : 'error', message: result.ok ? 'اتضاف للسلة' : 'المنتج غير متاح حاليًا' })
    window.setTimeout(() => setFeedback(null), 2400)
  }

  if (compact) {
    return (
      <div className="relative">
        <button type="button" onClick={handleAdd} disabled={!product.is_available} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-black bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-500 transition-all active:scale-95">
          <ShoppingCart className="w-4 h-4" />
          <span>{product.is_available ? 'ضيف' : 'غير متاح'}</span>
        </button>
        {feedback && (
          <div className={`absolute left-0 top-full mt-2 z-20 w-48 rounded-2xl border px-3 py-2 text-xs shadow-lg ${feedback.type === 'success' ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {feedback.message}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="inline-flex items-center justify-between rounded-full border border-neutral-200 bg-white p-1 w-full sm:w-36">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 rounded-full hover:bg-neutral-100" aria-label="قلل الكمية"><Minus className="w-4 h-4" /></button>
          <span className="font-black text-neutral-950">{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))} className="p-2 rounded-full hover:bg-neutral-100" aria-label="زود الكمية"><Plus className="w-4 h-4" /></button>
        </div>
        <button type="button" onClick={handleAdd} disabled={!product.is_available} className="flex-1 luxury-button px-6 py-3 text-sm disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none">
          <ShoppingCart className="w-5 h-5" />
          <span>{product.is_available ? 'ضيف للسلة' : 'غير متاح حاليًا'}</span>
        </button>
      </div>

      {feedback && (
        <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="inline-flex items-center gap-2">{feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{feedback.message}</span>
          {feedback.type === 'success' && <Link href="/cart" className="font-black underline">افتح السلة</Link>}
        </div>
      )}
    </div>
  )
}
