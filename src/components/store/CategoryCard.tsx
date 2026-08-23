import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/types/database'
import { ArrowLeft } from 'lucide-react'
import { displayCategoryDescription, displayCategoryName } from '@/lib/i18n'

interface CategoryCardProps {
  category: Category
  productCount?: number
}

export function CategoryCard({ category }: CategoryCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'

  return (
    <Link href={`/categories/${category.slug}`} className="group relative flex flex-col justify-end overflow-hidden rounded-[1.75rem] aspect-[16/10] bg-neutral-950 shadow-sm hover:shadow-xl transition-all duration-300">
      <Image src={category.image_url || defaultImage} alt={displayCategoryName(category.name)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-70 grayscale-[20%] group-hover:scale-105 group-hover:opacity-85 group-hover:grayscale-0 transition-all duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
      <div className="relative p-5 z-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white transition-colors">{displayCategoryName(category.name)}</h3>
            <p className="text-xs text-neutral-300 line-clamp-1 mt-1 leading-5">{displayCategoryDescription(category.description)}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white text-neutral-950 flex items-center justify-center group-hover:scale-110 transition-all shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
