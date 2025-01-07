import type { Product, Variation } from './product';

export interface CartItem extends Omit<Product, 'variations'> {
  quantity: number;
  selectedVariation?: Variation;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
