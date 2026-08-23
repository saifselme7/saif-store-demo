'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, Menu, X, Shield, Search } from 'lucide-react'
import { CartBadge } from '@/components/cart/CartBadge'

export function StoreNavbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'الرئيسية', href: '/' },
    { label: 'المنتجات', href: '/products' },
    { label: 'السلة', href: '/cart' },
  ]

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur border-b border-neutral-200 shadow-sm' : 'bg-stone-50/95 border-b border-neutral-200/70'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-3 group" aria-label="سيف ستور الرئيسية">
            <div className="w-10 h-10 rounded-full bg-neutral-950 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-neutral-950 flex items-center gap-1.5">
                SAIF<span className="text-neutral-500">STORE</span>
              </span>
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                براند مصري بريميوم
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link key={link.href} href={link.href} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${isActive ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'}`}>
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/products" className="p-2 text-neutral-500 hover:text-neutral-950 hover:bg-white rounded-full transition-colors md:hidden" aria-label="دور على المنتجات">
              <Search className="w-5 h-5" />
            </Link>
            <CartBadge />
            <Link href="/admin" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-neutral-950 bg-white hover:bg-neutral-100 rounded-full transition-all border border-neutral-200 shadow-sm">
              <Shield className="w-4 h-4 text-neutral-700" />
              <span>لوحة التحكم</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-white rounded-full md:hidden transition-colors" aria-label="افتح أو اقفل القائمة">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${isActive ? 'bg-neutral-950 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}>
                {link.label}
              </Link>
            )
          })}
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-2xl text-sm font-bold text-neutral-700 hover:bg-neutral-100">
            لوحة التحكم
          </Link>
        </div>
      )}
    </header>
  )
}
