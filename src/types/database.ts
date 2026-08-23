export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  full_name: string | null
  role: 'admin' | 'customer' | 'staff'
  created_at: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
  updated_at?: string
}


export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface Order {
  id: string
  customer_id: string | null
  public_token?: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  delivery_address: string
  notes: string | null
  subtotal: number
  total: number
  status: OrderStatus
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at?: string
  category?: Category | null
}

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: Order
        Insert: {
          id?: string
          customer_id?: string | null
          public_token?: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          delivery_address: string
          notes?: string | null
          subtotal: number
          total: number
          status?: OrderStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          public_token?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          delivery_address?: string
          notes?: string | null
          subtotal?: number
          total?: number
          status?: OrderStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: OrderItem
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: {
          id: string
          full_name?: string | null
          role?: 'admin' | 'customer' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'customer' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_store_order: {
        Args: {
          customer_name: string
          customer_phone: string
          customer_email: string | null
          delivery_address: string
          notes: string | null
          cart_items: Json
        }
        Returns: Json
      }
      get_order_tracking: {
        Args: {
          order_id: string
          order_token: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
