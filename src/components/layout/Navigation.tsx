import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { CartModal } from '@/features/cart/components/cart-modal';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories = [
  { name: 'All Products', path: '/?category=All Products' },
  { name: 'Chocolate', path: '/?category=Chocolate' },
  { name: 'Serial Bars', path: '/?category=Serial Bars' },
  { name: 'Flower', path: '/?category=Flower' },
  { name: 'Vapes', path: '/?category=Vapes' },
  { name: 'Pre-roll', path: '/?category=Pre-roll' },
];

export const Navigation: React.FC<NavigationProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items } = useCart();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);

  return (
    <nav className="border-b border-border bg-background fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.path}
                      href={category.path}
                      className="block py-2 px-4 hover:bg-accent rounded-md transition-colors"
                      onClick={() => {
                        const sheet = document.querySelector('[data-state="open"]');
                        if (sheet) {
                          sheet.setAttribute('data-state', 'closed');
                        }
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="text-xl font-bold text-foreground hover:text-primary whitespace-nowrap">
              Heaven High NYC
            </Link>

            {/* Desktop Categories */}
            <div className="hidden md:flex gap-4 overflow-x-auto">
              {categories.map((category) => (
                <Link key={category.path} href={category.path}>
                  <Button variant="ghost">{category.name}</Button>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Desktop Search */}
            <div className={cn(
              "absolute md:static left-0 right-0 top-16 px-4 pb-4 md:p-0 bg-background",
              "transition-all duration-200 ease-in-out",
              isSearchOpen ? "block" : "hidden md:block"
            )}>
              <Input
                type="search"
                placeholder="Search menu..."
                className="w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            {/* Cart Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "relative hover:bg-gray-100 transition-all duration-200",
                  isHovered && "scale-110"
                )}
                onClick={() => setIsCartOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      {itemCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* Cart Preview (Desktop Only) */}
              <AnimatePresence>
                {isHovered && items.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 min-w-[250px] hidden md:block"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div className="space-y-2">
                      {items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="truncate max-w-[150px]">{item.name}</span>
                          <span className="text-gray-500">x{item.quantity}</span>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="text-sm text-gray-500 text-center">
                          +{items.length - 3} more items
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${(total / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <CartModal 
        open={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </nav>
  );
};
