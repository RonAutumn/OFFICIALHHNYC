import { promises as fs } from 'fs'
import path from 'path'
import Airtable from 'airtable'

// Initialize Airtable if environment variables are present
const airtableConfig = {
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: process.env.AIRTABLE_BASE_ID
};

export const base = airtableConfig.apiKey && airtableConfig.baseId
  ? new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.baseId)
  : null;

// File paths
const LOCAL_PRODUCTS_DIR = path.join(process.cwd(), 'data', 'local-products')
const PRODUCTS_FILE = path.join(LOCAL_PRODUCTS_DIR, 'products.json')
const CATEGORIES_FILE = path.join(LOCAL_PRODUCTS_DIR, 'categories.json')

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

// Get all local products
async function getLocalProducts(): Promise<Product[]> {
  await ensureDirectories()
  await initProductsFile()

  const data = await fs.readFile(PRODUCTS_FILE, 'utf-8')
  return JSON.parse(data).products
}

// Get all local categories
async function getLocalCategories(): Promise<Category[]> {
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

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  variations?: string[];
  products?: string[];
}

// Product Variation Types
export type VariationType = 'flavor' | 'size' | 'brand' | 'strain' | 'weight';

export interface ProductVariation {
  id: string;
  type: VariationType;
  name: string;
  price?: number; // Additional price
  sku?: string;
  stock?: number;
  isActive: boolean;
}

export interface VariationOption {
  id: string;
  name: string;
  type: VariationType;
  values: string[];
}

// Base Airtable Product Interface
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string[];
  categoryNames?: string[];
  isActive: boolean;
  imageUrl?: string;
  stock: number;
  status: string;
  weightSize?: string | number;
  type?: 'flower' | 'edible' | 'cart' | 'other' | 'bundle';
  variations?: ProductVariation[];
  needsSync?: boolean;
  details?: ProductDetails;
  bundleProducts?: Array<{
    id: string;
    quantity: number;
    product: Product;
  }>;
  bundleSavings?: number;
  isSpecialDeal?: boolean;
  specialPrice?: number;
  specialStartDate?: string;
  specialEndDate?: string;
}

// Extended Product Details Interface
export interface ProductDetails {
  productId: string;
  // Base Cannabis Info
  thcContent?: number;
  cbdContent?: number;
  thcvContent?: number;
  cbgContent?: number;
  cbcContent?: number;
  terpenes?: string[];
  strain?: 'sativa' | 'indica' | 'hybrid';
  strainRatio?: string;
  effects?: string[];
  
  // Cart Specific
  cartType?: 'distillate' | 'live resin' | 'full spectrum' | 'co2';
  cartridgeSize?: '0.5g' | '1.0g';
  batteryCompatibility?: string[];
  hardwareType?: string;
  coilType?: string;
  cartFlavors?: string[]; // Available flavors for this cart
  cartBrands?: string[]; // Available brands for this cart
  
  // Flower Specific
  flowerWeights?: string[]; // Available weights for flower
  flowerGrade?: 'top shelf' | 'mid shelf' | 'value';
  cureMethod?: string;
  trimType?: 'hand' | 'machine';
  
  // Edible Specific
  servingSize?: string;
  servingsPerPackage?: number;
  ingredients?: string;
  allergens?: string;
  storageInstructions?: string;
  edibleFlavors?: string[]; // Available flavors for edibles
  
  // Lab Results
  labTested?: boolean;
  labTestDate?: string;
  labTestProvider?: string;
  coa?: string; // Certificate of Analysis URL
  
  // Compliance
  warningLabels?: string[];
  childResistant?: boolean;
  complianceNotes?: string;
  
  // Metadata
  lastUpdated: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expirationDate?: string;
  
  // Variation Templates
  variationTemplates?: {
    [key in VariationType]?: string[]; // Predefined options for each variation type
  };
}

// Combined Product Interface for UI
export interface ProductWithDetails extends Product {
  details?: ProductDetails;
}

export interface DeliverySetting {
  borough: string;
  deliveryFee: number;
  freeDeliveryMinimum: number;
}

