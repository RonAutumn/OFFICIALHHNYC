import { Product, Variation } from './product';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  imageUrl?: string;
  weightUnit?: number | null;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
