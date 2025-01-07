'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';

export function Header() {
  const { items } = useCart();
  const router = useRouter();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="text-xl font-semibold cursor-pointer" 
          onClick={() => router.push('/')}
        >
          HeavenHighNYC
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => router.push('/checkout')}
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}