export async function getCategories(): Promise<Category[]> {
  try {
    console.log('Fetching categories from Airtable...');
    
    if (!base) {
      console.warn('Airtable not configured. Returning empty categories array.');
      return [];
    }

    const records = await base('Category').select({
      sort: [{ field: 'Display Order', direction: 'asc' }],
    }).all();

    console.log(`Found ${records.length} categories`);
    return records.map((record) => ({
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      displayOrder: record.get('Display Order') as number,
      isActive: record.get('Is Active') as boolean,
      variations: record.get('Variations') as string[],
      products: record.get('Products') as string[],
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    console.log('Fetching products from Airtable...');
    
    if (!base) {
      console.warn('Airtable not configured. Returning empty products array.');
      return [];
    }

    const records = await base('Products').select({
      sort: [{ field: 'Name', direction: 'asc' }],
      view: 'Grid view',
      fields: [
        'Name',
        'Description',
        'Price',
        'Category',
        'Status',
        'Image URL',
        'Stock',
        'Weight/Size',
        'Name (from Category)',
        'Is Active (from Category)'
      ]
    }).all();

    console.log(`Found ${records.length} products`);
    return records.map((record) => {
      const status = record.get('Status') as string;
      const categoryNames = (record.get('Name (from Category)') || []) as string[];
      const isActiveFromCategory = (record.get('Is Active (from Category)') || [true]) as boolean[];
      const weightSize = record.get('Weight/Size');
      
      // Convert weight/size to number if possible
      const parsedWeightSize = typeof weightSize === 'string' ? 
        parseFloat(weightSize) || weightSize : 
        (typeof weightSize === 'number' ? weightSize : undefined);

      return {
        id: record.id,
        name: record.get('Name') as string,
        description: record.get('Description') as string,
        price: record.get('Price') as number,
        category: record.get('Category') as string[],
        categoryNames,
        isActive: (status?.toLowerCase() === 'active') && 
          isActiveFromCategory.every(Boolean),
        imageUrl: record.get('Image URL') as string,
        stock: record.get('Stock') as number,
        status: status || 'inactive',
        weightSize: parsedWeightSize
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    console.log(`Fetching products for category ${categoryId}...`);
    
    if (!base) {
      console.warn('Airtable not configured. Returning empty products array.');
      return [];
    }

    const records = await base('Products').select({
      filterByFormula: `FIND("${categoryId}", ARRAYJOIN(Category, ",")) > 0`,
      sort: [{ field: 'Name', direction: 'asc' }],
      view: 'Grid view',
      fields: [
        'Name',
        'Description',
        'Price',
        'Category',
        'Status',
        'Image URL',
        'Stock',
        'Weight/Size',
        'Name (from Category)',
        'Is Active (from Category)'
      ]
    }).all();

    console.log(`Found ${records.length} products in category`);
    return records.map((record) => {
      const status = record.get('Status') as string;
      const categoryNames = (record.get('Name (from Category)') || []) as string[];
      const isActiveFromCategory = (record.get('Is Active (from Category)') || [true]) as boolean[];
      const weightSize = record.get('Weight/Size');
      
      // Convert weight/size to number if possible
      const parsedWeightSize = typeof weightSize === 'string' ? 
        parseFloat(weightSize) || weightSize : 
        (typeof weightSize === 'number' ? weightSize : undefined);

      return {
        id: record.id,
        name: record.get('Name') as string,
        description: record.get('Description') as string,
        price: record.get('Price') as number,
        category: record.get('Category') as string[],
        categoryNames,
        isActive: (status?.toLowerCase() === 'active') && 
          isActiveFromCategory.every(Boolean),
        imageUrl: record.get('Image URL') as string,
        stock: record.get('Stock') as number,
        status: status || 'inactive',
        weightSize: parsedWeightSize
      };
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}

export async function getDeliverySettings(): Promise<DeliverySetting[]> {
  try {
    console.log('Fetching delivery settings from Airtable...');
    
    if (!base) {
      console.warn('Airtable not configured. Returning default delivery settings.');
      return [
        {
          borough: 'Manhattan',
          deliveryFee: 10,
          freeDeliveryMinimum: 100,
        },
        {
          borough: 'Brooklyn',
          deliveryFee: 15,
          freeDeliveryMinimum: 150,
        },
      ];
    }

    const records = await base('Settings').select({
      view: 'Grid view'
    }).all();

    console.log(`Found ${records.length} delivery settings`);
    return records.map((record) => ({
      borough: record.get('Borough') as string,
      deliveryFee: record.get('Delivery fee') as number,
      freeDeliveryMinimum: record.get('Free Delivery Minimum') as number,
    }));
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    throw error;
  }
}

export async function updateProductStatus(productId: string, isActive: boolean): Promise<Product> {
  try {
    console.log(`Updating product ${productId} status to ${isActive}...`);
    
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const record = await base('Products').update(productId, {
      'Status': isActive ? 'active' : 'inactive',
    });

    const status = record.get('Status') as string;
    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      price: record.get('Price') as number,
      category: record.get('Category') as string[],
      isActive: status?.toLowerCase() === 'active',
      imageUrl: record.get('Image URL') as string,
      stock: record.get('Stock') as number,
      status: status || 'inactive',
      weightSize: record.get('Weight/Size') as string,
    };
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
  try {
    console.log(`Updating product ${productId}...`);
    
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const record = await base('Products').update(productId, {
      'Name': data.name,
      'Description': data.description,
      'Price': data.price,
      'Category': data.category,
      'Status': data.status,
      'Image URL': data.imageUrl,
      'Stock': data.stock,
      'Weight/Size': data.weightSize,
    });

    const status = record.get('Status') as string;
    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      price: record.get('Price') as number,
      category: record.get('Category') as string[],
      isActive: status?.toLowerCase() === 'active',
      imageUrl: record.get('Image URL') as string,
      stock: record.get('Stock') as number,
      status: status || 'inactive',
      weightSize: record.get('Weight/Size') as string,
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  try {
    console.log('Creating new product...');
    
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const record = await base('Products').create({
      'Name': data.name,
      'Description': data.description,
      'Price': data.price,
      'Category': data.category,
      'Status': data.status || 'active',
      'Image URL': data.imageUrl,
      'Stock': data.stock,
      'Weight/Size': data.weightSize,
    });

    const status = record.get('Status') as string;
    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      price: record.get('Price') as number,
      category: record.get('Category') as string[],
      isActive: status?.toLowerCase() === 'active',
      imageUrl: record.get('Image URL') as string,
      stock: record.get('Stock') as number,
      status: status || 'inactive',
      weightSize: record.get('Weight/Size') as string,
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Create a new local product
export async function createLocalProduct(data: Partial<Product>): Promise<Product> {
  await ensureDirectories()
  await initProductsFile()

  const products = await getLocalProducts()
  
  const newProduct: Product = {
    id: `local_${Date.now()}`,
    name: data.name || '',
    description: data.description || '',
    price: data.price || 0,
    category: data.category || [],
    isActive: data.isActive ?? true,
    imageUrl: data.imageUrl || '',
    stock: data.stock || 0,
    status: data.status || 'active',
    weightSize: data.weightSize || ''
  }

  await fs.writeFile(
    PRODUCTS_FILE,
    JSON.stringify({ products: [...products, newProduct] }, null, 2)
  )

  return newProduct
}

// Update a local product
export async function updateLocalProduct(product: Partial<Product> & { id: string }): Promise<Product> {
  const products = await getLocalProducts()
  const index = products.findIndex(p => p.id === product.id)

  if (index === -1) {
    throw new Error('Product not found')
  }

  const updatedProduct = {
    ...products[index],
    ...product,
    id: product.id // Ensure ID doesn't change
  }

  products[index] = updatedProduct

  await fs.writeFile(
    PRODUCTS_FILE,
    JSON.stringify({ products }, null, 2)
  )

  return updatedProduct
}

// Check if a product is local
export function isLocalProduct(id: string): boolean {
  return id.startsWith('local_')
}

// Save products to file
export async function saveProductsToFile(products: Product[]): Promise<void> {
  try {
    await ensureDirectories()
    
    // Get existing local products
    const existingProducts = await getLocalProducts()
    const localProducts = existingProducts.filter(p => isLocalProduct(p.id))
    
    // Merge Airtable products with local products
    const mergedProducts = [
      ...products, // Airtable products
      ...localProducts // Local products
    ]
    
    await fs.writeFile(
      PRODUCTS_FILE,
      JSON.stringify({ products: mergedProducts }, null, 2)
    )
    console.log('Products saved to file successfully')
  } catch (error) {
    console.error('Error saving products to file:', error)
    throw error
  }
}

// Get all products (both Airtable and local)
export async function getAllProducts(): Promise<Product[]> {
  try {
    const [airtableProducts, localProducts] = await Promise.all([
      getProducts(),
      getLocalProducts()
    ])

    // Filter local products to only include ones with local_ prefix
    const validLocalProducts = localProducts.filter(p => isLocalProduct(p.id))

    return [...airtableProducts, ...validLocalProducts]
  } catch (error) {
    console.error('Error getting all products:', error)
    throw error
  }
}

// Check if a category is local
export function isLocalCategory(id: string): boolean {
  return id.startsWith('local_')
}

// Save categories to file
export async function saveCategoriesToFile(categories: Category[]): Promise<void> {
  try {
    await ensureDirectories()
    
    // Get existing local categories
    const existingCategories = await getLocalCategories()
    const localCategories = existingCategories.filter(c => isLocalCategory(c.id))
    
    // Merge Airtable categories with local categories
    const mergedCategories = [
      ...categories, // Airtable categories
      ...localCategories // Local categories
    ]
    
    await fs.writeFile(
      CATEGORIES_FILE,
      JSON.stringify({ categories: mergedCategories }, null, 2)
    )
    console.log('Categories saved to file successfully')
  } catch (error) {
    console.error('Error saving categories to file:', error)
    throw error
  }
}

// Create a new local category
export async function createLocalCategory(data: Partial<Category>): Promise<Category> {
  await ensureDirectories()
  await initCategoriesFile()

  const categories = await getLocalCategories()
  
  const newCategory: Category = {
    id: `local_${Date.now()}`,
    name: data.name || '',
    description: data.description || '',
    displayOrder: data.displayOrder || categories.length + 1,
    isActive: data.isActive ?? true,
    variations: data.variations || [],
    products: data.products || []
  }

  await fs.writeFile(
    CATEGORIES_FILE,
    JSON.stringify({ categories: [...categories, newCategory] }, null, 2)
  )

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

  await fs.writeFile(
    CATEGORIES_FILE,
    JSON.stringify({ categories }, null, 2)
  )

  return updatedCategory
}

// Get all categories (both Airtable and local)
export async function getAllCategories(): Promise<Category[]> {
  try {
    // Get categories from local file
    const localCategories = await getLocalCategories();
    
    // Sort by display order
    return localCategories.sort((a, b) => 
      (a.displayOrder || 0) - (b.displayOrder || 0)
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Update category in Airtable
export async function updateCategory(categoryId: string, data: Partial<Category>): Promise<Category> {
  try {
    console.log(`Updating category ${categoryId}...`)
    
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const record = await base('Category').update(categoryId, {
      'Name': data.name,
      'Description': data.description,
      'Display Order': data.displayOrder,
      'Is Active': data.isActive,
      'Variations': data.variations,
      'Products': data.products
    })

    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      displayOrder: record.get('Display Order') as number,
      isActive: record.get('Is Active') as boolean,
      variations: record.get('Variations') as string[],
      products: record.get('Products') as string[]
    }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

// Create category in Airtable
export async function createCategory(data: Partial<Category>): Promise<Category> {
  try {
    console.log('Creating new category...')
    
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const record = await base('Category').create({
      'Name': data.name,
      'Description': data.description,
      'Display Order': data.displayOrder,
      'Is Active': data.isActive ?? true,
      'Variations': data.variations || [],
      'Products': data.products || []
    })

    return {
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      displayOrder: record.get('Display Order') as number,
      isActive: record.get('Is Active') as boolean,
      variations: record.get('Variations') as string[],
      products: record.get('Products') as string[]
    }
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}