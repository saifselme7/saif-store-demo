import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatPrice } from '@/lib/utils'
import { OrderStatus, OrderItem } from '@/types/database'
import { OrderStatusBadge, orderNumber, statusLabels } from '@/components/orders/OrderStatusBadge'
import { CheckCircle2, PackageCheck, ChefHat, Clock3, Ban, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface TrackingOrder { id: string; customer_name: string; customer_phone: string; customer_email: string | null; delivery_address: string; notes: string | null; subtotal: number; total: number; status: OrderStatus; created_at: string; items: OrderItem[] }

const steps: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'مستني التأكيد', icon: Clock3 },
  { status: 'confirmed', label: 'اتأكد', icon: CheckCircle2 },
  { status: 'preparing', label: 'بيتجهز', icon: ChefHat },
  { status: 'ready', label: 'جاهز', icon: PackageCheck },
  { status: 'completed', label: 'اتسلّم', icon: CheckCircle2 },
]
const stepIndex: Record<OrderStatus, number> = { pending: 0, confirmed: 1, preparing: 2, ready: 3, completed: 4, cancelled: -1 }

export default async function OrderTrackingPage({ params, searchParams }: { params: { id: string }; searchParams: { token?: string } }) {
  if (!searchParams.token) notFound()
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_order_tracking', { order_id: params.id, order_token: searchParams.token })
  if (error || !data) notFound()
  const order = data as unknown as TrackingOrder
  const currentIndex = stepIndex[order.status]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-black text-neutral-600 hover:text-neutral-950"><ArrowRight className="w-4 h-4" /> كمل تسوق</Link>

      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-neutral-100 bg-neutral-950 text-white">
          <p className="text-neutral-400 text-sm font-black">طلبك اتسجل بنجاح</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-3">
            <div><h1 className="text-3xl sm:text-5xl font-black">طلب {orderNumber(order.id)}</h1><p className="text-neutral-300 text-sm mt-2">اتعمل {formatDate(order.created_at)} باسم {order.customer_name}</p></div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {order.status === 'cancelled' ? <div className="rounded-3xl bg-red-50 border border-red-200 p-5 flex gap-3 text-red-800"><Ban className="w-5 h-5 shrink-0" /><div><h2 className="font-black">الطلب اتلغى</h2><p className="text-sm mt-1">كلمنا لو عندك أي سؤال بخصوص الطلب.</p></div></div> : (
            <div className="space-y-4"><h2 className="text-xl font-black text-neutral-950">متابعة الطلب</h2><div className="grid grid-cols-1 sm:grid-cols-5 gap-3">{steps.map((step, index) => { const Icon = step.icon; const active = index <= currentIndex; const current = index === currentIndex; return <div key={step.status} className={`rounded-3xl border p-4 ${active ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-400'} ${current ? 'ring-2 ring-neutral-400' : ''}`}><Icon className="w-5 h-5 mb-2" /><p className="text-sm font-black">{step.label}</p><p className="text-xs mt-1">{active ? 'تم' : 'مستني'}</p></div> })}</div></div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-neutral-50 border border-neutral-200 p-5"><h3 className="font-black text-neutral-950 mb-3">بيانات العميل</h3><div className="space-y-2 text-sm text-neutral-600 leading-7"><p><span className="font-black text-neutral-950">الاسم:</span> {order.customer_name}</p><p><span className="font-black text-neutral-950">الموبايل:</span> <span dir="ltr">{order.customer_phone}</span></p>{order.customer_email && <p><span className="font-black text-neutral-950">الإيميل:</span> <span dir="ltr">{order.customer_email}</span></p>}<p><span className="font-black text-neutral-950">العنوان:</span> {order.delivery_address}</p>{order.notes && <p><span className="font-black text-neutral-950">ملاحظات:</span> {order.notes}</p>}</div></div>
            <div className="rounded-3xl bg-neutral-50 border border-neutral-200 p-5"><h3 className="font-black text-neutral-950 mb-3">ملخص الطلب</h3><div className="space-y-3">{order.items.map((item) => <div key={item.id} className="flex items-center justify-between text-sm gap-3"><span className="text-neutral-700">{item.quantity} × {item.product_name}</span><span className="font-black text-neutral-950" dir="ltr">{formatPrice(item.subtotal)}</span></div>)}<div className="pt-3 border-t border-neutral-200 flex items-center justify-between"><span className="font-black text-neutral-950">الإجمالي</span><span className="text-xl font-black text-neutral-950" dir="ltr">{formatPrice(order.total)}</span></div></div></div>
          </div>
          <p className="text-xs text-neutral-400">احفظ الصفحة دي عشان تتابع الطلب. الحالة الحالية: {statusLabels[order.status]}.</p>
        </div>
      </div>
    </div>
  )
}
