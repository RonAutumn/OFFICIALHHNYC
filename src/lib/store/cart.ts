import { create } from 'zustand';
import { Product } from '@/lib/airtable';

interface CartItem extends Product {
  quantity: number;
  selectedVariation?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, selectedVariation?: string) => void;
  removeItem: (productId: string, selectedVariation?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariation?: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
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
          },
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
      items: state.items.map(item => {
        if (item.id === productId && item.selectedVariation === selectedVariation) {
          return { ...item, quantity };
        }
        return item;
      }),
    }));
  },
  clearCart: () => set({ items: [] }),
})); 