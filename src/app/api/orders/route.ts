import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Order {
  id: string;
  timestamp: string;
  [key: string]: any;
}

export async function GET() {
  try {
    const ordersDir = path.join(process.cwd(), 'data', 'orders', 'accepted')
    const fileContents = fs.readFileSync(path.join(ordersDir, 'orders.json'), 'utf8')
    
    // Parse and deduplicate orders based on ID
    const orders: Order[] = JSON.parse(fileContents)
    const uniqueOrders: Order[] = Array.from(new Map(orders.map(order => [order.id, order])).values())
    
    // Sort orders by timestamp in descending order (newest first)
    const sortedOrders = uniqueOrders.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    return NextResponse.json(sortedOrders)
  } catch (error) {
    console.error('Error reading orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ordersDir = path.join(process.cwd(), 'data', 'orders', 'accepted')
    const fileContents = fs.readFileSync(path.join(ordersDir, 'orders.json'), 'utf8')
    const orders: Order[] = JSON.parse(fileContents)

    // Get the new order data from the request
    const newOrder: Order = await request.json()

    // Add timestamp and ensure ID is unique
    newOrder.timestamp = new Date().toISOString()
    newOrder.id = Date.now().toString()

    // Add the new order to the array
    orders.push(newOrder)

    // Write the updated orders back to the file
    fs.writeFileSync(path.join(ordersDir, 'orders.json'), JSON.stringify(orders, null, 2))

    return NextResponse.json(newOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 