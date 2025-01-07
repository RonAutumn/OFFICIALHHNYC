import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the JSON file
    const jsonDirectory = path.join(process.cwd(), 'backend/data/json')
    const fileContents = await fs.readFile(jsonDirectory + '/orders.json', 'utf8')
    
    // Parse and deduplicate orders based on ID
    const orders = JSON.parse(fileContents)
    const uniqueOrders = Array.from(new Map(orders.map(order => [order.id, order])).values())
    
    // Sort orders by timestamp in descending order (newest first)
    const sortedOrders = uniqueOrders.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0)
      const dateB = new Date(b.timestamp || 0)
      return dateB.getTime() - dateA.getTime()
    })

    // Return the orders
    return NextResponse.json(sortedOrders)
  } catch (error) {
    console.error('Error reading orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const jsonDirectory = path.join(process.cwd(), 'backend/data/json')
    const fileContents = await fs.readFile(jsonDirectory + '/orders.json', 'utf8')
    const orders = JSON.parse(fileContents)

    // Get the new order data from the request
    const newOrder = await request.json()

    // Add timestamp and ensure ID is unique
    newOrder.timestamp = new Date().toISOString()
    newOrder.id = Date.now()

    // Add the new order to the array
    orders.push(newOrder)

    // Write the updated orders back to the file
    await fs.writeFile(jsonDirectory + '/orders.json', JSON.stringify(orders, null, 2))

    return NextResponse.json(newOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 