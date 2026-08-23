'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from './CartProvider'

export function CartBadge() {
  const { itemCount } = useCart()
  return (
    <Link href="/cart" className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all border border-amber-200/70 shadow-sm" aria-label="Open cart">
      <ShoppingBag className="w-4 h-4 text-amber-700" />
      <span className="hidden sm:inline">Cart</span>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
