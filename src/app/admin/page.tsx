import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { StatsCard } from '@/components/admin/StatsCard'
import { Product, Category, Order } from '@/types/database'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, Layers, CheckCircle2, XCircle, PlusCircle, ArrowLeft, TrendingUp, Edit, ShoppingBag, Clock3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const { data: productsData } = await supabase.from('products').select(`*, category:categories(*)`).order('created_at', { ascending: false })
  const { data: categoriesData } = await supabase.from('categories').select('*')
  const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  const products = (productsData as unknown as Product[]) || []
  const categories = (categoriesData as Category[]) || []
  const orders = (ordersData as Order[]) || []
  const totalProducts = products.length
  const availableProducts = products.filter((p) => p.is_available).length
  const unavailableProducts = totalProducts - availableProducts
  const todayKey = new Date().toISOString().slice(0, 10)
  const recentProducts = products.slice(0, 5)

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="لوحة التحكم" description="تابع المنتجات والطلبات وأداء المتجر من مكان واحد." actionButton={<Link href="/admin/products/new" className="luxury-button px-4 py-2 text-xs sm:text-sm"><PlusCircle className="w-4 h-4" /><span>إضافة منتج</span></Link>} />
      <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard title="إجمالي المنتجات" value={totalProducts} subtitle="عدد المنتجات في الكتالوج" icon={Package} colorScheme="neutral" />
          <StatsCard title="المتاح في المتجر" value={availableProducts} subtitle="منتجات متاحة للعملاء" icon={CheckCircle2} colorScheme="emerald" />
          <StatsCard title="غير متاح" value={unavailableProducts} subtitle="متوقف مؤقتًا" icon={XCircle} colorScheme="red" />
          <StatsCard title="أقسام المتجر" value={categories.length} subtitle="أقسام نشطة" icon={Layers} colorScheme="blue" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard title="إجمالي الطلبات" value={orders.length} subtitle="طلبات حقيقية من Supabase" icon={ShoppingBag} colorScheme="neutral" />
          <StatsCard title="مستنية التأكيد" value={orders.filter((o) => o.status === 'pending').length} subtitle="في انتظار التأكيد" icon={Clock3} colorScheme="red" />
          <StatsCard title="طلبات النهارده" value={orders.filter((o) => o.created_at?.slice(0, 10) === todayKey).length} subtitle="اتعملت النهارده" icon={TrendingUp} colorScheme="blue" />
          <StatsCard title="اتسلمت" value={orders.filter((o) => o.status === 'completed').length} subtitle="اتسلمت بنجاح" icon={CheckCircle2} colorScheme="emerald" />
        </div>

        <div className="bg-neutral-950 text-white rounded-[2rem] p-6 sm:p-8 border border-neutral-900 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6"><div className="space-y-2 max-w-2xl"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-neutral-200 border border-white/10"><TrendingUp className="w-3.5 h-3.5" />داتابيز Supabase مباشرة</span><h2 className="text-xl sm:text-2xl font-black">إدارة سيف ستور</h2><p className="text-neutral-300 text-xs sm:text-sm leading-7">أي تعديل في الأسعار أو المنتجات أو الأقسام بيتحدث فورًا في الداتابيز وبيظهر للعملاء في المتجر.</p></div><div className="flex flex-wrap gap-3"><Link href="/admin/products" className="luxury-button-secondary px-4 py-2.5 text-xs sm:text-sm">إدارة المنتجات</Link><Link href="/admin/categories" className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 transition-all">إدارة الأقسام</Link></div></div>
        </div>

        <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between gap-4"><div><h3 className="font-black text-neutral-950 text-base">أحدث المنتجات</h3><p className="text-xs text-neutral-500 mt-1">آخر منتجات متزامنة في الداتابيز</p></div><Link href="/admin/products" className="inline-flex items-center gap-1 text-xs font-black text-neutral-700 hover:text-neutral-950"><span>عرض كل المنتجات</span><ArrowLeft className="w-3.5 h-3.5" /></Link></div>
          <div className="overflow-x-auto"><table className="w-full text-right text-sm text-neutral-600"><thead className="bg-neutral-50 text-[11px] text-neutral-500 font-black border-b border-neutral-100"><tr><th className="px-6 py-3.5">المنتج</th><th className="px-6 py-3.5">السعر</th><th className="px-6 py-3.5">الحالة</th><th className="px-6 py-3.5">اتضاف</th><th className="px-6 py-3.5 text-left">إجراء</th></tr></thead><tbody className="divide-y divide-neutral-100">{recentProducts.length > 0 ? recentProducts.map((product) => <tr key={product.id} className="hover:bg-neutral-50 transition-colors"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200"><Image src={product.image_url || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80'} alt={product.name} fill className="object-cover" /></div><div><p className="font-black text-neutral-950 text-sm line-clamp-1">{product.name}</p><p className="text-xs text-neutral-400 font-mono" dir="ltr">/{product.slug}</p></div></div></td><td className="px-6 py-4 font-black text-neutral-950" dir="ltr">{formatPrice(product.price)}</td><td className="px-6 py-4">{product.is_available ? <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">متاح</span> : <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200">غير متاح</span>}</td><td className="px-6 py-4 text-xs text-neutral-500">{formatDate(product.created_at)}</td><td className="px-6 py-4 text-left"><Link href={`/admin/products/${product.id}/edit`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-950 bg-neutral-100 hover:bg-neutral-200"><Edit className="w-3.5 h-3.5" />تعديل</Link></td></tr>) : <tr><td colSpan={5} className="px-6 py-10 text-center text-neutral-400">مفيش منتجات متسجلة حاليًا.</td></tr>}</tbody></table></div>
        </div>
      </div>
    </div>
  )
}
