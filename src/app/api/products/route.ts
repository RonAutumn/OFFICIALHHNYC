import { NextResponse } from 'next/server'
import { getLocalProducts, createLocalProduct, updateLocalProduct } from '@/lib/local-products'
import { Product } from '@/lib/airtable'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const showBundles = searchParams.get('showBundles') === 'true'

    // Get all products
    const allProducts = await getLocalProducts()
    
    // Filter products based on category and bundle status
    const products = allProducts.filter(product => {
      const isBundleProduct = product.type === 'bundle'
      
      if (categoryId === 'deals_category') {
        return isBundleProduct && product.isActive
      }
      
      if (showBundles !== undefined) {
        return showBundles ? isBundleProduct : !isBundleProduct
      }
      
      if (categoryId) {
        return product.categoryId === categoryId && product.isActive
      }
      
      return product.isActive
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()
    const newProduct = await createLocalProduct(product)
    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const product = await request.json()
    const updatedProduct = await updateLocalProduct({
      ...product,
      id: product.id
    })
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
} 