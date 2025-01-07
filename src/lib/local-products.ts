import fs from 'fs'
import path from 'path'
import type { Product } from './airtable'

export const LOCAL_PRODUCTS_DIR = path.join(process.cwd(), 'data')
export const PRODUCTS_FILE = path.join(LOCAL_PRODUCTS_DIR, 'products.json')

// Ensure the data directory exists
export function ensureDirectories() {
  if (!fs.existsSync(LOCAL_PRODUCTS_DIR)) {
    fs.mkdirSync(LOCAL_PRODUCTS_DIR, { recursive: true })
  }
}

// Initialize products file if it doesn't exist
export function initProductsFile() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]))
  }
}

// Get all local products
export async function getLocalProducts(): Promise<Product[]> {
  ensureDirectories()
  initProductsFile()
  const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8')
  return JSON.parse(content)
}

// Save products to file
export async function saveProductsToFile(products: Product[]) {
  ensureDirectories()
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))
}

// Create a new local product
export async function createLocalProduct(product: Partial<Product>): Promise<Product> {
  const products = await getLocalProducts()
  
  const newProduct: Product = {
    ...product as Product,
    id: product.id || `local_${Date.now()}`,
    status: product.isActive ? 'active' : 'inactive',
    needsSync: true
  }

  products.push(newProduct)
  await saveProductsToFile(products)
  return newProduct
}

// Update a local product
export async function updateLocalProduct(product: Partial<Product> & { id: string }): Promise<Product> {
  const products = await getLocalProducts()
  const index = products.findIndex(p => p.id === product.id)
  
  if (index === -1) {
    throw new Error('Product not found')
  }

  const updatedProduct: Product = {
    ...products[index],
    ...product,
    status: product.isActive ? 'active' : 'inactive',
    needsSync: true
  }

  products[index] = updatedProduct
  await saveProductsToFile(products)
  return updatedProduct
}

// Check if a product is local
export function isLocalProduct(id: string): boolean {
  return id.startsWith('local_')
}

// Get products that need to be synced
export async function getLocalProductsWithDetails(): Promise<Product[]> {
  const products = await getLocalProducts()
  return products.filter(product => product.needsSync)
}

// Get a single local product by ID
export async function getLocalProduct(id: string): Promise<Product | null> {
  const products = await getLocalProducts()
  return products.find(p => p.id === id) || null
}

// Get local product details
export async function getLocalProductDetails(id: string): Promise<Product | null> {
  return getLocalProduct(id)
}

// Save local product details
export async function saveLocalProductDetails(product: Partial<Product> & { id: string }): Promise<Product> {
  return updateLocalProduct(product)
}

// Delete a local product
export async function deleteLocalProduct(id: string): Promise<void> {
  const products = await getLocalProducts()
  const filteredProducts = products.filter(p => p.id !== id)
  await saveProductsToFile(filteredProducts)
} 