"use client";

import { useState } from 'react';
import { CategoriesPanel } from '@/components/categories-panel';
import { ProductsGrid } from '@/components/products-grid';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StorePage() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  return (
    <main className="container mx-auto p-4">
      {/* Mobile Categories Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-between"
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
        >
          <span>Categories</span>
          {isCategoriesOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Categories Panel */}
        <aside className={cn(
          "w-full lg:w-[300px] transition-all duration-300 ease-in-out",
          "lg:block",
          isCategoriesOpen ? "block" : "hidden"
        )}>
          <div className="sticky top-[80px]">
            <CategoriesPanel />
          </div>
        </aside>

        {/* Products Grid */}
        <section className="min-h-screen">
          <ProductsGrid />
        </section>
      </div>
    </main>
  );
} 