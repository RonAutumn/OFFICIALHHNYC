export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string[];
  categoryNames?: string[];
  isActive: boolean;
  imageUrl?: string;
  stock: number;
  status: string;
  weightSize?: string | number;
  type?: 'flower' | 'edible' | 'cart' | 'other' | 'bundle';
  variations?: Variation[];
  needsSync?: boolean;
}

export interface Variation {
  id: string;
  name: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  isDefault?: boolean;
  weight?: number;
  weightUnit?: 'g' | 'mg' | 'none';
  flavor?: string;
}
