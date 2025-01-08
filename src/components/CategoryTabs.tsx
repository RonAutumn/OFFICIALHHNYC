import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All Products';

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All Products') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="sticky top-16 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-zinc-800">
      <nav className="container flex h-14 max-w-screen-2xl items-center mx-auto">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-6 overflow-x-auto pb-2 no-scrollbar">
            {['All Products', ...categories].map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "relative h-8 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-white whitespace-nowrap",
                  "before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-full before:origin-left before:scale-x-0 before:bg-primary before:transition-transform before:duration-200",
                  "hover:before:scale-x-100",
                  activeCategory === category
                    ? "text-white before:scale-x-100"
                    : "text-zinc-400"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};
