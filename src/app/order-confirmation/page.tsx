'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageSquare, Mail } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';

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
  orderId: string;
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        setOrderData(JSON.parse(decodeURIComponent(data)));
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, [searchParams]);

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sorry, we couldn't find your order information.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/')}>Return Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle>Order Confirmed!</CardTitle>
              <p className="text-sm text-gray-500">Order #{orderData.orderId}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(orderData.total - orderData.delivery.fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{orderData.delivery.method === 'delivery' ? 'Delivery Fee' : 'Shipping Fee'}</span>
                    <span>{formatPrice(orderData.delivery.fee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-2">
                    <span>Total</span>
                    <span>{formatPrice(orderData.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{orderData.delivery.method === 'delivery' ? 'Delivery' : 'Shipping'} Details</h3>
              <div className="text-sm space-y-1">
                <p>{orderData.delivery.address}</p>
                {orderData.delivery.borough && <p>Borough: {orderData.delivery.borough}</p>}
                {orderData.delivery.instructions && (
                  <div className="flex items-start gap-2 mt-2">
                    <MessageSquare className="h-4 w-4 mt-0.5" />
                    <p>{orderData.delivery.instructions}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <p>A confirmation email has been sent with your order details.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/')} className="w-full">
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading Order...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we load your order information.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}