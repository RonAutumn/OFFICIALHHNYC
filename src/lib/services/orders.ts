import { api } from './api';
import type { Order } from '@/types';

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
  };
  userId?: string;
}

export const orderService = {
  async create(input: CreateOrderInput): Promise<Order> {
    return api.post<Order>('/orders', input);
  },

  async getById(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    return api.get<Order[]>(`/orders/user/${userId}`);
  },

  async updateStatus(orderId: string, status: Order['status']): Promise<Order> {
    return api.put<Order>(`/orders/${orderId}/status`, { status });
  },

  async calculateDeliveryFee(zipCode: string): Promise<number> {
    return api.get<{ fee: number }>(`/delivery-fees/${zipCode}`).then(res => res.fee);
  },
}; 