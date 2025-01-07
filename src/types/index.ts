export interface User {
  id: string
  name: string
  email?: string
  phone: string
  rewardsPoints: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  inStock: boolean
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  deliveryFee: number
  address: Address
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  instructions?: string
}

export type OrderStatus = 
  | 'pending'
  | 'awaiting_payment'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled' 