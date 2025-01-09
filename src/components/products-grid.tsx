'use client';

import { Product } from '@/types/product';
import { ProductCard } from '@/components/product-card';
import { useSearchParams } from 'next/navigation';

export function ProductsGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category?.includes(selectedCategory) ?? false)
    : products;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
} 