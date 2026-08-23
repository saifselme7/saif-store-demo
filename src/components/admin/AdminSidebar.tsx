'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Package, Layers, ShoppingBag, Store, LogOut, PlusCircle, ExternalLink } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try { await supabase.auth.signOut(); router.push('/admin/login'); router.refresh() } catch (err) { console.error('Sign out error:', err) }
  }

  const navItems = [
    { label: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'المنتجات', href: '/admin/products', icon: Package, exact: false },
    { label: 'الأقسام', href: '/admin/categories', icon: Layers, exact: false },
    { label: 'الطلبات', href: '/admin/orders', icon: ShoppingBag, exact: false },
  ]

  return (
    <aside className="w-64 bg-neutral-950 text-neutral-300 flex flex-col shrink-0 border-l border-neutral-900 min-h-screen">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-neutral-950 flex items-center justify-center font-black shadow-sm">S</div>
          <div><h1 className="font-black text-white text-base tracking-tight leading-none">SAIF STORE</h1><span className="text-[11px] font-black tracking-wider text-neutral-500">لوحة الإدارة</span></div>
        </Link>
      </div>

      <div className="px-4 pt-5 pb-2">
        <Link href="/admin/products/new" className="w-full luxury-button-secondary px-4 py-2.5 text-sm"><PlusCircle className="w-4 h-4" /><span>إضافة منتج جديد</span></Link>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-black tracking-wider text-neutral-500">إدارة المتجر</div>
        {navItems.map((item) => { const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href); const Icon = item.icon; return <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${isActive ? 'bg-white text-neutral-950' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}><Icon className="w-4 h-4" /><span>{item.label}</span></Link> })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-black tracking-wider text-neutral-500">المتجر</div>
        <Link href="/" target="_blank" className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"><span className="flex items-center gap-3"><Store className="w-4 h-4" /><span>واجهة المتجر</span></span><ExternalLink className="w-3.5 h-3.5" /></Link>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2"><div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"><div className="truncate"><p className="text-xs font-bold text-white truncate">مدير المتجر</p><p className="text-[11px] text-neutral-500">الداتابيز متصلة</p></div><button onClick={handleSignOut} title="تسجيل الخروج" className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><LogOut className="w-4 h-4" /></button></div></div>
    </aside>
  )
}
