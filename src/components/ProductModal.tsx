import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from '@/types/product';

interface ProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: Product & { quantity: number }) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  open,
  onClose,
  onAddToCart,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground antialiased">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md"
            />
          )}
          <p className="text-sm text-muted-foreground antialiased">{product.description}</p>
          {product.variations && product.variations.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground antialiased">Available Variations:</h3>
              <ul className="space-y-1">
                {product.variations.map((variation, index) => (
                  <li key={index} className="text-sm text-muted-foreground antialiased">
                    {variation.flavor} - ${variation.price}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-foreground antialiased">
              Price: ${product.price}
            </p>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onAddToCart({ ...product, quantity: 1 })}>
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};