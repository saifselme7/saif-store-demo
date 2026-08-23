'use client'

import React from 'react'
import Link from 'next/link'
import { Store } from 'lucide-react'

interface AdminHeaderProps { title: string; description?: string; actionButton?: React.ReactNode }

export function AdminHeader({ title, description, actionButton }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-5 sticky top-0 z-30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">{title}</h1>
          {description && <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-6">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actionButton}
          <Link href="/" target="_blank" className="luxury-button-secondary px-4 py-2 text-xs">
            <Store className="w-3.5 h-3.5" />
            <span>عرض المتجر</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
