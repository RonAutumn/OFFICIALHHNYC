import axios from 'axios';
import type { Product, ProductVariation } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const productService = {
  async getProducts(): Promise<{ products: Product[], categories: string[] }> {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await axios.post(`${API_URL}/products`, {
      ...product,
      variations: product.variations || []
    });
    return response.data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await axios.put(`${API_URL}/products/${id}`, {
      ...product,
      variations: product.variations || []
    });
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${API_URL}/products/${id}`);
  }
};

export default productService;
