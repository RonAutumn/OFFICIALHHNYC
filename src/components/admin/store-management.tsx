"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ProductsTable } from "./products-table"
import { CategoriesTable } from "./categories-table"

export function StoreManagement() {
  const handleSync = async () => {
    try {
      // Sync products
      const productsResponse = await fetch('/api/products/sync', {
        method: 'POST'
      })
      if (!productsResponse.ok) throw new Error('Failed to sync products')

      // Sync categories
      const categoriesResponse = await fetch('/api/categories/sync', {
        method: 'POST'
      })
      if (!categoriesResponse.ok) throw new Error('Failed to sync categories')

      toast.success('Store synced successfully')
    } catch (error) {
      console.error('Error syncing store:', error)
      toast.error('Failed to sync store')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Store Management</h3>

      <Tabs defaultValue="products">
        <div className="flex items-center justify-between">
          <TabsList className="w-[400px] grid grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <Button onClick={handleSync} size="sm">
            Sync from Airtable
          </Button>
        </div>
        <TabsContent value="products" className="mt-4">
          <ProductsTable showBundles={false} />
        </TabsContent>
        <TabsContent value="bundles" className="mt-4">
          <ProductsTable showBundles={true} />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTable />
        </TabsContent>
      </Tabs>
    </div>
  )
} 