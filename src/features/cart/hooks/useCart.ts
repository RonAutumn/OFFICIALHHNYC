import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types/cart';

// ============================================================
// CONFIGURATION
// ============================================================

type OrderType = 'delivery' | 'shipping';

// Maximum allowed quantity per item and per order
const MAX_QUANTITY_PER_ITEM = 10;

// ============================================================
// CART STORE INTERFACE
// Integration Point: Frontend components use these methods
// ============================================================

interface CartStore {
  // State
  items: CartItem[];
  orderType: OrderType;
  deliveryFee: number;
  initialized: boolean;

  // Cart Operations
  addToCart: (item: CartItem) => { success: boolean; error?: string };
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => { success: boolean; error?: string };
  
  // Order Type Operations
  setOrderType: (type: OrderType) => void;
  setDeliveryFee: (fee: number) => void;
  
  // Cart Management
  clearCart: () => void;
  resetCartStorage: () => void;
  initializeCart: () => void;
  
  // Calculations
  getSubtotal: () => number;
  getTotal: () => number;
}

// ============================================================
// CART STORE IMPLEMENTATION
// Integration Point: Backend API endpoints for order processing
// ============================================================

const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      orderType: 'delivery',
      deliveryFee: 0,
      initialized: false,
      
      // =============================
      // Cart Initialization
      // =============================
      initializeCart: () => {
        set({ initialized: true });
      },

      // =============================
      // Cart Item Management
      // =============================
      
      // Add Item to Cart
      // Integration Point: Product data from product listing
      addToCart: (item) => {
        const items = get().items;
        
        // Validate item data
        if (!item || !item.id || !item.name || typeof item.price !== 'number' || item.quantity < 1) {
          return { 
            success: false, 
            error: 'Invalid item data: Missing required fields or invalid price' 
          };
        }
        
        // Check for existing item
        const existingItemIndex = items.findIndex(i => i.id === item.id);
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += item.quantity;
          
          // Validate maximum quantity
          if (updatedItems[existingItemIndex].quantity > MAX_QUANTITY_PER_ITEM) {
            return { 
              success: false, 
              error: `Maximum quantity (${MAX_QUANTITY_PER_ITEM}) exceeded` 
            };
          }
          
          set({ items: updatedItems });
          return { success: true, error: undefined };
        }
        
        // Add new item
        set({ items: [...items, item] });
        return { success: true, error: undefined };
      },

      // Remove Item from Cart
      removeFromCart: (itemId) => {
        const items = get().items;
        set({ items: items.filter(item => item.id !== itemId) });
      },

      // Update Item Quantity
      // Integration Point: Cart UI quantity controls
      updateQuantity: (itemId, quantity) => {
        try {
          const items = get().items;
          
          // Validate quantity
          if (quantity < 1) {
            return { 
              success: false, 
              error: 'Quantity must be at least 1' 
            };
          }
          
          if (quantity > MAX_QUANTITY_PER_ITEM) {
            return { 
              success: false, 
              error: `Maximum quantity (${MAX_QUANTITY_PER_ITEM}) exceeded` 
            };
          }
          
          const itemIndex = items.findIndex(item => item.id === itemId);
          
          if (itemIndex === -1) {
            return { 
              success: false, 
              error: 'Item not found in cart' 
            };
          }
          
          const updatedItems = [...items];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: quantity
          };
          set({ items: updatedItems });
          
          return { success: true, error: undefined };
        } catch (error) {
          console.error('Error updating quantity:', error);
          return {
            success: false,
            error: 'Failed to update quantity. Please try again.'
          };
        }
      },

      // =============================
      // Order Type Management
      // =============================
      
      // Set Order Type
      // Integration Point: Order type selection UI
      setOrderType: (type) => set({ orderType: type }),
      
      // Set Delivery Fee
      // Integration Point: Backend delivery fee calculation
      setDeliveryFee: (fee) => set({ deliveryFee: fee }),

      // =============================
      // Cart State Management
      // =============================
      
      // Clear Cart
      // Integration Point: Called after successful order creation
      clearCart: () => {
        set({
          items: [],
          orderType: 'delivery',
          deliveryFee: 0
        });
      },

      // Reset Cart Storage
      // Integration Point: Used for troubleshooting and logout
      resetCartStorage: () => {
        set({
          items: [],
          orderType: 'delivery',
          deliveryFee: 0,
          initialized: false
        });
        localStorage.removeItem('cart-storage');
      },

      // =============================
      // Price Calculations
      // =============================
      
      // Calculate Subtotal
      // Integration Point: Cart and checkout UI
      getSubtotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          // Skip items with invalid price or quantity
          if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
            console.warn('Invalid item in cart:', item);
            return total;
          }
          return total + (item.price * item.quantity);
        }, 0);
      },

      // Calculate Total with Delivery Fee
      // Integration Point: Checkout UI and order creation
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().deliveryFee;
        return subtotal + deliveryFee;
      }
    }),
    {
      // =============================
      // Persistence Configuration
      // =============================
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialized = true;
        }
      }
    }
  )
);

export default useCart;
