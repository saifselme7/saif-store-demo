import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Order, OrderStatus } from '@/types/database'
import { formatDate, formatPrice } from '@/lib/utils'
import { OrderStatusBadge, orderNumber } from '@/components/orders/OrderStatusBadge'
import { Eye, Inbox } from 'lucide-react'

export const dynamic = 'force-dynamic'

const filters: { label: string; value: 'all' | OrderStatus }[] = [
  { label: 'الكل', value: 'all' }, { label: 'مستني التأكيد', value: 'pending' }, { label: 'اتأكد', value: 'confirmed' }, { label: 'بيتجهز', value: 'preparing' }, { label: 'جاهز', value: 'ready' }, { label: 'اتسلّم', value: 'completed' }, { label: 'اتلغى', value: 'cancelled' },
]

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createClient()
  const status = (searchParams.status || 'all') as 'all' | OrderStatus
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  const orders = (data as Order[]) || []

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="الطلبات" description="تابع طلبات العملاء وغيّر حالة كل طلب." />
      <div className="p-6 sm:p-8 max-w-7xl w-full space-y-6">
        <div className="bg-white p-4 rounded-[2rem] border border-neutral-200 shadow-sm flex flex-wrap gap-2">{filters.map((filter) => <Link key={filter.value} href={filter.value === 'all' ? '/admin/orders' : `/admin/orders?status=${filter.value}`} className={`px-4 py-2 rounded-full text-xs font-black transition-colors ${status === filter.value ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{filter.label}</Link>)}</div>
        {error && <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm">معرفناش نحمّل الطلبات. اتأكد إن migration الطلبات اتطبق.</div>}
        <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-right text-sm text-neutral-600"><thead className="bg-neutral-50 text-[11px] text-neutral-500 font-black border-b border-neutral-100"><tr><th className="px-6 py-3.5">الطلب</th><th className="px-6 py-3.5">العميل</th><th className="px-6 py-3.5">الموبايل</th><th className="px-6 py-3.5">الإجمالي</th><th className="px-6 py-3.5">الحالة</th><th className="px-6 py-3.5">التاريخ</th><th className="px-6 py-3.5 text-left">إجراءات</th></tr></thead><tbody className="divide-y divide-neutral-100">{orders.length > 0 ? orders.map((order) => <tr key={order.id} className="hover:bg-neutral-50"><td className="px-6 py-4 font-mono font-bold text-neutral-950" dir="ltr">{orderNumber(order.id)}</td><td className="px-6 py-4 font-black text-neutral-950">{order.customer_name}</td><td className="px-6 py-4" dir="ltr">{order.customer_phone}</td><td className="px-6 py-4 font-black text-neutral-950" dir="ltr">{formatPrice(order.total)}</td><td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td><td className="px-6 py-4 text-xs">{formatDate(order.created_at)}</td><td className="px-6 py-4 text-left"><Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-950 bg-neutral-100 hover:bg-neutral-200"><Eye className="w-3.5 h-3.5" />عرض</Link></td></tr>) : <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-400"><Inbox className="w-10 h-10 mx-auto mb-3" />مفيش طلبات في الفلتر ده.</td></tr>}</tbody></table></div></div>
      </div>
    </div>
  )
}
