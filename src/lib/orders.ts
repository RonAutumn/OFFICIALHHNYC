import fs from 'fs';
import path from 'path';

const ORDERS_DIR = path.join(process.cwd(), 'data', 'orders');
const ACCEPTED_DIR = path.join(ORDERS_DIR, 'accepted');
const PROCESSED_DIR = path.join(ORDERS_DIR, 'processed');

// Ensure directories exist
[ORDERS_DIR, ACCEPTED_DIR, PROCESSED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface BaseDelivery {
  name: string;
  phone: string;
  email: string;
  method: 'delivery' | 'shipping';
  fee: number;
}

interface DeliveryMethod extends BaseDelivery {
  method: 'delivery';
  address: string;
  zipCode: string;
  borough: string;
  instructions?: string;
  deliveryDate: string;
}

interface ShippingMethod extends BaseDelivery {
  method: 'shipping';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  delivery: DeliveryMethod | ShippingMethod;
  status: string;
  total: number;
  timestamp: string;
}

function validateOrder(orderData: OrderData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (!orderData.items?.length) errors.push('Order must contain items');
  if (!orderData.total || orderData.total <= 0) errors.push('Invalid order total');
  
  // Delivery validation
  const delivery = orderData.delivery;
  if (!delivery) {
    errors.push('Delivery information is required');
  } else {
    // Common fields validation
    if (!delivery.name?.trim()) errors.push('Customer name is required');
    if (!delivery.phone?.trim()) errors.push('Phone number is required');
    if (!delivery.email?.trim()) errors.push('Email is required');
    if (typeof delivery.fee !== 'number') errors.push('Delivery/shipping fee must be a number');

    if (delivery.method === 'delivery') {
      // Strict validation for local delivery
      if (!delivery.address?.trim()) errors.push('Delivery address is required');
      if (!delivery.zipCode?.trim()) errors.push('ZIP code is required');
      if (!delivery.borough?.trim()) errors.push('Borough is required');
      if (!delivery.deliveryDate) errors.push('Delivery date is required');
    } else if (delivery.method === 'shipping') {
      // Basic validation for shipping - just ensure required fields exist
      if (!delivery.address) errors.push('Shipping address is required');
      if (!delivery.city) errors.push('City is required');
      if (!delivery.state) errors.push('State is required');
      if (!delivery.zipCode) errors.push('ZIP code is required');
    } else {
      errors.push('Invalid delivery method');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function saveOrderToJson(orderData: OrderData): Promise<{ fileName: string; validation: { isValid: boolean; errors: string[] } }> {
  const validation = validateOrder(orderData);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `order-${timestamp}.json`;
  const filePath = path.join(ORDERS_DIR, fileName);

  // Add timestamp to order data
  const orderWithTimestamp = {
    ...orderData,
    timestamp: new Date().toISOString(),
    validation: validation,
  };

  try {
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(orderWithTimestamp, null, 2)
    );
    return { fileName, validation };
  } catch (error) {
    console.error('Error saving order to JSON:', error);
    throw new Error('Failed to save order to JSON file');
  }
}

export async function acceptOrder(fileName: string): Promise<void> {
  const sourcePath = path.join(ORDERS_DIR, fileName);
  const acceptedPath = path.join(ACCEPTED_DIR, fileName);

  try {
    // Read the existing order
    const orderData = JSON.parse(await fs.promises.readFile(sourcePath, 'utf8'));

    // Add acceptance timestamp
    const acceptedData = {
      ...orderData,
      acceptedAt: new Date().toISOString(),
    };

    // Write to accepted directory
    await fs.promises.writeFile(
      acceptedPath,
      JSON.stringify(acceptedData, null, 2)
    );

    // Remove original file
    await fs.promises.unlink(sourcePath);
  } catch (error) {
    console.error('Error accepting order:', error);
    throw new Error('Failed to accept order');
  }
}

export async function markOrderProcessed(fileName: string): Promise<void> {
  const acceptedPath = path.join(ACCEPTED_DIR, fileName);
  const processedPath = path.join(PROCESSED_DIR, fileName);

  try {
    // Read the existing order
    const orderData = JSON.parse(await fs.promises.readFile(acceptedPath, 'utf8'));

    // Add processed timestamp
    const processedData = {
      ...orderData,
      processedAt: new Date().toISOString(),
    };

    // Write to processed directory
    await fs.promises.writeFile(
      processedPath,
      JSON.stringify(processedData, null, 2)
    );

    // Remove from accepted directory
    await fs.promises.unlink(acceptedPath);
  } catch (error) {
    console.error('Error marking order as processed:', error);
    throw new Error('Failed to mark order as processed');
  }
}

export async function getAcceptedOrders(): Promise<{ fileName: string; data: any }[]> {
  try {
    const files = await fs.promises.readdir(ACCEPTED_DIR);
    const orders = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(ACCEPTED_DIR, fileName);
        const data = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
        return { fileName, data };
      })
    );
    return orders;
  } catch (error) {
    console.error('Error getting accepted orders:', error);
    throw new Error('Failed to get accepted orders');
  }
} 