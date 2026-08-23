import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/database'
import { formatPrice } from '@/lib/utils'
import { displayCategoryName, displayProductDescription } from '@/lib/i18n'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'

  return (
    <article className="group flex flex-col bg-white border border-neutral-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden rounded-[1.75rem]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <Image src={product.image_url || defaultImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover grayscale-[12%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500" />
        <div className="absolute top-3 right-3">
          {product.is_available ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white text-neutral-950 border border-neutral-200 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" /> متاح
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-neutral-950 text-white shadow-sm">
              <XCircle className="w-3.5 h-3.5" /> غير متاح
            </span>
          )}
        </div>
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-neutral-950/80 text-white backdrop-blur">
              {displayCategoryName(product.category.name)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-black text-neutral-950 text-lg group-hover:text-neutral-700 transition-colors line-clamp-1">{product.name}</h3>
        <p className="mt-2 text-sm text-neutral-500 line-clamp-2 leading-7 flex-1">
          {displayProductDescription(product.slug, product.description)}
        </p>
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-end justify-between gap-3">
          <div>
            <span className="text-xs text-neutral-400 font-bold block">السعر</span>
            <span className="text-xl font-black text-neutral-950 tracking-tight" dir="ltr">{formatPrice(product.price)}</span>
          </div>
          <div className="flex items-center gap-2">
            <AddToCartButton product={product} compact />
            <Link href={`/products/${product.slug}`} className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold bg-neutral-100 text-neutral-950 hover:bg-neutral-950 hover:text-white transition-all">
              <span>التفاصيل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
