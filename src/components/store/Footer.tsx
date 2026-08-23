import React from 'react'
import Link from 'next/link'
import { Store, Shield } from 'lucide-react'

export function StoreFooter() {
  return (
    <footer className="mt-auto bg-neutral-950 text-neutral-300 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-neutral-950 flex items-center justify-center font-black">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">SAIF<span className="text-neutral-500">STORE</span></span>
            </div>
            <p className="text-sm text-neutral-400 leading-7">سيف ستور تجربة تسوق مصرية راقية، منتجات واضحة، أسعار حقيقية، وطلب سريع متصل مباشرة بالداتابيز.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 font-bold">
              <span>الأسعار بالجنيه المصري</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">كل المنتجات</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">السلة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black text-white mb-4">الأقسام</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/categories/coffee-espresso" className="hover:text-white transition-colors">قهوة وإسبريسو</Link></li>
              <li><Link href="/categories/burgers-sandwiches" className="hover:text-white transition-colors">برجر وسندوتشات</Link></li>
              <li><Link href="/categories/desserts-sweets" className="hover:text-white transition-colors">حلويات</Link></li>
              <li><Link href="/categories/cold-beverages" className="hover:text-white transition-colors">مشروبات باردة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black text-white mb-4">إدارة المتجر</h4>
            <p className="text-xs text-neutral-400 mb-4 leading-6">المدير يقدر يحدّث المنتجات والأسعار والطلبات مباشرة.</p>
            <Link href="/admin" className="luxury-button-secondary px-5 py-3 text-sm">
              <Shield className="w-4 h-4" />
              <span>لوحة التحكم</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} SAIF STORE. كل البيانات متصلة بـ Supabase.</p>
          <p>مبني بـ Next.js و Supabase و Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
