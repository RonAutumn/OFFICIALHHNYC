import { create } from 'zustand';
import { Product } from '@/types/product';
import { CartItem } from '@/types/cart';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, selectedVariation?: string) => void;
  removeItem: (productId: string, selectedVariation?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariation?: string) => void;
  clearCart: () => void;
  getFormattedItems: () => string;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product, selectedVariation) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        item => item.id === product.id && item.selectedVariation === selectedVariation
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += 1;
        return { items: newItems };
      }

      // Add new item
      return {
        items: [
          ...state.items,
          {
            ...product,
            quantity: 1,
            selectedVariation,
          } as CartItem,
        ],
      };
    });
  },
  removeItem: (productId, selectedVariation) => {
    set((state) => ({
      items: state.items.filter(
        item => !(item.id === productId && item.selectedVariation === selectedVariation)
      ),
    }));
  },
  updateQuantity: (productId, quantity, selectedVariation) => {
    set((state) => ({
      items: state.items.map(item => 
        item.id === productId && item.selectedVariation === selectedVariation
          ? { ...item, quantity }
          : item
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  getFormattedItems: () => {
    const { items } = get();
    return items.map(item => `${item.name} (${item.quantity})`).join(', ');
  },
  getSubtotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  },
  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  },
})); 