'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedVariation?: string;
  }>;
  delivery: {
    method: 'delivery' | 'shipping';
    address: string;
    borough?: string;
    zipCode: string;
    deliveryDate?: string;
    instructions?: string;
  };
  total: number;
  fee: number;
}

export async function sendOrderNotificationEmail(orderData: OrderEmailData) {
  console.log('Starting email send process...');
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

  if (typeof window !== 'undefined') {
    console.error('Attempted to call email function from client side');
    throw new Error('This function can only be called from the server side');
  }

  const itemsList = orderData.items
    .map(
      item => `
        ${item.name}${item.selectedVariation ? ` (${item.selectedVariation})` : ''} x ${item.quantity}
        Price: $${(item.price * item.quantity).toFixed(2)}
      `
    )
    .join('\n');

  const deliveryInfo = orderData.delivery.method === 'delivery'
    ? `
      Delivery Details:
      Borough: ${orderData.delivery.borough}
      Address: ${orderData.delivery.address}
      ZIP Code: ${orderData.delivery.zipCode}
      Delivery Date: ${orderData.delivery.deliveryDate}
      Instructions: ${orderData.delivery.instructions || 'None'}
    `
    : `
      Shipping Details:
      Address: ${orderData.delivery.address}
      ZIP Code: ${orderData.delivery.zipCode}
    `;

  const emailContent = `
    New Order Received (ID: ${orderData.orderId})

    Customer Information:
    Name: ${orderData.customerName}
    Email: ${orderData.customerEmail}
    Phone: ${orderData.customerPhone}

    Order Items:
    ${itemsList}

    ${deliveryInfo}

    Order Summary:
    Subtotal: $${(orderData.total - orderData.fee).toFixed(2)}
    ${orderData.delivery.method === 'delivery' ? 'Delivery' : 'Shipping'} Fee: $${orderData.fee.toFixed(2)}
    Total: $${orderData.total.toFixed(2)}
  `;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!process.env.ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not configured');
      throw new Error('ADMIN_EMAIL is not configured');
    }

    console.log('Attempting to send email...');
    const result = await resend.emails.send({
      from: 'Resend <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received - ${orderData.orderId}`,
      text: emailContent,
    });
    
    console.log('Email send result:', result);
    return result;
  } catch (error) {
    console.error('Failed to send order notification email:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
} 