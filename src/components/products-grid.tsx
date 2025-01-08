'use client';

import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/airtable';
import { ProductCard } from './product-card';
import { Skeleton } from './ui/skeleton';
import { useSearchParams } from 'next/navigation';

async function fetchProducts(categoryId: string | null): Promise<Product[]> {
  const url = categoryId 
    ? `/api/products?category=${categoryId}`
    : '/api/products';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export function ProductsGrid() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p className="text-muted-foreground">Failed to load products</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-md" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-[120px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">No Products Found</h2>
        <p className="text-muted-foreground">Check back later for new products</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
} 