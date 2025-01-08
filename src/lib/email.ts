'use server';

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  try {
    if (!resend) {
      console.warn('Resend API key not configured. Skipping email notification.');
      return;
    }

    const { orderId, customerName, customerEmail, customerPhone, items, delivery, total, fee } = orderData;

    const itemsList = items.map(item => `
      ${item.name} ${item.selectedVariation ? `(${item.selectedVariation})` : ''} x${item.quantity} - $${item.price.toFixed(2)}
    `).join('\n');

    const emailHtml = `
      <h1>Order Confirmation - #${orderId}</h1>
      <p>Thank you for your order, ${customerName}!</p>
      
      <h2>Order Details</h2>
      <p>Order ID: ${orderId}</p>
      <p>Customer Name: ${customerName}</p>
      <p>Phone: ${customerPhone}</p>
      
      <h3>Items:</h3>
      <pre>${itemsList}</pre>
      
      <h3>Delivery Details:</h3>
      <p>Method: ${delivery.method}</p>
      <p>Address: ${delivery.address}</p>
      ${delivery.borough ? `<p>Borough: ${delivery.borough}</p>` : ''}
      ${delivery.instructions ? `<p>Instructions: ${delivery.instructions}</p>` : ''}
      ${delivery.deliveryDate ? `<p>Delivery Date: ${delivery.deliveryDate}</p>` : ''}
      
      <h3>Total:</h3>
      <p>Subtotal: $${(total - fee).toFixed(2)}</p>
      <p>Delivery Fee: $${fee.toFixed(2)}</p>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
    `;

    const result = await resend.emails.send({
      from: 'HHNYC Orders <orders@happyhournyc.com>',
      to: [customerEmail],
      subject: `Order Confirmation - #${orderId}`,
      html: emailHtml,
    });

    console.log('Email sent:', result);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to send email:', error.message);
      throw error;
    }
    throw error;
  }
}