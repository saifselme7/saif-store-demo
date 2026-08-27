import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { Category, Product } from '@/types/database'
import { displayCategoryDescription, displayCategoryName, itemCountLabel } from '@/lib/i18n'
import { ArrowRight, Layers, PackageOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CategoryPageProps { params: { slug: string } }

export default async function CategoryPage({ params }: CategoryPageProps) {
  const supabase = createClient()
  const { data: categoryData, error } = await supabase.from('categories').select('*').eq('slug', params.slug).maybeSingle()
  if (error || !categoryData) notFound()
  const category = categoryData as Category
  const { data: productsData } = await supabase.from('products').select(`*, category:categories(*)`).eq('category_id', category.id).order('created_at', { ascending: false })
  const products = (productsData as unknown as Product[]) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors"><ArrowRight className="w-4 h-4" /> رجوع للمنتجات</Link>

      <div className="relative rounded-[2rem] overflow-hidden bg-neutral-950 p-8 sm:p-12 text-white shadow-xl">
        {category.image_url && <Image src={category.image_url} alt={displayCategoryName(category.name)} fill priority sizes="100vw" className="object-cover opacity-35 grayscale" />}
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/50 to-black/20" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-white text-neutral-950"><Layers className="w-4 h-4" /><span>قسم مختار</span></div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{displayCategoryName(category.name)}</h1>
          <p className="text-neutral-200 text-sm sm:text-base leading-8 pt-1">{displayCategoryDescription(category.description)}</p>
          <p className="text-xs text-neutral-300 font-bold pt-2">{itemCountLabel(products.length)}</p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-neutral-300 p-8">
          <PackageOpen className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-black text-neutral-950">مفيش منتجات في القسم ده حاليًا</h3>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">أي منتج تضيفه للقسم من لوحة التحكم هيظهر هنا تلقائيًا.</p>
          <div className="mt-6 flex justify-center gap-3"><Link href="/admin/products/new" className="luxury-button px-5 py-3 text-sm">إضافة منتج للقسم</Link></div>
        </div>
      )}
    </div>
  )
}
