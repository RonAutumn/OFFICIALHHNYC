import Airtable from 'airtable'
import type { Product, ProductDetails } from '@/types/product'

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable environment variables')
}

// Initialize Airtable
export const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!)

// Product Variation Types
export type VariationType = 'flavor' | 'size' | 'brand' | 'strain' | 'weight'

export interface ProductVariation {
  id: string
  type: VariationType
  name: string
  price?: number // Additional price
  sku?: string
  stock?: number
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  displayOrder?: number
  isActive: boolean
  slug?: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  borough: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentMethod: 'cash' | 'card' | 'other'
  notes?: string
  createdAt: string
  updatedAt: string
  type: 'delivery' | 'shipping'
}

export interface DeliverySetting {
  borough: string
  deliveryFee: number
  freeDeliveryMinimum: number
}

// Create a new order directly in Airtable
export async function createOrder(orderData: any): Promise<Order> {
  try {
    // Generate order ID
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    const orderId = parseInt(`${timestamp % 1000000}${randomNum % 1000}`, 10);

    // Create the base order data
    const orderFields: Record<string, any> = {
      Status: orderData.Status,
      'Customer Name': orderData['Customer Name'],
      Email: orderData.Email,
      Phone: orderData.Phone,
      'Order ID': orderId.toString(),
      'Payment Method': orderData['Payment Method'],
      Timestamp: orderData.Timestamp,
      Total: orderData.Total,
      Type: orderData.Type,
      Items: orderData.Items, // Array of product record IDs
      address: orderData.address || ''
    };

    // Add type-specific fields
    if (orderData.Type === 'shipping') {
      orderFields['Shipping Fee'] = orderData['Shipping Fee'] || 15;
      orderFields['Delivery Fee'] = 0;
      orderFields.Borough = '';
      orderFields['Delivery Date'] = null;
    } else {
      orderFields.Borough = orderData.Borough || '';
      orderFields['Delivery Fee'] = orderData['Delivery Fee'] || 0;
      orderFields['Shipping Fee'] = 0;
      // Format the delivery date to match Airtable's expected format (YYYY-MM-DD)
      orderFields['Delivery Date'] = orderData['Delivery Date'] 
        ? new Date(orderData['Delivery Date']).toISOString().split('T')[0]
        : null;
    }

    // Create order record in Airtable
    const orderRecord = await base('Orders').create(orderFields);

    // Helper function to ensure status is one of the valid values
    const normalizeStatus = (status: string): Order['status'] => {
      const validStatuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
      const normalizedStatus = status.toLowerCase() as Order['status'];
      return validStatuses.includes(normalizedStatus) ? normalizedStatus : 'pending';
    };

    // Helper function to ensure payment method is one of the valid values
    const normalizePaymentMethod = (method: string): Order['paymentMethod'] => {
      const validMethods: Order['paymentMethod'][] = ['card', 'cash', 'other'];
      const normalizedMethod = method.toLowerCase() as Order['paymentMethod'];
      return validMethods.includes(normalizedMethod) ? normalizedMethod : 'other';
    };

    // Return the created order with proper type casting
    return {
      id: orderRecord.id,
      orderNumber: orderId.toString(),
      customerName: String(orderRecord.fields['Customer Name'] || ''),
      customerEmail: String(orderRecord.fields.Email || ''),
      customerPhone: String(orderRecord.fields.Phone || ''),
      deliveryAddress: String(orderRecord.fields.address || ''),
      borough: String(orderRecord.fields.Borough || ''),
      items: Array.isArray(orderRecord.fields.Items) ? orderRecord.fields.Items : [],
      subtotal: Number(orderRecord.fields.Total) - (Number(orderRecord.fields['Shipping Fee']) || Number(orderRecord.fields['Delivery Fee'])),
      deliveryFee: Number(orderRecord.fields['Shipping Fee'] || orderRecord.fields['Delivery Fee'] || 0),
      total: Number(orderRecord.fields.Total || 0),
      status: normalizeStatus(String(orderRecord.fields.Status || 'pending')),
      paymentStatus: 'pending',
      paymentMethod: normalizePaymentMethod(String(orderRecord.fields['Payment Method'] || 'other')),
      createdAt: String(orderRecord.fields.Timestamp || ''),
      updatedAt: String(orderRecord.fields.Timestamp || ''),
      type: String(orderRecord.fields.Type || '')
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Get all orders from Airtable
export async function getAllOrders(): Promise<Order[]> {
  try {
    const records = await base('Orders').select({
      sort: [{ field: 'Timestamp', direction: 'desc' }]
    }).all();

    return records.map(record => ({
      id: record.id,
      orderNumber: record.get('Order ID') as string,
      customerName: record.get('Customer Name') as string,
      customerEmail: record.get('Email') as string,
      customerPhone: record.get('Phone') as string,
      deliveryAddress: record.get('address') as string,
      borough: record.get('Borough') as string,
      items: [], // Initialize as empty array
      subtotal: record.get('Total') as number - (
        (record.get('Shipping Fee') as number || 0) + 
        (record.get('Delivery Fee') as number || 0)
      ),
      deliveryFee: (record.get('Shipping Fee') as number || 0) + 
                  (record.get('Delivery Fee') as number || 0),
      total: record.get('Total') as number || 0,
      status: record.get('Status') as Order['status'] || 'pending',
      paymentMethod: record.get('Payment Method') as Order['paymentMethod'] || 'cash',
      type: record.get('Type') as Order['type'] || 'delivery',
      createdAt: record.get('Timestamp') as string,
      updatedAt: record.get('Timestamp') as string,
      paymentStatus: 'pending'
    }));
  } catch (error) {
    console.error('Error fetching orders from Airtable:', error);
    return [];
  }
}

// Update order status in Airtable
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    await base('Orders').update(orderId, {
      'Status': status
    });
  } catch (error) {
    console.error('Error updating order status in Airtable:', error);
    throw error;
  }
}

// Get all categories from Airtable
export async function getCategories(): Promise<Category[]> {
  try {
    const records = await base('Category').select({
      filterByFormula: '{Is Active} = TRUE()',
      sort: [{ field: 'Display Order', direction: 'asc' }]
    }).all();

    // Create a map to store unique categories by name
    const uniqueCategories = new Map<string, Category>();

    records.forEach(record => {
      const name = record.get('Name') as string;
      // Only add if not already present or if this record has a lower display order
      if (!uniqueCategories.has(name) || 
          (record.get('Display Order') as number) < (uniqueCategories.get(name)?.displayOrder || Infinity)) {
        uniqueCategories.set(name, {
          id: record.id,
          name: name,
          description: record.get('Description') as string,
          displayOrder: record.get('Display Order') as number,
          isActive: record.get('Is Active') as boolean,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        });
      }
    });

    // Convert map to array and sort by display order
    return Array.from(uniqueCategories.values())
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.error('Error fetching categories from Airtable:', error);
    return [];
  }
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  try {
    const record = await base('Category').create({
      'Name': data.name || '',
      'Description': data.description || '',
      'Display Order': data.displayOrder || 0,
      'Is Active': data.isActive || false
    });

    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      displayOrder: record.get('Display Order') as number,
      isActive: record.get('Is Active') as boolean,
      slug: record.get('Name')?.toString().toLowerCase().replace(/\s+/g, '-') || ''
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

// Update category in Airtable
export async function updateCategory(categoryId: string, data: Partial<Category>): Promise<Category> {
  try {
    const record = await base('Category').update(categoryId, {
      'Name': data.name,
      'Description': data.description,
      'Display Order': data.displayOrder,
      'Is Active': data.isActive
    });

    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      displayOrder: record.get('Display Order') as number,
      isActive: record.get('Is Active') as boolean,
      slug: record.get('Name')?.toString().toLowerCase().replace(/\s+/g, '-') || ''
    };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

// Get all products from Airtable
export async function getProducts(): Promise<Product[]> {
  try {
    const records = await base('Products').select({
      filterByFormula: "{Status} = 'active'",
      sort: [{ field: 'Name', direction: 'asc' }]
    }).all();
    
    // Get categories first to ensure proper mapping
    const categories = await getCategories();
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    
    return records.map(record => {
      const categoryIds = record.get('Category') as string[] || [];
      const categoryData = categoryIds
        .map(id => categoryMap.get(id))
        .filter((cat): cat is Category => cat !== undefined);

      return {
        id: record.get('ID') as string || record.id,
        recordId: record.id,
        name: record.get('Name') as string,
        description: record.get('Description') as string,
        price: record.get('Price') as number,
        category: categoryIds,
        categoryNames: categoryData.map(cat => cat.name),
        categoryDetails: categoryData,
        isActive: record.get('Status') === 'active',
        imageUrl: record.get('Image URL') as string || '/placeholder.svg',
        stock: record.get('Stock') as number,
        status: record.get('Status') as string,
        weightSize: record.get('Weight/Size') as string,
        strainType: record.get('Strain Type') as 'sativa' | 'indica' | 'hybrid' | undefined,
        brand: record.get('Brand') as string,
        flavors: record.get('Flavors') as string[] || [],
        variations: record.get('Variations') as any[] || [],
        details: record.get('Details') as any,
        bundleProducts: record.get('Bundle Products') as any[] || [],
        bundleSavings: record.get('Bundle Savings') as number,
        isSpecialDeal: record.get('Is Special Deal') as boolean,
        specialPrice: record.get('Special Price') as number,
        specialStartDate: record.get('Special Start Date') as string,
        specialEndDate: record.get('Special End Date') as string,
        originalProductId: record.get('Original Product ID') as string,
        type: record.get('Type') as 'flower' | 'edible' | 'cart' | 'other' | 'bundle' || 'other'
      };
    });
  } catch (error) {
    console.error('Error fetching products from Airtable:', error);
    return [];
  }
}

// Get all categories from Airtable with products count
export async function getCategoriesWithProducts(): Promise<(Category & { productCount: number })[]> {
  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts()
    ]);

    // Create a map to count products per category
    const productCountMap = new Map<string, number>();
    products.forEach(product => {
      (product.category || []).forEach(categoryId => {
        productCountMap.set(
          categoryId, 
          (productCountMap.get(categoryId) || 0) + 1
        );
      });
    });

    // Add product count to categories
    return categories.map(category => ({
      ...category,
      productCount: productCountMap.get(category.id) || 0
    }));
  } catch (error) {
    console.error('Error fetching categories with products:', error);
    return [];
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter(product => 
      product.category && product.category.includes(categoryId)
    );
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}