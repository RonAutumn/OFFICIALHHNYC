import { create } from 'zustand'
import { CartItem, Product, ProductVariation, OrderType } from '@/types/product'

interface CartStore {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  orderType: OrderType
  addItem: (product: Product, quantity?: number, variation?: ProductVariation) => void
  removeItem: (productId: string, variationName?: string) => void
  updateQuantity: (productId: string, quantity: number, variationName?: string) => void
  clearCart: () => void
  setDeliveryFee: (fee: number) => void
  removeFromCart: (productId: string, variationName?: string) => void
  setOrderType: (type: OrderType) => void
}

const useCart = create<CartStore>((set, get) => ({
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
  orderType: 'delivery',

  addItem: (product, quantity = 1, variation) => {
    set(state => {
      const existingItemIndex = state.items.findIndex(item => 
        item.id === product.id && 
        (!variation || item.selectedVariation?.name === variation.name)
      )

      let newItems: CartItem[]
      if (existingItemIndex > -1) {
        newItems = [...state.items]
        newItems[existingItemIndex].quantity += quantity
      } else {
        const newItem: CartItem = {
          ...product,
          quantity,
          selectedVariation: variation
        }
        newItems = [...state.items, newItem]
      }

      const subtotal = calculateSubtotal(newItems)
      return {
        items: newItems,
        subtotal,
        total: subtotal + state.deliveryFee
      }
    })
  },

  removeItem: (productId, variationName) => {
    set(state => {
      const newItems = state.items.filter(item => 
        item.id !== productId || 
        (variationName && item.selectedVariation?.name !== variationName)
      )
      const subtotal = calculateSubtotal(newItems)
      return {
        items: newItems,
        subtotal,
        total: subtotal + state.deliveryFee
      }
    })
  },

  removeFromCart: (productId, variationName) => {
    set(state => {
      const newItems = state.items.filter(item => 
        item.id !== productId || 
        (variationName && item.selectedVariation?.name !== variationName)
      )
      const subtotal = calculateSubtotal(newItems)
      return {
        items: newItems,
        subtotal,
        total: subtotal + state.deliveryFee
      }
    })
  },

  updateQuantity: (productId, quantity, variationName) => {
    set(state => {
      const newItems = state.items.map(item => {
        if (item.id === productId && (!variationName || item.selectedVariation?.name === variationName)) {
          return { ...item, quantity }
        }
        return item
      })
      const subtotal = calculateSubtotal(newItems)
      return {
        items: newItems,
        subtotal,
        total: subtotal + state.deliveryFee
      }
    })
  },

  clearCart: () => {
    set({
      items: [],
      subtotal: 0,
      total: 0
    })
  },

  setDeliveryFee: (fee) => {
    set(state => ({
      deliveryFee: fee,
      total: state.subtotal + fee
    }))
  },

  setOrderType: (type) => {
    set({ orderType: type })
  }
}))

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const price = item.selectedVariation?.price || item.price
    return total + (price * item.quantity)
  }, 0)
}

export default useCart