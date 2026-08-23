import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-stone-50 border-b border-neutral-200">
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(#000_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs font-black shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>سيف ستور — اختيار مصري بطابع بريميوم</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-neutral-950 tracking-tight leading-[1.05]">
                منتجات مختارة<br />بتفاصيل تليق بيك.
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 leading-8 max-w-2xl">
                تجربة تسوق بسيطة وواضحة. اختار المنتج، ضيفه للسلة، وأكد طلبك في ثواني — وكل الأسعار والتوافر متحدثين مباشرة من الداتابيز.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/products" className="luxury-button px-7 py-4 text-sm sm:text-base">
                <span>اتفرج على المنتجات</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/cart" className="luxury-button-secondary px-7 py-4 text-sm sm:text-base">
                <ShoppingBag className="w-4 h-4" />
                <span>افتح السلة</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 max-w-3xl">
              {[
                ['طلبات حقيقية', 'كل طلب بيتسجل في Supabase'],
                ['أسعار موثوقة', 'الإجمالي بيتحسب من الداتابيز'],
                ['متابعة واضحة', 'اعرف حالة طلبك خطوة بخطوة'],
              ].map(([title, body]) => (
                <div key={title} className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-neutral-950 mb-3" />
                  <p className="font-black text-neutral-950 text-sm">{title}</p>
                  <p className="text-xs text-neutral-500 mt-1 leading-5">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-[2rem] bg-neutral-950 text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-white/10" />
              <div className="relative">
                <p className="editorial-label text-neutral-400">SAIF STORE</p>
                <h2 className="text-4xl sm:text-5xl font-black mt-4 leading-tight">أبيض وأسود. واضح. وراقي.</h2>
              </div>
              <div className="relative border-t border-white/15 pt-6 space-y-3">
                <p className="text-neutral-300 leading-7">واجهة بسيطة بتخلي المنتج هو البطل، وتجربة طلب سريعة من غير دوشة.</p>
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>تسوق بثقة</span>
                  <span dir="ltr">EGP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
