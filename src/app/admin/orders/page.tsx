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
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
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
      <AdminHeader title="Orders" description="View customer orders, filter by status, and manage fulfillment." />

      <div className="p-6 sm:p-8 max-w-7xl w-full space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link key={filter.value} href={filter.value === 'all' ? '/admin/orders' : `/admin/orders?status=${filter.value}`} className={`px-3 py-2 rounded-xl text-xs font-black transition-colors ${status === filter.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {filter.label}
            </Link>
          ))}
        </div>

        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">Could not load orders. Make sure the orders migration has been applied.</div>}

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length > 0 ? orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{orderNumber(order.id)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{order.customer_name}</td>
                    <td className="px-6 py-4">{order.customer_phone}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-xs">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <Inbox className="w-10 h-10 mx-auto mb-3" />
                      No orders found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
