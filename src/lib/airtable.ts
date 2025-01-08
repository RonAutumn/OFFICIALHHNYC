import { promises as fs } from 'fs'
import path from 'path'
import Airtable from 'airtable'

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable environment variables')
}

// Initialize Airtable
export const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID)

// File paths
const LOCAL_PRODUCTS_DIR = path.join(process.cwd(), 'data', 'local-products')
const PRODUCTS_FILE = path.join(LOCAL_PRODUCTS_DIR, 'products.json')
const CATEGORIES_FILE = path.join(LOCAL_PRODUCTS_DIR, 'categories.json')
const ORDERS_FILE = path.join(LOCAL_PRODUCTS_DIR, 'orders.json')

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.access(LOCAL_PRODUCTS_DIR)
  } catch {
    await fs.mkdir(LOCAL_PRODUCTS_DIR, { recursive: true })
  }
}

// Initialize products file if it doesn't exist
async function initProductsFile() {
  try {
    await fs.access(PRODUCTS_FILE)
  } catch {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify({ products: [] }, null, 2))
  }
}

// Initialize categories file if it doesn't exist
async function initCategoriesFile() {
  try {
    await fs.access(CATEGORIES_FILE)
  } catch {
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify({ categories: [] }, null, 2))
  }
}

// Initialize orders file if it doesn't exist
async function initOrdersFile() {
  try {
    await fs.access(ORDERS_FILE)
  } catch {
    await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders: [] }, null, 2))
  }
}

// Initialize files
ensureDirectories()
  .then(() => Promise.all([initProductsFile(), initCategoriesFile(), initOrdersFile()]))
  .catch(console.error)

// Product Variation Types
export type VariationType = 'flavor' | 'size' | 'brand' | 'strain' | 'weight'

export interface ProductVariation {
  id: string
  type: VariationType
  name: string
  price?: number // Additional price
  sku?: string
  stock?: number
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  displayOrder?: number
  isActive: boolean
  products?: string[]
  slug?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string[]
  categoryNames?: string[]
  isActive: boolean
  imageUrl?: string
  stock: number
  status: string
  weightSize?: string | number
}

export interface DeliverySetting {
  borough: string
  deliveryFee: number
  freeDeliveryMinimum: number
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  borough: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentMethod: 'cash' | 'card' | 'other'
  notes?: string
  createdAt: string
  updatedAt: string
  syncedToAirtable: boolean
}

// Get all local orders
async function getLocalOrders(): Promise<Order[]> {
  await ensureDirectories()
  await initOrdersFile()

  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8')
    return JSON.parse(data).orders
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

// Save orders to local file
async function saveOrdersToFile(orders: Order[]): Promise<void> {
  await ensureDirectories()
  await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders }, null, 2))
}

// Create a new local order
export async function createLocalOrder(orderData: Omit<Order, 'id' | 'syncedToAirtable'>): Promise<Order> {
  const orders = await getLocalOrders()
  
  const newOrder: Order = {
    ...orderData,
    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    syncedToAirtable: false
  }

  await saveOrdersToFile([...orders, newOrder])
  
  // Try to sync immediately if possible
  try {
    await syncOrderToAirtable(newOrder)
  } catch (error) {
    console.error('Failed to sync order to Airtable:', error)
    // Don't throw error here, as the order is still saved locally
  }

  return newOrder
}

// Sync a single order to Airtable
export async function syncOrderToAirtable(order: Order): Promise<void> {
  if (order.syncedToAirtable) {
    return
  }

  try {
    await base('Orders').create({
      'Order Number': order.orderNumber,
      'Customer Name': order.customerName,
      'Customer Email': order.customerEmail,
      'Customer Phone': order.customerPhone,
      'Delivery Address': order.deliveryAddress,
      'Borough': order.borough,
      'Items': JSON.stringify(order.items),
      'Subtotal': order.subtotal,
      'Delivery Fee': order.deliveryFee,
      'Total': order.total,
      'Status': order.status,
      'Payment Status': order.paymentStatus,
      'Payment Method': order.paymentMethod,
      'Notes': order.notes,
      'Created At': order.createdAt,
      'Updated At': order.updatedAt
    })

    // Update local order to mark as synced
    const orders = await getLocalOrders()
    const updatedOrders = orders.map(o => 
      o.id === order.id ? { ...o, syncedToAirtable: true } : o
    )
    await saveOrdersToFile(updatedOrders)

  } catch (error) {
    console.error('Error syncing order to Airtable:', error)
    throw error
  }
}

