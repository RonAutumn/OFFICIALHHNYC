import { useState, useEffect, useMemo } from 'react';

export interface ProductVariation {
  id: string;
  weight: number;
  price: number;
  flavor: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  variations: ProductVariation[];
}

export interface UseProductVariationsReturn {
  selectedVariation: ProductVariation | null;
  setSelectedVariation: (variation: ProductVariation) => void;
  price: number;
  flavors: string[];
  weights: number[];
  inStock: boolean;
  isLoading: boolean;
}

export function useProductVariations(product?: Product): UseProductVariationsReturn {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize derived data to prevent unnecessary recalculations
  const flavors = useMemo(() => {
    if (!product?.variations) return [];
    return [...new Set(product.variations.map(v => v.flavor))].sort();
  }, [product?.variations]);

  const weights = useMemo(() => {
    if (!product?.variations) return [];
    return [...new Set(product.variations.map(v => v.weight))].sort((a, b) => a - b);
  }, [product?.variations]);

  // Set initial variation when product loads or changes
  useEffect(() => {
    if (product?.variations?.length) {
      // Find first in-stock variation
      const firstAvailable = product.variations.find(v => v.stock > 0);
      setSelectedVariation(firstAvailable || product.variations[0]);
    } else {
      setSelectedVariation(null);
    }
    setIsLoading(false);
  }, [product]);

  return {
    selectedVariation,
    setSelectedVariation,
    price: selectedVariation?.price || 0,
    flavors,
    weights,
    inStock: Boolean(selectedVariation?.stock),
    isLoading
  };
}
