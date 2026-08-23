import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatPrice } from '@/lib/utils'
import { OrderStatus, OrderItem } from '@/types/database'
import { OrderStatusBadge, orderNumber, statusLabels } from '@/components/orders/OrderStatusBadge'
import { CheckCircle2, Circle, PackageCheck, ChefHat, Clock3, Ban, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface TrackingOrder {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  delivery_address: string
  notes: string | null
  subtotal: number
  total: number
  status: OrderStatus
  created_at: string
  items: OrderItem[]
}

const steps: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'Order received', icon: Clock3 },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready', icon: PackageCheck },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
]

const stepIndex: Record<OrderStatus, number> = { pending: 0, confirmed: 1, preparing: 2, ready: 3, completed: 4, cancelled: -1 }

export default async function OrderTrackingPage({ params, searchParams }: { params: { id: string }; searchParams: { token?: string } }) {
  const token = searchParams.token
  if (!token) notFound()

  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_order_tracking', { order_id: params.id, order_token: token })
  if (error || !data) notFound()

  const order = data as unknown as TrackingOrder
  const currentIndex = stepIndex[order.status]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Continue shopping
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <p className="text-amber-300 text-sm font-black uppercase tracking-wider">Order placed successfully</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black">Order {orderNumber(order.id)}</h1>
              <p className="text-slate-300 text-sm mt-2">Created {formatDate(order.created_at)} for {order.customer_name}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {order.status === 'cancelled' ? (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-5 flex gap-3 text-red-800">
              <Ban className="w-5 h-5 shrink-0" />
              <div>
                <h2 className="font-black">Order cancelled</h2>
                <p className="text-sm mt-1">Please contact the store if you have questions about this order.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">Live order tracking</h2>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const active = index <= currentIndex
                  const current = index === currentIndex
                  return (
                    <div key={step.status} className={`rounded-2xl border p-4 ${active ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'} ${current ? 'ring-2 ring-amber-400' : ''}`}>
                      <Icon className="w-5 h-5 mb-2" />
                      <p className="text-sm font-black">{step.label}</p>
                      <p className="text-xs mt-1">{active ? 'Done' : 'Waiting'}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <h3 className="font-black text-slate-900 mb-3">Customer</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-bold text-slate-900">Name:</span> {order.customer_name}</p>
                <p><span className="font-bold text-slate-900">Phone:</span> {order.customer_phone}</p>
                {order.customer_email && <p><span className="font-bold text-slate-900">Email:</span> {order.customer_email}</p>}
                <p><span className="font-bold text-slate-900">Address:</span> {order.delivery_address}</p>
                {order.notes && <p><span className="font-bold text-slate-900">Notes:</span> {order.notes}</p>}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <h3 className="font-black text-slate-900 mb-3">Order summary</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm gap-3">
                    <span className="text-slate-700">{item.quantity} × {item.product_name}</span>
                    <span className="font-bold text-slate-900">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="text-xl font-black text-slate-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400">Bookmark this page to track status updates. Current status: {statusLabels[order.status]}.</p>
        </div>
      </div>
    </div>
  )
}
