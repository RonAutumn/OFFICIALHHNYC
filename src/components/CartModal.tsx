import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Minus, Plus, Trash2, Truck, Package } from "lucide-react";
import { CartItem } from '@/types/cart';
import useCart from '../hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { DeliveryForm } from './DeliveryForm';
import { ShippingForm } from './ShippingForm';

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

type OrderType = 'delivery' | 'shipping';
type Step = 'cart' | 'method' | 'delivery-form' | 'shipping-form';

const CartModal: React.FC<CartModalProps> = ({ open, onClose }) => {
  const { items, updateQuantity, removeFromCart, setOrderType: setCartOrderType } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('cart');
  const [orderType, setOrderType] = useState<OrderType>('delivery');

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  const handleOrderTypeSelect = (type: OrderType) => {
    setOrderType(type);
    setCartOrderType(type);
    setStep(type === 'delivery' ? 'delivery-form' : 'shipping-form');
  };

  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <DialogDescription className="text-center pb-4">
        Choose your preferred order method
      </DialogDescription>
      
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-32 flex flex-col items-center justify-center space-y-2 relative hover:border-primary hover:bg-accent"
          onClick={() => handleOrderTypeSelect('delivery')}
        >
          <Truck className="h-8 w-8" />
          <span className="font-medium">Delivery</span>
          <span className="text-sm opacity-70 text-center px-2">Get it delivered to your door</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-32 flex flex-col items-center justify-center space-y-2 relative hover:border-primary hover:bg-accent"
          onClick={() => handleOrderTypeSelect('shipping')}
        >
          <Package className="h-8 w-8" />
          <span className="font-medium">Shipping</span>
          <span className="text-sm opacity-70 text-center px-2">Ship to your address</span>
        </Button>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between space-x-4">
          <Button variant="outline" onClick={() => setStep('cart')}>
            Back to Cart
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'method':
        return renderMethodSelection();
      case 'delivery-form':
        return (
          <DeliveryForm
            onBack={() => setStep('method')}
            onSubmit={() => setStep('cart')}
          />
        );
      case 'shipping-form':
        return (
          <ShippingForm
            onBack={() => setStep('method')}
            onSubmit={() => {
              toast({
                title: "Order placed!",
                description: "Your order has been successfully placed.",
              });
              onClose();
            }}
          />
        );
      default:
        return (
          <>
            <ScrollArea className="h-[400px] pr-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <DialogDescription>
                    Your cart is empty. Add some items to get started!
                  </DialogDescription>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between space-x-4 bg-card p-4 rounded-lg"
                    >
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {items.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground"
                  onClick={() => setStep('method')}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'cart' && 'Shopping Cart'}
            {step === 'method' && 'Choose Order Method'}
            {step === 'delivery-form' && 'Delivery Details'}
            {step === 'shipping-form' && 'Shipping Information'}
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;