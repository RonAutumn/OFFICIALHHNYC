import { useQuery } from '@tanstack/react-query';
import { productService } from '@/lib/services/products';
import type { Product } from '@/types';

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productService.getAll(),
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useProductsByCategory(category: string) {
  return useQuery<Product[]>({
    queryKey: ['products', 'category', category],
    queryFn: () => productService.getByCategory(category),
    enabled: !!category,
  });
} 