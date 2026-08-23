'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) return <main className="min-h-screen bg-neutral-950">{children}</main>

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-stone-50">
      <div className="hidden lg:block"><AdminSidebar /></div>
      <div className="lg:hidden bg-neutral-950 text-white px-4 py-3 overflow-x-auto border-b border-white/10">
        <div className="flex items-center gap-2 min-w-max text-sm font-bold">
          <a href="/admin" className="px-3 py-2 rounded-full bg-white text-neutral-950">لوحة التحكم</a>
          <a href="/admin/products" className="px-3 py-2 rounded-full bg-white/10">المنتجات</a>
          <a href="/admin/categories" className="px-3 py-2 rounded-full bg-white/10">الأقسام</a>
          <a href="/admin/orders" className="px-3 py-2 rounded-full bg-white/10">الطلبات</a>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">{children}</div>
    </div>
  )
}
