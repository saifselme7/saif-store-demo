'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { OrderStatus } from '@/types/database'
import { AlertCircle, Check, Loader2 } from 'lucide-react'

const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
const labels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function OrderStatusSelect({ orderId, initialStatus }: { orderId: string; initialStatus: OrderStatus }) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleChange = async (nextStatus: OrderStatus) => {
    setStatus(nextStatus)
    setSaving(true)
    setFeedback(null)
    try {
      const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId)
      if (error) throw error
      setFeedback({ type: 'success', message: `Status updated to ${labels[nextStatus]}.` })
      router.refresh()
    } catch (err: any) {
      setStatus(initialStatus)
      setFeedback({ type: 'error', message: err.message || 'Failed to update status.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Order status</label>
      <div className="flex items-center gap-2">
        <select value={status} onChange={(e) => handleChange(e.target.value as OrderStatus)} disabled={saving} className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60">
          {statuses.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
        </select>
        {saving && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
      </div>
      {feedback && (
        <p className={`text-xs flex items-center gap-1.5 ${feedback.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
          {feedback.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {feedback.message}
        </p>
      )}
    </div>
  )
}
