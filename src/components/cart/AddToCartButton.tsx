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
    setFeedback({ type: result.ok ? 'success' : 'error', message: result.message })
    window.setTimeout(() => setFeedback(null), 2600)
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.is_available}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-500 transition-all shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{product.is_available ? 'Add' : 'Unavailable'}</span>
        </button>
        {feedback && (
          <div className={`absolute right-0 top-full mt-2 z-20 w-56 rounded-xl border px-3 py-2 text-xs shadow-lg ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {feedback.message}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="inline-flex items-center justify-between rounded-xl border border-slate-200 bg-white p-1 w-full sm:w-36">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Decrease quantity">
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-black text-slate-900">{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Increase quantity">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.is_available}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-md shadow-amber-500/20 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{product.is_available ? 'Add to Cart' : 'Currently Unavailable'}</span>
        </button>
      </div>

      {feedback && (
        <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="inline-flex items-center gap-2">
            {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {feedback.message}
          </span>
          {feedback.type === 'success' && <Link href="/cart" className="font-bold underline">View cart</Link>}
        </div>
      )}
    </div>
  )
}
