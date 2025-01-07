import { NextResponse } from 'next/server'
import { getCategories, saveCategoriesToFile } from '@/lib/airtable'

export async function POST() {
  try {
    // Fetch categories from Airtable
    const categories = await getCategories()
    
    // Save to local file
    await saveCategoriesToFile(categories)
    
    return NextResponse.json({
      message: 'Categories synced successfully',
      count: categories.length
    })
  } catch (error) {
    console.error('Error syncing categories:', error)
    return NextResponse.json(
      { error: 'Failed to sync categories' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Fetch categories from Airtable
    const categories = await getCategories()
    
    return NextResponse.json({
      categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
} 