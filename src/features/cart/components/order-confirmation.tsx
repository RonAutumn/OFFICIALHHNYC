import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatCurrency } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OrderConfirmationProps {
  open: boolean;
  onClose: () => void;
  orderDetails: {
    orderId: string;
    customerName: string;
    items: number;
    total: number;
  };
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  open,
  onClose,
  orderDetails
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black max-w-[500px] p-8 rounded-lg">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-4">
              Order #{orderDetails.orderId}
            </p>
          </div>

          <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-lg mb-2">
              Dear {orderDetails.customerName},
            </p>
            <p className="text-gray-600 leading-relaxed">
              Thank you for your order. You will receive an SMS shortly with a payment link to complete your purchase.
            </p>
          </div>

          <div className="text-left border-t pt-4">
            <p className="text-sm text-gray-600">
              Order Total: {formatCurrency(orderDetails.total)}<br />
              Items: {orderDetails.items}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmation;