// Sync all unsynced orders to Airtable
export async function syncUnsynedOrders(): Promise<void> {
  const orders = await getLocalOrders()
  const unsynced = orders.filter(order => !order.syncedToAirtable)

  for (const order of unsynced) {
    try {
      await syncOrderToAirtable(order)
    } catch (error) {
      console.error(`Failed to sync order ${order.id}:`, error)
      // Continue with next order even if one fails
    }
  }
}

// Get all orders (both local and from Airtable)
export async function getAllOrders(): Promise<Order[]> {
  const localOrders = await getLocalOrders()
  
  try {
    const records = await base('Orders').select({
      sort: [{ field: 'Created At', direction: 'desc' }]
    }).all()

    const airtableOrders = records.map(record => ({
      id: record.id,
      orderNumber: record.get('Order Number') as string,
      customerName: record.get('Customer Name') as string,
      customerEmail: record.get('Customer Email') as string,
      customerPhone: record.get('Customer Phone') as string,
      deliveryAddress: record.get('Delivery Address') as string,
      borough: record.get('Borough') as string,
      items: JSON.parse(record.get('Items') as string) as OrderItem[],
      subtotal: record.get('Subtotal') as number,
      deliveryFee: record.get('Delivery Fee') as number,
      total: record.get('Total') as number,
      status: record.get('Status') as Order['status'],
      paymentStatus: record.get('Payment Status') as Order['paymentStatus'],
      paymentMethod: record.get('Payment Method') as Order['paymentMethod'],
      notes: record.get('Notes') as string,
      createdAt: record.get('Created At') as string,
      updatedAt: record.get('Updated At') as string,
      syncedToAirtable: true
    }))

    // Combine and sort by creation date
    const allOrders = [...localOrders, ...airtableOrders]
    return allOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  } catch (error) {
    console.error('Error fetching orders from Airtable:', error)
    // Return local orders if Airtable fetch fails
    return localOrders
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string, 
  status: Order['status']
): Promise<void> {
  const orders = await getLocalOrders()
  const orderIndex = orders.findIndex(o => o.id === orderId)

  if (orderIndex === -1) {
    // If not found locally, try to update in Airtable
    try {
      await base('Orders').update(orderId, {
        'Status': status,
        'Updated At': new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating order status in Airtable:', error)
      throw error
    }
    return
  }

  // Update local order
  const updatedOrder = {
    ...orders[orderIndex],
    status,
    updatedAt: new Date().toISOString()
  }
  orders[orderIndex] = updatedOrder

  await saveOrdersToFile(orders)

  // If the order was previously synced, update Airtable as well
  if (updatedOrder.syncedToAirtable) {
    try {
      await base('Orders').update(orderId, {
        'Status': status,
        'Updated At': updatedOrder.updatedAt
      })
    } catch (error) {
      console.error('Error updating order status in Airtable:', error)
      // Don't throw here as local update was successful
    }
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    console.log('Fetching categories from Airtable...')
    const records = await base('Category').select({
      sort: [{ field: 'Display Order', direction: 'asc' }],
      filterByFormula: '{Is Active} = TRUE()'
    }).all()

    console.log(`Found ${records.length} categories`)
    
    // Create a Map to store unique categories by name
    const categoryMap = new Map<string, Category>()

    records.forEach(record => {
      const name = record.get('Name') as string
      if (!name) return // Skip if no name

      const existing = categoryMap.get(name)
      if (existing) {
        // Merge products arrays if they exist
        const newProducts = record.get('Products') as string[] | undefined
        if (newProducts) {
          existing.products = [...(existing.products || []), ...newProducts]
        }
      } else {
        categoryMap.set(name, {
          id: record.id,
          name,
          description: record.get('Description') as string,
          displayOrder: record.get('Display Order') as number,
          isActive: record.get('Is Active') as boolean,
          products: record.get('Products') as string[],
          slug: record.get('Slug') as string,
        })
      }
    })

    // Convert Map back to array and sort by display order
    const categories = Array.from(categoryMap.values())
    return categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  try {
    const record = await base('Category').create({
      Name: data.name || '',
      Description: data.description || '',
      'Display Order': data.displayOrder || 0,
      'Is Active': data.isActive || false,
      Products: data.products || [],
      Slug: data.slug || '',
    })

    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      displayOrder: record.get('Display Order') as number,
      isActive: record.get('Is Active') as boolean,
      products: record.get('Products') as string[],
      slug: record.get('Slug') as string,
    }
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

// Get all local categories
export async function getLocalCategories(): Promise<Category[]> {
  await ensureDirectories()
  await initCategoriesFile()

  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8')
    return JSON.parse(data).categories
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

// Get all categories (both Airtable and local)
export async function getAllCategories(): Promise<Category[]> {
  try {
    const [airtableCategories, localCategories] = await Promise.all([
      getCategories(),
      getLocalCategories()
    ])

    // Filter local categories to only include ones with local_ prefix
    const validLocalCategories = localCategories.filter(c => isLocalCategory(c.id))

    // Combine and sort by display order
    const allCategories = [...airtableCategories, ...validLocalCategories]
    return allCategories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  } catch (error) {
    console.error('Error fetching all categories:', error)
    return getLocalCategories() // Fallback to local categories if Airtable fails
  }
}

// Check if a category is local
export function isLocalCategory(id: string): boolean {
  return id.startsWith('local_')
}

// Save categories to file
export async function saveCategoriesToFile(categories: Category[]): Promise<void> {
  await ensureDirectories()
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify({ categories }, null, 2))
}

// Create a new local category
export async function createLocalCategory(data: Partial<Category>): Promise<Category> {
  const categories = await getLocalCategories()
  
  const newCategory: Category = {
    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: data.name || '',
    description: data.description || '',
    displayOrder: data.displayOrder || categories.length + 1,
    isActive: data.isActive ?? true,
    products: data.products || [],
    slug: data.slug || ''
  }

  await saveCategoriesToFile([...categories, newCategory])
  return newCategory
}

// Update a local category
export async function updateLocalCategory(id: string, data: Partial<Category>): Promise<Category> {
  const categories = await getLocalCategories()
  const index = categories.findIndex(c => c.id === id)

  if (index === -1) {
    throw new Error('Category not found')
  }

  const updatedCategory = {
    ...categories[index],
    ...data,
    id // Ensure ID doesn't change
  }

  categories[index] = updatedCategory
  await saveCategoriesToFile(categories)
  return updatedCategory
}

// Update category in Airtable
export async function updateCategory(categoryId: string, data: Partial<Category>): Promise<Category> {
  try {
    console.log(`Updating category ${categoryId}...`)
    const record = await base('Category').update(categoryId, {
      'Name': data.name,
      'Description': data.description,
      'Display Order': data.displayOrder,
      'Is Active': data.isActive,
      'Products': data.products,
      'Slug': data.slug
    })

    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      displayOrder: record.get('Display Order') as number,
      isActive: record.get('Is Active') as boolean,
      products: record.get('Products') as string[],
      slug: record.get('Slug') as string,
    }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

// Get all products from Airtable
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('Fetching products from Airtable...')
    const records = await base('Products').select({
      sort: [{ field: 'Name', direction: 'asc' }]
    }).all()

    return records.map(record => ({
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      price: record.get('Price') as number,
      category: record.get('Category') as string[],
      categoryNames: record.get('Category Names') as string[],
      isActive: record.get('Is Active') as boolean,
      imageUrl: record.get('Image URL') as string,
      stock: record.get('Stock') as number,
      status: record.get('Status') as string,
      weightSize: record.get('Weight/Size') as string | number
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}