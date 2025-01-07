import { Product } from '@/types';

export interface CartItem extends Product {
  quantity: number;
}

export interface BaseFormData {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
}

export interface DeliveryFormData extends BaseFormData {
  deliveryDate?: string;
  timeSlot?: string;
}

export interface ShippingFormData extends BaseFormData {
  country: string;
  trackingNumber?: string;
}

export type OrderType = 'delivery' | 'shipping';

export interface OrderSummary {
  orderId: string;
  customerName: string;
  total: number;
  items: CartItem[];
  orderType: OrderType;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  deliveryData?: DeliveryFormData;
  shippingData?: ShippingFormData;
}

