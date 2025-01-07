import { NextResponse } from 'next/server';
import { sendOrderNotificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  console.log('Received email send request');
  
  try {
    const data = await request.json();
    console.log('Request data:', {
      orderId: data.orderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      method: data.delivery?.method,
    });
    
    const result = await sendOrderNotificationEmail({
      orderId: data.orderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      items: data.items,
      delivery: data.delivery,
      total: data.total,
      fee: data.fee,
    });

    console.log('Email sent successfully:', result);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to send order notification email:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending the email' },
      { status: 500 }
    );
  }
} 