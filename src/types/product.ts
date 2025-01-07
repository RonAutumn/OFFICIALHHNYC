export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  imageUrl?: string;
  weightUnit?: number | null;
}

export interface Variation {
  id: string;
  name: string;
  weight: number;
  weightUnit: 'g' | 'mg' | 'none';
  flavor: string;
  price: number;
}
