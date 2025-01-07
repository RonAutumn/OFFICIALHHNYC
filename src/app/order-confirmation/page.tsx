'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageSquare, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OrderData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  delivery: {
    method: 'delivery' | 'shipping';
    fee: number;
    [key: string]: any;
  };
  total: number;
  status: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId) {
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Order data:', data);
            setOrderData(data);
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const subtotal = orderData?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto bg-background border-border">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-foreground">Order Received!</CardTitle>
          {orderId && (
            <p className="text-muted-foreground">Order #{orderId}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Payment Instructions */}
          <div className="bg-blue-950/50 border border-blue-900 rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg text-blue-300">Payment Instructions</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-blue-400 mt-1" />
                <p className="text-foreground">A payment link will be sent to your phone via SMS shortly.</p>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 mt-1" />
                <p className="text-foreground">A confirmation email with your order details and payment instructions will be sent to your email address.</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {orderData && (
            <div className="border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg text-foreground">Order Summary</h3>
              <div className="space-y-3">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>{orderData.delivery.method === 'delivery' ? 'Delivery Fee' : 'Shipping Fee'}</span>
                    <span>{formatPrice(orderData.delivery.fee)}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg pt-2">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(orderData.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-foreground">What happens next?</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Complete your payment using the link sent via SMS</li>
              <li>Receive payment confirmation</li>
              <li>We'll prepare your order</li>
              <li>
                {orderData?.delivery.method === 'delivery' 
                  ? 'Deliver to your provided address on the selected date'
                  : 'Ship to your provided address'
                }
              </li>
            </ol>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button onClick={() => router.push('/')} className="w-full">
            Return to Home
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Questions about your order? Contact us at support@hhnyc.com
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 