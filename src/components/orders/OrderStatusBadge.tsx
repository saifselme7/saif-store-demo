import React from 'react'
import { OrderStatus } from '@/types/database'
import { orderStatusArabic, shortOrderNumber } from '@/lib/i18n'

export const statusLabels = orderStatusArabic

export const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  confirmed: 'bg-neutral-100 text-neutral-950 border-neutral-300',
  preparing: 'bg-orange-50 text-orange-900 border-orange-200',
  ready: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  completed: 'bg-neutral-950 text-white border-neutral-950',
  cancelled: 'bg-red-50 text-red-900 border-red-200',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${statusStyles[status]}`}>{statusLabels[status]}</span>
}

export function orderNumber(id: string) {
  return shortOrderNumber(id)
}
