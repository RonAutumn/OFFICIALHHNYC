'use client';

import { Product } from '@/lib/airtable';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from '@/lib/store/cart';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedVariation, setSelectedVariation] = useState<string | undefined>(
    product.variations?.find(v => v.name)?.name
  );
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    const variation = product.variations?.find(v => v.name === selectedVariation);
    addItem(product, selectedVariation);
    toast({
      title: "Added to cart",
      description: `${product.name}${selectedVariation ? ` - ${selectedVariation}` : ''} has been added to your cart.`,
    });
  };

  // Filter out variations with empty names
  const validVariations = product.variations?.filter(v => v.name && v.name.trim() !== '') || [];

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="flex-none p-2 sm:p-3">
        {product.imageUrl && (
          <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              priority={false}
              loading="lazy"
            />
          </div>
        )}
        <CardTitle className={cn(
          "mt-2 line-clamp-1",
          "text-xs sm:text-sm md:text-base",
          "font-medium sm:font-semibold"
        )}>
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 sm:p-3">
        {product.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex-none flex flex-col gap-1.5 sm:gap-2 p-2 sm:p-3">
        <div className="flex items-center justify-between w-full">
          <span className={cn(
            "font-semibold",
            "text-xs sm:text-sm md:text-base"
          )}>
            ${(validVariations.find(v => v.name === selectedVariation)?.price || product.price).toFixed(2)}
          </span>
        </div>
        {validVariations.length > 0 && (
          <Select
            value={selectedVariation}
            onValueChange={setSelectedVariation}
            defaultValue={validVariations[0]?.name}
          >
            <SelectTrigger className={cn(
              "w-full text-xs sm:text-sm",
              "h-7 sm:h-8 md:h-9"
            )}>
              <SelectValue placeholder="Select variation" />
            </SelectTrigger>
            <SelectContent>
              {validVariations.map((variation) => (
                <SelectItem 
                  key={variation.name || variation.id} 
                  value={variation.name || `variation-${variation.id}`}
                  className="text-xs sm:text-sm"
                >
                  {variation.name} - ${variation.price?.toFixed(2) ?? '0.00'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button 
          className={cn(
            "w-full text-xs sm:text-sm",
            "h-7 sm:h-8 md:h-9"
          )}
          variant="outline" 
          disabled={product.stock <= 0 || (validVariations.length > 0 && !selectedVariation)}
          onClick={handleAddToCart}
        >
          {product.stock <= 0 
            ? 'Out of Stock' 
            : validVariations.length > 0 && !selectedVariation
              ? 'Select Variation'
              : 'Add to Cart'
          }
        </Button>
      </CardFooter>
    </Card>
  );
} 