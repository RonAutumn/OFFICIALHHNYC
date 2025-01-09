import type { Product, ProductVariation } from './product';

export interface CartItem extends Omit<Product, 'variations'> {
  quantity: number;
  selectedVariation?: ProductVariation;
  recordId: string; // Airtable record ID
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
