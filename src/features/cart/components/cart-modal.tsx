'use client';

import { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import { DeliveryForm } from './delivery-form';
import { ShippingForm } from './shipping-form';
import OrderConfirmation from './order-confirmation';
import { motion, AnimatePresence } from 'framer-motion';

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'cart' | 'method' | 'delivery' | 'shipping';

export function CartModal({ open, onClose }: CartModalProps) {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    customerName: string;
    total: number;
  } | null>(null);

  const slideAnimation = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: getTotal(),
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      clearCart();
      setOrderConfirmation({
        orderId: order.id,
        customerName: formData.name,
        total: getTotal()
      });
      setStep('cart');
      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id} has been confirmed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'method':
        return (
          <motion.div
            {...slideAnimation}
            className="grid grid-cols-2 gap-4 p-4"
          >
            <Button
              variant="outline"
              className="flex flex-col items-center p-6 transition-transform duration-200 hover:scale-105"
              onClick={() => setStep('delivery')}
            >
              <Truck className="h-8 w-8 mb-2" />
              <span>Local Delivery</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center p-6 transition-transform duration-200 hover:scale-105"
              onClick={() => setStep('shipping')}
            >
              <Package className="h-8 w-8 mb-2" />
              <span>Shipping</span>
            </Button>
          </motion.div>
        );

      case 'delivery':
        return (
          <motion.div {...slideAnimation}>
            <DeliveryForm
              onSubmit={handleCheckout}
              isSubmitting={isSubmitting}
              onBack={() => setStep('method')}
            />
          </motion.div>
        );

      case 'shipping':
        return (
          <motion.div {...slideAnimation}>
            <ShippingForm
              onSubmit={handleCheckout}
              isSubmitting={isSubmitting}
              onBack={() => setStep('method')}
            />
          </motion.div>
        );

      default:
        return (
          <motion.div {...slideAnimation}>
            <DialogHeader>
              <DialogTitle>Shopping Cart</DialogTitle>
              <DialogDescription>
                Review your items before checkout
              </DialogDescription>
            </DialogHeader>

            {items.length === 0 ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </motion.div>
            ) : (
              <motion.div layout>
                <ScrollArea className="h-[300px] pr-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center space-x-4 py-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="transition-transform hover:scale-110"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                          >
                            {item.quantity}
                          </motion.span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="transition-transform hover:scale-110"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="transition-transform hover:scale-110"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ScrollArea>
                <motion.div
                  layout
                  className="flex justify-between items-center mt-4 pt-4 border-t"
                >
                  <div className="text-sm text-muted-foreground">
                    Total: {formatPrice(getTotal())}
                  </div>
                  <Button
                    onClick={() => setStep('method')}
                    className="transition-transform hover:scale-105"
                  >
                    Proceed to Checkout
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
