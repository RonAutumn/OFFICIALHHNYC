import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);
    const { status } = await request.json();

    // Read the current orders
    const jsonDirectory = path.join(process.cwd(), 'backend/data/json');
    const fileContents = await fs.readFile(jsonDirectory + '/orders.json', 'utf8');
    const orders = JSON.parse(fileContents);

    // Find and update the order
    const orderIndex = orders.findIndex((order: any) => order.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order status
    orders[orderIndex].status = status;

    // Write the updated orders back to the file
    await fs.writeFile(
      jsonDirectory + '/orders.json',
      JSON.stringify(orders, null, 2)
    );

    return NextResponse.json(orders[orderIndex]);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 