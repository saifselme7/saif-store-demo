import React from 'react'
import { OrderStatus } from '@/types/database'

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  preparing: 'bg-orange-50 text-orange-800 border-orange-200',
  ready: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  completed: 'bg-slate-900 text-white border-slate-900',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  )
}

export function orderNumber(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}
