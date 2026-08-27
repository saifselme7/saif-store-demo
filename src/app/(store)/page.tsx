import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeroBanner } from '@/components/store/HeroBanner'
import { ProductCard } from '@/components/store/ProductCard'
import { CategoryCard } from '@/components/store/CategoryCard'
import { Product, Category } from '@/types/database'
import { ArrowLeft, Sparkles, Layers, Coffee } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()

  const { data: categoriesData } = await supabase.from('categories').select('*').order('name', { ascending: true })
  const { data: productsData } = await supabase.from('products').select(`*, category:categories(*)`).order('created_at', { ascending: false }).limit(8)

  const categories = (categoriesData as Category[]) || []
  const products = (productsData as unknown as Product[]) || []

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <HeroBanner />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 editorial-label mb-2"><Layers className="w-4 h-4" /><span>الأقسام</span></div>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">تسوق حسب مزاجك</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-black text-neutral-950 hover:text-neutral-600 transition-colors">
            <span>شوف المنيو كامل</span><ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</div>
        ) : (
          <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-neutral-300 p-8">
            <Layers className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-700 font-bold">مفيش أقسام متسجلة حاليًا.</p>
            <p className="text-xs text-neutral-400 mt-1">ضيف أقسام من لوحة التحكم عشان تظهر هنا.</p>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 editorial-label mb-2"><Sparkles className="w-4 h-4" /><span>اختيارات مميزة</span></div>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">الأكثر طلبًا</h2>
            <p className="text-sm text-neutral-500 mt-2 leading-7">منتجات مختارة من سيف ستور، جاهزة تضيفها لسلتك بسرعة.</p>
          </div>
          <Link href="/products" className="luxury-button px-5 py-3 text-sm"><span>عرض كل المنتجات</span><ArrowLeft className="w-4 h-4" /></Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-neutral-300 p-8">
            <Coffee className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-neutral-950">مفيش منتجات</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">ضيف أول منتج من لوحة التحكم عشان يظهر في المتجر.</p>
            <Link href="/admin/products/new" className="luxury-button px-5 py-3 mt-4 text-sm">ضيف أول منتج</Link>
          </div>
        )}
      </section>
    </div>
  )
}
