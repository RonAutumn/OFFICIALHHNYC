// Product Variation Types
export type VariationType = 'flavor' | 'size' | 'brand' | 'strain' | 'weight';

export interface ProductVariation {
  id: string;
  type: VariationType;
  name: string;
  price?: number;
  sku?: string;
  stock?: number;
  isActive: boolean;
}

export interface VariationOption {
  id: string;
  name: string;
  type: VariationType;
  values: string[];
}

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
  variations?: ProductVariation[];
  needsSync?: boolean;
  details?: ProductDetails;
  bundleProducts?: Array<{
    id: string;
    quantity: number;
    product: Product;
  }>;
  bundleSavings?: number;
  isSpecialDeal?: boolean;
  specialPrice?: number;
  specialStartDate?: string;
  specialEndDate?: string;
}

export interface ProductDetails {
  productId: string;
  // Base Cannabis Info
  thcContent?: number;
  cbdContent?: number;
  thcvContent?: number;
  cbgContent?: number;
  cbcContent?: number;
  terpenes?: string[];
  strain?: 'sativa' | 'indica' | 'hybrid';
  strainRatio?: string;
  effects?: string[];
  
  // Cart Specific
  cartType?: 'distillate' | 'live resin' | 'full spectrum' | 'co2';
  cartridgeSize?: '0.5g' | '1.0g';
  batteryCompatibility?: string[];
  hardwareType?: string;
  coilType?: string;
  cartFlavors?: string[];
  cartBrands?: string[];
  
  // Flower Specific
  flowerWeights?: string[];
  flowerGrade?: 'top shelf' | 'mid shelf' | 'value';
  cureMethod?: string;
  trimType?: 'hand' | 'machine';
  
  // Edible Specific
  servingSize?: string;
  servingsPerPackage?: number;
  ingredients?: string;
  allergens?: string;
  storageInstructions?: string;
  edibleFlavors?: string[];
  
  // Lab Results
  labTested?: boolean;
  labTestDate?: string;
  labTestProvider?: string;
  coa?: string;
  
  // Compliance
  warningLabels?: string[];
  childResistant?: boolean;
  complianceNotes?: string;
  
  // Metadata
  lastUpdated: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expirationDate?: string;
  
  // Variation Templates
  variationTemplates?: {
    [key in VariationType]?: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  variations?: string[];
  products?: string[];
}

export interface CartItem extends Omit<Product, 'variations'> {
  quantity: number;
  selectedVariation?: ProductVariation;
}

export type OrderType = 'delivery' | 'shipping';

export interface ProductFormData extends Omit<Product, 'variations' | 'details'> {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string[];
  imageUrl: string;
  weightSize: string | number;
  isActive: boolean;
  type: 'flower' | 'edible' | 'cart' | 'other' | 'bundle';
  details?: {
    ingredients?: string[];
    allergens?: string[];
    thc?: number;
    cbd?: number;
    effects?: string[];
    flavors?: string[];
    strainType?: 'indica' | 'sativa' | 'hybrid';
  };
  variations?: Array<{
    name: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
    isDefault?: boolean;
  }>;
  isSpecialDeal?: boolean;
  originalProductId?: string;
  specialPrice?: number;
  specialStartDate?: string;
  specialEndDate?: string;
  bundleProducts?: Array<{
    id: string;
    quantity: number;
    product: Product;
  }>;
  isBundleDeal?: boolean;
  bundleSavings?: number;
}

export interface BundleProduct {
  id: string;
  quantity: number;
  product: Product;
}

export interface DeliverySetting {
  borough: string;
  deliveryFee: number;
  freeDeliveryMinimum: number;
}
