import { NextRequest, NextResponse } from 'next/server';
import { 
  getLocalProductDetails, 
  saveLocalProductDetails, 
  deleteLocalProduct,
  updateLocalProduct,
  getLocalProduct
} from '@/lib/local-products'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getLocalProduct(params.id)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const details = await getLocalProductDetails(params.id)
    return NextResponse.json({ ...product, details })
  } catch (error) {
    console.error('Product API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive } = await request.json()
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const product = await updateLocalProduct(params.id, { 
      isActive,
      status: isActive ? 'active' : 'inactive'
    })
    const details = await getLocalProductDetails(params.id)
    return NextResponse.json({ ...product, details })
  } catch (error) {
    console.error('Error updating product status:', error)
    return NextResponse.json(
      { error: 'Failed to update product status' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    console.log('API: Updating product:', params.id, data)
    
    // Extract base product data and extended details
    const { details, ...productData } = data

    const product = await updateLocalProduct(params.id, productData)
    
    // Update extended details if provided
    if (details) {
      await saveLocalProductDetails({
        ...details,
        productId: params.id,
        lastUpdated: new Date().toISOString()
      })
    }
    
    // Get updated details
    const updatedDetails = await getLocalProductDetails(params.id)
    
    return NextResponse.json({
      ...product,
      details: updatedDetails
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteLocalProduct(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 