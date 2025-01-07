import fs from 'fs/promises'
import path from 'path'
import { ProductDetails } from './airtable'

const DETAILS_DIR = path.join(process.cwd(), 'data', 'products')

// Ensure the directory exists
async function ensureDetailsDir() {
  try {
    await fs.access(DETAILS_DIR)
  } catch {
    await fs.mkdir(DETAILS_DIR, { recursive: true })
  }
}

// Get the file path for a product's details
function getDetailsPath(productId: string): string {
  return path.join(DETAILS_DIR, `${productId}.json`)
}

// Get details for a single product
export async function getProductDetails(productId: string): Promise<ProductDetails | null> {
  try {
    const filePath = getDetailsPath(productId)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as ProductDetails
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
    throw error
  }
}

// Get details for multiple products
export async function getProductsDetails(productIds: string[]): Promise<Record<string, ProductDetails>> {
  const details: Record<string, ProductDetails> = {}
  await ensureDetailsDir()

  await Promise.all(
    productIds.map(async (id) => {
      const productDetails = await getProductDetails(id)
      if (productDetails) {
        details[id] = productDetails
      }
    })
  )

  return details
}

// Save or update product details
export async function saveProductDetails(details: ProductDetails): Promise<void> {
  await ensureDetailsDir()
  const filePath = getDetailsPath(details.productId)
  await fs.writeFile(filePath, JSON.stringify(details, null, 2))
}

// Delete product details
export async function deleteProductDetails(productId: string): Promise<void> {
  try {
    const filePath = getDetailsPath(productId)
    await fs.unlink(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
} 