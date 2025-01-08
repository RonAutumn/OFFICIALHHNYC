import fs from 'fs'
import path from 'path'
import type { Product } from '@/types/product'

export const LOCAL_BUNDLES_DIR = path.join(process.cwd(), 'data')
export const BUNDLES_FILE = path.join(LOCAL_BUNDLES_DIR, 'bundles.json')

// Ensure the data directory exists
export function ensureDirectories() {
  if (!fs.existsSync(LOCAL_BUNDLES_DIR)) {
    fs.mkdirSync(LOCAL_BUNDLES_DIR, { recursive: true })
  }
}

// Initialize bundles file if it doesn't exist
export function initBundlesFile() {
  if (!fs.existsSync(BUNDLES_FILE)) {
    fs.writeFileSync(BUNDLES_FILE, JSON.stringify([]))
  }
}

// Get all local bundles
export async function getLocalBundles(): Promise<Product[]> {
  ensureDirectories()
  initBundlesFile()
  const content = fs.readFileSync(BUNDLES_FILE, 'utf-8')
  return JSON.parse(content)
}

// Save bundles to file
export async function saveBundlesToFile(bundles: Product[]) {
  ensureDirectories()
  fs.writeFileSync(BUNDLES_FILE, JSON.stringify(bundles, null, 2))
}

// Create a new local bundle
export async function createLocalBundle(bundle: Partial<Product>): Promise<Product> {
  const bundles = await getLocalBundles()
  
  const newBundle: Product = {
    ...bundle as Product,
    id: bundle.id || `bundle_${Date.now()}`,
    status: bundle.isActive ? 'active' : 'inactive',
    category: ['deals_category'], // Always assign to deals category
    needsSync: true
  }

  bundles.push(newBundle)
  await saveBundlesToFile(bundles)
  return newBundle
}

// Update a local bundle
export async function updateLocalBundle(bundle: Partial<Product> & { id: string }): Promise<Product> {
  const bundles = await getLocalBundles()
  const index = bundles.findIndex(p => p.id === bundle.id)
  
  if (index === -1) {
    throw new Error('Bundle not found')
  }

  const updatedBundle: Product = {
    ...bundles[index],
    ...bundle,
    status: bundle.isActive ? 'active' : 'inactive',
    category: ['deals_category'], // Ensure it stays in deals category
    needsSync: true
  }

  bundles[index] = updatedBundle
  await saveBundlesToFile(bundles)
  return updatedBundle
}

// Check if a product is a bundle
export function isBundle(id: string): boolean {
  return id.startsWith('bundle_')
}

// Get a single local bundle by ID
export async function getLocalBundle(id: string): Promise<Product | null> {
  const bundles = await getLocalBundles()
  return bundles.find(p => p.id === id) || null
} 