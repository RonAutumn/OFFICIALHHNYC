import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface ProductVariation {
  id?: number;
  flavor?: string;
  weight?: number;
  weightUnit?: 'g' | 'mg' | 'none';
  price: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description?: string;
  image?: string;
  stock: number;
  variations: ProductVariation[];
  displayOptions: {
    showWeight: boolean;
    showFlavors: boolean;
  };
}

export const productService = {
  async getProducts(): Promise<{ products: Product[], categories: string[] }> {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await axios.post(`${API_URL}/products`, {
      ...product,
      variations: product.variations?.map(v => ({
        ...v,
        weightUnit: v.weightUnit || 'g',
        weight: v.weight || 0
      })) || []
    });
    return response.data;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const response = await axios.put(`${API_URL}/products/${id}`, {
      ...product,
      variations: product.variations?.map(v => ({
        ...v,
        weightUnit: v.weightUnit || 'g',
        weight: v.weight || 0
      })) || []
    });
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await axios.delete(`${API_URL}/products/${id}`);
  }
};

export default productService;
