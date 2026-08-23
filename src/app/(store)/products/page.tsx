import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { Category, Product } from '@/types/database'
import { displayCategoryName } from '@/lib/i18n'
import { Search, PackageOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ProductsPageProps { searchParams: { category?: string; search?: string; sort?: string } }

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = createClient()
  const { category: categorySlug, search: searchQuery, sort: sortOption } = searchParams
  const { data: categoriesData } = await supabase.from('categories').select('*').order('name', { ascending: true })
  const categories = (categoriesData as Category[]) || []
  const selectedCategoryId = categorySlug ? categories.find((c) => c.slug === categorySlug)?.id || null : null

  let query = supabase.from('products').select(`*, category:categories(*)`)
  if (selectedCategoryId) query = query.eq('category_id', selectedCategoryId)
  if (searchQuery?.trim()) query = query.ilike('name', `%${searchQuery.trim()}%`)
  if (sortOption === 'price-asc') query = query.order('price', { ascending: true })
  else if (sortOption === 'price-desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: productsData } = await query
  const products = (productsData as unknown as Product[]) || []

  const sortLinkClass = (active: boolean) => `px-4 py-2 rounded-full text-xs font-black transition-colors ${active ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <p className="editorial-label">المنتجات</p>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight mt-2">كل منتجات سيف ستور</h1>
        <p className="text-neutral-500 mt-3 text-sm sm:text-base leading-7">دور، فلتر، واختار المنتج المناسب ليك.</p>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form method="GET" className="relative w-full md:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" name="search" defaultValue={searchQuery || ''} placeholder="دور باسم المنتج..." className="w-full pr-10 pl-4 py-3 rounded-full border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-950 text-sm bg-neutral-50" />
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {sortOption && <input type="hidden" name="sort" value={sortOption} />}
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end overflow-x-auto pb-1">
            <span className="text-xs font-black text-neutral-500 whitespace-nowrap">ترتيب:</span>
            <Link href={{ pathname: '/products', query: { ...(categorySlug ? { category: categorySlug } : {}), ...(searchQuery ? { search: searchQuery } : {}), sort: 'newest' } }} className={sortLinkClass(!sortOption || sortOption === 'newest')}>الأحدث</Link>
            <Link href={{ pathname: '/products', query: { ...(categorySlug ? { category: categorySlug } : {}), ...(searchQuery ? { search: searchQuery } : {}), sort: 'price-asc' } }} className={sortLinkClass(sortOption === 'price-asc')}>الأقل سعرًا</Link>
            <Link href={{ pathname: '/products', query: { ...(categorySlug ? { category: categorySlug } : {}), ...(searchQuery ? { search: searchQuery } : {}), sort: 'price-desc' } }} className={sortLinkClass(sortOption === 'price-desc')}>الأعلى سعرًا</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-neutral-100">
          <Link href={{ pathname: '/products', query: { ...(searchQuery ? { search: searchQuery } : {}), ...(sortOption ? { sort: sortOption } : {}) } }} className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black whitespace-nowrap transition-all ${!categorySlug ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>كل الأقسام ({products.length})</Link>
          {categories.map((cat) => <Link key={cat.id} href={{ pathname: '/products', query: { category: cat.slug, ...(searchQuery ? { search: searchQuery } : {}), ...(sortOption ? { sort: sortOption } : {}) } }} className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black whitespace-nowrap transition-all ${categorySlug === cat.slug ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>{displayCategoryName(cat.name)}</Link>)}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-neutral-300 p-8">
          <PackageOpen className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-black text-neutral-950">مفيش منتجات</h3>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">{searchQuery ? `مفيش منتجات باسم "${searchQuery}". جرب كلمة تانية.` : 'مفيش منتجات متاحة في القسم ده حاليًا.'}</p>
          <div className="mt-6 flex justify-center gap-3"><Link href="/products" className="luxury-button px-5 py-3 text-sm">مسح الفلاتر</Link></div>
        </div>
      )}
    </div>
  )
}
