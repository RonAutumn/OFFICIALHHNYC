'use client';

import { Product, ProductVariation } from '@/types/product';
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
    product.variations?.find((v: ProductVariation) => v.name)?.name
  );
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    const variation = product.variations?.find((v: ProductVariation) => v.name === selectedVariation);
    addItem(product, selectedVariation);
    toast({
      title: "Added to cart",
      description: `${product.name}${selectedVariation ? ` - ${selectedVariation}` : ''} has been added to your cart.`,
    });
  };

  // Filter out variations with empty names
  const validVariations = product.variations?.filter((v: ProductVariation) => v.name && v.name.trim() !== '') || [];

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="flex-none p-2 sm:p-3">
        {product.imageUrl && (
          <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100">
            {product.imageUrl.startsWith('data:image') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>
        )}
        <CardTitle className="text-lg font-semibold mt-2">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <p className="mt-2 text-lg font-semibold">${product.price}</p>
      </CardContent>
      <CardFooter className="flex-none p-2 sm:p-3 space-y-2">
        {validVariations.length > 0 && (
          <Select value={selectedVariation} onValueChange={setSelectedVariation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select variation" />
            </SelectTrigger>
            <SelectContent>
              {validVariations.map((variation: ProductVariation) => (
                <SelectItem key={variation.name} value={variation.name}>
                  {variation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button 
          onClick={handleAddToCart} 
          className="w-full"
          disabled={validVariations.length > 0 && !selectedVariation}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
} 