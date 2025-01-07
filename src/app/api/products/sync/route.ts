import { NextResponse } from 'next/server'
import { getProducts, saveProductsToFile, getLocalProducts } from '@/lib/airtable'

export async function POST() {
  try {
    // Fetch products from Airtable and save to local file
    const products = await getProducts()
    await saveProductsToFile(products)
    
    return NextResponse.json({
      message: 'Products synced successfully',
      count: products.length
    })
  } catch (error) {
    console.error('Error syncing products:', error)
    return NextResponse.json(
      { error: 'Failed to sync products' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Fetch products from local file instead of Airtable
    const products = await getLocalProducts()
    
    return NextResponse.json({
      products,
      count: products.length
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 