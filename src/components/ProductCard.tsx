import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product & { quantity: number }) => void;
  onSelect?: (product: Product) => void;
  onViewDetails?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelect,
  onViewDetails,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      onAddToCart({ ...product, quantity });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      {product.imageUrl && (
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
        <div className="mt-2">
          <p className="font-medium">{formatCurrency(product.price)}</p>
          {product.weightSize && (
            <p className="text-sm text-muted-foreground">
              Weight: {product.weightSize}g
            </p>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || isAdding}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock || isAdding}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            className="ml-2 flex-1"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
};