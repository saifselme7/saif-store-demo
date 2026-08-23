import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Order, OrderItem } from '@/types/database'
import { formatDate, formatPrice } from '@/lib/utils'
import { OrderStatusBadge, orderNumber } from '@/components/orders/OrderStatusBadge'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import { ArrowLeft, MapPin, Phone, Mail, StickyNote } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !data) notFound()
  const order = data as unknown as Order & { order_items: OrderItem[] }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title={`Order ${orderNumber(order.id)}`} description={`Placed ${formatDate(order.created_at)} by ${order.customer_name}.`} actionButton={
        <Link href="/admin/orders" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      } />

      <div className="p-6 sm:p-8 max-w-6xl w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Customer</h2>
                  <p className="text-sm text-slate-500 mt-1">Delivery and contact information.</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4"><p className="font-black text-slate-900">{order.customer_name}</p></div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex gap-2"><Phone className="w-4 h-4 text-amber-600" /> {order.customer_phone}</div>
                {order.customer_email && <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex gap-2"><Mail className="w-4 h-4 text-amber-600" /> {order.customer_email}</div>}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex gap-2 sm:col-span-2"><MapPin className="w-4 h-4 text-amber-600 shrink-0" /> {order.delivery_address}</div>
                {order.notes && <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex gap-2 sm:col-span-2"><StickyNote className="w-4 h-4 text-amber-600 shrink-0" /> {order.notes}</div>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900">Items</h2>
                <p className="text-sm text-slate-500 mt-1">Product names and prices are snapshots from order time.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr><th className="px-6 py-3">Product</th><th className="px-6 py-3">Qty</th><th className="px-6 py-3">Unit Price</th><th className="px-6 py-3 text-right">Subtotal</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.order_items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 font-bold text-slate-900">{item.product_name}</td>
                        <td className="px-6 py-4">{item.quantity}</td>
                        <td className="px-6 py-4">{formatPrice(item.unit_price)}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{formatPrice(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6 lg:sticky lg:top-6">
            <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span className="font-bold text-slate-900">{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>Delivery</span><span className="font-bold text-emerald-700">Free</span></div>
              <div className="flex justify-between pt-3 border-t border-slate-100"><span className="font-black text-slate-900">Total</span><span className="text-2xl font-black text-slate-900">{formatPrice(order.total)}</span></div>
            </div>
            {order.public_token && <Link href={`/orders/${order.id}?token=${order.public_token}`} target="_blank" className="block text-center px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm">Open customer tracking</Link>}
          </aside>
        </div>
      </div>
    </div>
  )
}
