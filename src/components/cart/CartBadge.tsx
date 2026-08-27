'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from './CartProvider'

export function CartBadge() {
  const { itemCount } = useCart()
  return (
    <Link href="/cart" className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-neutral-950 hover:bg-neutral-800 rounded-full transition-all border border-neutral-950 shadow-sm" aria-label="افتح السلة">
      <ShoppingBag className="w-4 h-4" />
      <span className="hidden sm:inline">السلة</span>
      {itemCount > 0 && (
        <span className="absolute -top-2 -left-2 min-w-5 h-5 px-1 rounded-full bg-white text-neutral-950 border border-neutral-950 text-[11px] font-black flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
