import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Order, OrderItem } from '@/types/database'
import { formatDate, formatPrice } from '@/lib/utils'
import { OrderStatusBadge, orderNumber } from '@/components/orders/OrderStatusBadge'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import { ArrowRight, MapPin, Phone, Mail, StickyNote } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', params.id).maybeSingle()
  if (error || !data) notFound()
  const order = data as unknown as Order & { order_items: OrderItem[] }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title={`طلب ${orderNumber(order.id)}`} description={`اتعمل ${formatDate(order.created_at)} باسم ${order.customer_name}.`} actionButton={<Link href="/admin/orders" className="luxury-button px-4 py-2 text-xs sm:text-sm"><ArrowRight className="w-4 h-4" />رجوع للطلبات</Link>} />
      <div className="p-6 sm:p-8 max-w-6xl w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm p-6"><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5"><div><h2 className="text-xl font-black text-neutral-950">بيانات العميل</h2><p className="text-sm text-neutral-500 mt-1">بيانات التواصل والتوصيل.</p></div><OrderStatusBadge status={order.status} /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4"><p className="font-black text-neutral-950">{order.customer_name}</p></div><div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 flex gap-2"><Phone className="w-4 h-4 text-neutral-700" /> <span dir="ltr">{order.customer_phone}</span></div>{order.customer_email && <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 flex gap-2"><Mail className="w-4 h-4 text-neutral-700" /> <span dir="ltr">{order.customer_email}</span></div>}<div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 flex gap-2 sm:col-span-2"><MapPin className="w-4 h-4 text-neutral-700 shrink-0" /> {order.delivery_address}</div>{order.notes && <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 flex gap-2 sm:col-span-2"><StickyNote className="w-4 h-4 text-neutral-700 shrink-0" /> {order.notes}</div>}</div></div>
            <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden"><div className="p-6 border-b border-neutral-100"><h2 className="text-xl font-black text-neutral-950">المنتجات</h2><p className="text-sm text-neutral-500 mt-1">أسماء وأسعار المنتجات محفوظة وقت الطلب.</p></div><div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead className="bg-neutral-50 text-xs text-neutral-500"><tr><th className="px-6 py-3">المنتج</th><th className="px-6 py-3">الكمية</th><th className="px-6 py-3">سعر الوحدة</th><th className="px-6 py-3 text-left">المجموع</th></tr></thead><tbody className="divide-y divide-neutral-100">{order.order_items.map((item) => <tr key={item.id}><td className="px-6 py-4 font-black text-neutral-950">{item.product_name}</td><td className="px-6 py-4">{item.quantity}</td><td className="px-6 py-4" dir="ltr">{formatPrice(item.unit_price)}</td><td className="px-6 py-4 text-left font-black text-neutral-950" dir="ltr">{formatPrice(item.subtotal)}</td></tr>)}</tbody></table></div></div>
          </div>
          <aside className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm p-6 space-y-6 lg:sticky lg:top-6"><OrderStatusSelect orderId={order.id} initialStatus={order.status} /><div className="space-y-3 pt-4 border-t border-neutral-100"><div className="flex justify-between text-sm text-neutral-600"><span>المجموع</span><span className="font-black text-neutral-950" dir="ltr">{formatPrice(order.subtotal)}</span></div><div className="flex justify-between text-sm text-neutral-600"><span>التوصيل</span><span className="font-black text-neutral-950">مجاني</span></div><div className="flex justify-between pt-3 border-t border-neutral-100"><span className="font-black text-neutral-950">الإجمالي</span><span className="text-2xl font-black text-neutral-950" dir="ltr">{formatPrice(order.total)}</span></div></div>{order.public_token && <Link href={`/orders/${order.id}?token=${order.public_token}`} target="_blank" className="block text-center px-4 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-black text-sm">افتح متابعة العميل</Link>}</aside>
        </div>
      </div>
    </div>
  )
}
