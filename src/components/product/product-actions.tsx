import React from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';

interface ProductActionsProps {
  product: Product;
  onAddToCart: () => void;
  onViewDetails: () => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  return (
    <div className="flex gap-2 mt-4">
      <Button
        onClick={onAddToCart}
        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors duration-200"
      >
        Add to Cart
      </Button>
      <Button
        onClick={onViewDetails}
        variant="outline"
        className="bg-transparent hover:bg-gray-800 text-white border border-gray-700 transition-colors duration-200"
      >
        Details
      </Button>
    </div>
  );
};