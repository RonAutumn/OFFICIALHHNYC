import { NextRequest, NextResponse } from 'next/server';
import { 
  getLocalProductDetails, 
  saveLocalProductDetails, 
  deleteLocalProduct,
  updateLocalProduct,
  getLocalProduct
} from '@/lib/local-products'

interface Params {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const product = await getLocalProductDetails(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const data = await request.json()
    const { isActive } = data

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const product = await updateLocalProduct({
      id: params.id,
      isActive,
      status: isActive ? 'active' : 'inactive'
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const data = await request.json()
    console.log('API: Updating product:', params.id, data)
    
    // Extract base product data and extended details
    const { details, ...productData } = data

    // Ensure status is set based on isActive if present
    const status = productData.isActive !== undefined 
      ? (productData.isActive ? 'active' : 'inactive')
      : productData.status

    const product = await updateLocalProduct({
      ...productData,
      id: params.id,
      status
    })
    
    // Update extended details if provided
    if (details) {
      await saveLocalProductDetails({
        ...details,
        id: params.id,
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
  { params }: Params
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