import { getProducts } from '@/lib/airtable'
import { ProductsGrid } from '@/components/products-grid'
import { CategoriesPanel } from '@/components/categories-panel'

export default async function StorePage() {
  const products = await getProducts()
  
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <CategoriesPanel />
        <ProductsGrid products={products} />
      </div>
    </div>
  )
} 