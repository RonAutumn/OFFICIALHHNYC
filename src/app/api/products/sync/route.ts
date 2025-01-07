import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/airtable'
import { getLocalProducts, saveProductsToFile } from '@/lib/local-products'

export async function GET() {
  try {
    // Get products from Airtable
    const airtableProducts = await getProducts()
    
    // Get local products
    const localProducts = await getLocalProducts()
    
    // Merge products, preferring Airtable data but keeping local products not in Airtable
    const mergedProducts = [...airtableProducts]
    
    // Add local products that aren't in Airtable
    localProducts.forEach(localProduct => {
      if (!airtableProducts.find(p => p.id === localProduct.id)) {
        mergedProducts.push(localProduct)
      }
    })
    
    // Save merged products to local file
    await saveProductsToFile(mergedProducts)
    
    return NextResponse.json({ success: true, count: mergedProducts.length })
  } catch (error) {
    console.error('Error syncing products:', error)
    return NextResponse.json(
      { error: 'Failed to sync products' },
      { status: 500 }
    )
  }
} 