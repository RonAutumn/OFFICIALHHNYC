'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/lib/airtable';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tag, LayoutGrid } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

function deduplicateCategories(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>();
  
  categories.forEach(category => {
    if (category.isActive) {
      const existing = categoryMap.get(category.name);
      if (existing) {
        // Combine products arrays if they exist
        existing.products = [...(existing.products || []), ...(category.products || [])];
      } else {
        categoryMap.set(category.name, { ...category });
      }
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => 
    (a.displayOrder || 0) - (b.displayOrder || 0)
  );
}

export function CategoriesPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const handleCategoryClick = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null) {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    router.push(`/store?${params.toString()}`);
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="p-2">
          <CardTitle className="text-red-500 text-sm">Error</CardTitle>
          <CardDescription className="text-xs">Failed to load categories</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="p-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-3 w-[150px] mt-1" />
        </CardHeader>
        <CardContent className="grid gap-2 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const uniqueCategories = deduplicateCategories(categories || []);

  return (
    <Card className="w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-base">Categories</CardTitle>
        <CardDescription className="text-xs">Browse products by category</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 p-2">
        {/* All Products Tab */}
        <div
          onClick={() => handleCategoryClick(null)}
          className={`flex items-center justify-between p-2 rounded-md border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer ${
            !selectedCategory ? 'ring-1 ring-primary bg-primary/5' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <div>
              <h3 className="font-medium">All Products</h3>
              <p className="text-sm text-muted-foreground">View all available products</p>
            </div>
          </div>
        </div>

        {uniqueCategories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer ${
              category.name === 'Deals' ? 'bg-primary/5 border-primary/20' : ''
            } ${
              selectedCategory === category.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {category.name === 'Deals' && (
                <Tag className="h-4 w-4 text-primary" />
              )}
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {category.name}
                  {category.name === 'Deals' && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      Special Offers
                    </Badge>
                  )}
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 