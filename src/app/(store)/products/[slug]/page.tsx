import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Product } from '@/types/database'
import { formatPrice, formatDate } from '@/lib/utils'
import { displayCategoryName, displayProductDescription } from '@/lib/i18n'
import { ArrowRight, CheckCircle2, XCircle, Tag, Sparkles, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ProductDetailPageProps { params: { slug: string } }

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = createClient()
  const { data: productData, error } = await supabase.from('products').select(`*, category:categories(*)`).eq('slug', params.slug).maybeSingle()
  if (error || !productData) notFound()
  const product = productData as unknown as Product
  const { data: relatedProductsData } = await supabase.from('products').select(`*, category:categories(*)`).eq('category_id', product.category_id || '').neq('id', product.id).limit(4)
  const relatedProducts = (relatedProductsData as unknown as Product[]) || []
  const defaultImage = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors"><ArrowRight className="w-4 h-4" /> رجوع لكل المنتجات</Link>

      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden p-5 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="relative aspect-[4/3] rounded-[1.75rem] overflow-hidden bg-neutral-100 shadow-sm">
            <Image src={product.image_url || defaultImage} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute top-4 right-4">
              {product.is_available ? <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-white text-neutral-950 shadow-sm"><CheckCircle2 className="w-4 h-4" />متاح وجاهز</span> : <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-neutral-950 text-white shadow-sm"><XCircle className="w-4 h-4" />غير متاح حاليًا</span>}
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {product.category && <Link href={`/categories/${product.category.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-neutral-100 text-neutral-950 hover:bg-neutral-200 transition-colors"><Tag className="w-4 h-4" /><span>{displayCategoryName(product.category.name)}</span></Link>}
              <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">{product.name}</h1>
              <div><span className="text-xs text-neutral-400 block font-black">السعر</span><span className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight" dir="ltr">{formatPrice(product.price)}</span></div>
              <div className="pt-4 text-neutral-600 leading-8"><h2 className="text-sm font-black text-neutral-950 mb-2">الوصف</h2><p>{displayProductDescription(product.slug, product.description)}</p></div>
            </div>

            <AddToCartButton product={product} />

            <div className="p-4 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs text-neutral-500">
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 font-bold text-neutral-700"><Sparkles className="w-3.5 h-3.5" />متزامن مع الداتابيز</span><span className="text-neutral-400 font-mono" dir="ltr">ID: {product.id.slice(0, 8)}...</span></div>
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />اتضاف</span><span>{formatDate(product.created_at)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && <div className="space-y-6 pt-6"><h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">منتجات تانية من {product.category ? displayCategoryName(product.category.name) : 'نفس القسم'}</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{relatedProducts.map((relProduct) => <ProductCard key={relProduct.id} product={relProduct} />)}</div></div>}
    </div>
  )
}
