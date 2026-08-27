'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Product } from '@/types/database'

export interface CartItem {
  product_id: string
  name: string
  slug: string
  image_url: string | null
  unit_price: number
  quantity: number
  is_available: boolean
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: Product, quantity?: number) => { ok: boolean; message: string }
  removeItem: (productId: string) => void
  increaseItem: (productId: string) => void
  decreaseItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const STORAGE_KEY = 'saif-store-cart-v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((item) => item.product_id && item.quantity > 0))
        }
      }
    } catch (error) {
      console.error('Failed to load cart', error)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.quantity * Number(item.unit_price), 0)

    return {
      items,
      itemCount,
      subtotal,
      addItem(product, quantity = 1) {
        if (!product.id || !product.is_available) {
          return { ok: false, message: 'This product is currently unavailable.' }
        }
        const safeQuantity = Math.max(1, Math.min(99, Math.floor(quantity)))
        setItems((previous) => {
          const existing = previous.find((item) => item.product_id === product.id)
          if (existing) {
            return previous.map((item) =>
              item.product_id === product.id
                ? { ...item, quantity: Math.min(99, item.quantity + safeQuantity), unit_price: Number(product.price), is_available: product.is_available }
                : item
            )
          }
          return [
            ...previous,
            {
              product_id: product.id,
              name: product.name,
              slug: product.slug,
              image_url: product.image_url,
              unit_price: Number(product.price),
              quantity: safeQuantity,
              is_available: product.is_available,
            },
          ]
        })
        return { ok: true, message: `${product.name} added to your cart.` }
      },
      removeItem(productId) {
        setItems((previous) => previous.filter((item) => item.product_id !== productId))
      },
      increaseItem(productId) {
        setItems((previous) => previous.map((item) => item.product_id === productId ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item))
      },
      decreaseItem(productId) {
        setItems((previous) => previous
          .map((item) => item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item)
          .filter((item) => item.quantity > 0)
        )
      },
      setQuantity(productId, quantity) {
        const safeQuantity = Math.max(0, Math.min(99, Math.floor(quantity || 0)))
        setItems((previous) => previous
          .map((item) => item.product_id === productId ? { ...item, quantity: safeQuantity } : item)
          .filter((item) => item.quantity > 0)
        )
      },
      clearCart() {
        setItems([])
      },
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
