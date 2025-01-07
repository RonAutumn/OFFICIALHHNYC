export * from './types';
export { default as useCart } from './store/cart';
export { CartModal } from './components/CartModal';
export { DeliveryForm } from './components/DeliveryForm';
export { ShippingForm } from './components/ShippingForm';
export { OrderConfirmation } from './components/OrderConfirmation';

interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  total: number;
  orderType: OrderType;
  deliveryFee?: number;
}

export const transformCartToOrder = (
  cartData: CartData,
  customerInfo: CustomerInfo & { country?: string }
) => {
  if (!customerInfo.name || !customerInfo.address) {
    throw new Error('Name and address are required for orders');
  }

  const baseOrder = {
    orderId: `ORD-${Date.now()}`,
    customerName: customerInfo.name,
    total: cartData.total,
    items: cartData.items,
    orderType: cartData.orderType,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  if (cartData.orderType === 'shipping') {
    return {
      ...baseOrder,
      shippingData: {
        ...customerInfo,
        country: customerInfo.country || 'US',
      },
    };
  }

  return {
    ...baseOrder,
    deliveryData: {
      ...customerInfo,
      deliveryFee: cartData.deliveryFee,
    },
  };
};
