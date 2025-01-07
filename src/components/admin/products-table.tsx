"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, MoreHorizontal, Plus, ImagePlus, Trash2, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { Product, Category } from "@/lib/airtable"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

type SortField = 'name' | 'price' | 'stock'
type SortDirection = 'asc' | 'desc'

interface ProductFormData {
  name: string
  description: string
  price: number
  stock: number
  category: string[]
  imageUrl: string
  weightSize: string | number
  isActive: boolean
}

interface ProductVariation {
  id: string
  name: string
  price?: number
  stock?: number
  imageUrl?: string
  isDefault?: boolean
}

interface ProductDetails {
  description: string
  ingredients?: string[]
  allergens?: string[]
  thc?: number
  cbd?: number
  effects?: string[]
  flavors?: string[]
  strainType?: 'indica' | 'sativa' | 'hybrid'
}

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be positive"),
  category: z.array(z.string()).min(1, "At least one category is required"),
  imageUrl: z.string()
    .refine(url => {
      if (!url) return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid URL or leave empty"),
  weightSize: z.union([z.string(), z.number()]),
  isActive: z.boolean(),
  type: z.enum(['flower', 'edible', 'cart', 'other', 'bundle']),
  details: z.object({
    ingredients: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    thc: z.number().min(0).max(100).optional(),
    cbd: z.number().min(0).max(100).optional(),
    effects: z.array(z.string()).optional(),
    flavors: z.array(z.string()).optional(),
    strainType: z.enum(['indica', 'sativa', 'hybrid']).optional(),
  }).optional(),
  isSpecialDeal: z.boolean().optional(),
  originalProductId: z.string().optional(),
  specialPrice: z.number().min(0).optional(),
  specialStartDate: z.string().optional(),
  specialEndDate: z.string().optional(),
  variations: z.array(z.object({
    name: z.string(),
    price: z.number().optional(),
    stock: z.number().optional(),
    imageUrl: z.string().optional(),
    isDefault: z.boolean().optional(),
  })).default([]),
  bundleProducts: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    name: z.string(),
    price: z.number(),
  })).optional(),
  isBundleDeal: z.boolean().optional(),
  bundleSavings: z.number().min(0).optional(),
})

type ProductFormSchema = z.infer<typeof productSchema>

interface ProductsTableProps {
  showBundles: boolean
}

export function ProductsTable({ showBundles }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: [],
    imageUrl: '',
    weightSize: '',
    isActive: true
  })

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchCategories()
    ])
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description || '',
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        category: selectedProduct.category,
        imageUrl: selectedProduct.imageUrl || '',
        weightSize: selectedProduct.weightSize || '',
        isActive: selectedProduct.isActive
      })
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?showBundles=${showBundles}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedProduct(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: [],
      imageUrl: '',
      weightSize: '',
      isActive: true
    })
    setIsNewDialogOpen(true)
  }

  const handleSave = async (formData: ProductFormSchema) => {
    try {
      const endpoint = '/api/products'
      const method = selectedProduct ? 'PATCH' : 'POST'
      
      // Add local_ prefix for new products
      const body = selectedProduct 
        ? { id: selectedProduct.id, ...formData }
        : { 
            id: `local_${Date.now()}`, // Generate local ID
            ...formData,
            status: formData.isActive ? 'active' : 'inactive',
            categoryNames: categories
              .filter(cat => formData.category.includes(cat.id))
              .map(cat => cat.name),
            needsSync: true // Mark for future sync
          }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save product')
      
      const savedProduct = await response.json()
      
      if (selectedProduct) {
        setProducts(products.map(p => 
          p.id === savedProduct.id ? savedProduct : p
        ))
        toast.success('Product updated successfully')
      } else {
        setProducts([...products, savedProduct])
        toast.success('Product created successfully')
      }

      setIsEditDialogOpen(false)
      setIsNewDialogOpen(false)
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    }
  }

  const updateProductStatus = async (productId: string, newStatus: boolean) => {
    try {
      setUpdatingStatus(productId)
      const response = await fetch('/api/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: productId,
          isActive: newStatus 
        }),
      })

      if (!response.ok) throw new Error('Failed to update product status')
      
      const updatedProduct = await response.json()
      
      if (updatedProduct.isActive !== newStatus) {
        throw new Error('Product status was not updated correctly')
      }

      setProducts(products.map(p => 
        p.id === productId ? updatedProduct : p
      ))
      
      toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.error('Failed to update product status')
      fetchProducts()
    } finally {
      setUpdatingStatus(null)
    }
  }

  const sortProducts = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = (
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.category.some(cat => cat.toLowerCase().includes(searchLower))
    )
    const matchesType = showBundles ? product.type === 'bundle' : product.type !== 'bundle'
    return matchesSearch && matchesType
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * modifier
      case 'price':
        return (a.price - b.price) * modifier
      case 'stock':
        return (a.stock - b.stock) * modifier
      default:
        return 0
    }
  })

  const handleCreateSpecialDeal = async (product: Product) => {
    setSelectedProduct(null)
    setFormData({
      name: `${product.name} (Special)`,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || '',
      weightSize: product.weightSize || '',
      isActive: true,
      isSpecialDeal: true,
      originalProductId: product.id,
      specialPrice: product.price * 0.8, // 20% discount by default
      specialStartDate: new Date().toISOString().split('T')[0],
      specialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
      variations: product.variations || []
    })
    setIsNewDialogOpen(true)
  }

  const renderProductForm = () => {
    const form = useForm<ProductFormSchema>({
      resolver: zodResolver(productSchema),
      defaultValues: {
        name: selectedProduct?.name || '',
        description: selectedProduct?.description || '',
        price: selectedProduct?.price || 0,
        stock: selectedProduct?.stock || 0,
        category: selectedProduct?.category || [],
        imageUrl: selectedProduct?.imageUrl || '',
        weightSize: selectedProduct?.weightSize || '',
        isActive: selectedProduct?.isActive ?? true,
        type: selectedProduct?.type || (showBundles ? 'bundle' : 'other'),
        details: selectedProduct?.details || {},
        variations: selectedProduct?.variations || [],
        bundleProducts: selectedProduct?.bundleProducts || [],
        bundleSavings: selectedProduct?.bundleSavings || 0,
        isBundleDeal: selectedProduct?.type === 'bundle' || showBundles
      },
    })

    // Initialize bundle products if type is bundle and no bundle products exist
    useEffect(() => {
      if ((form.watch('type') === 'bundle' || showBundles) && !form.watch('bundleProducts')?.length) {
        form.setValue('bundleProducts', [{ 
          productId: '',
          quantity: 1,
          name: '',
          price: 0
        }])
      }
    }, [form.watch('type')])

    // Update total price when bundle products or savings change
    useEffect(() => {
      if (form.watch('type') === 'bundle') {
        const bundleProducts = form.watch('bundleProducts') || []
        const totalPrice = bundleProducts.reduce((sum, bp) => 
          sum + (bp.price * (bp.quantity || 1)), 0
        )
        const savings = form.watch('bundleSavings') || 0
        form.setValue('price', totalPrice - savings)
      }
    }, [form.watch('bundleProducts'), form.watch('bundleSavings')])

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <ScrollArea className="h-[80vh] pr-4">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value[0]}
                      onValueChange={(value) => field.onChange([value])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!showBundles && (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          if (value === 'bundle') {
                            form.setValue('isBundleDeal', true)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flower">Flower</SelectItem>
                          <SelectItem value="edible">Edible</SelectItem>
                          <SelectItem value="cart">Cart</SelectItem>
                          <SelectItem value="bundle">Bundle Deal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="weightSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight/Size</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter image URL or leave empty"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            // Preview image if URL is valid
                            try {
                              new URL(e.target.value);
                              // Could add image preview here if needed
                            } catch {
                              // Invalid URL - that's okay, just don't show preview
                            }
                          }}
                        />
                      </FormControl>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          // Clear the image URL
                          field.onChange("");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {field.value && (
                      <div className="mt-2 relative aspect-square w-20 rounded-lg border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={field.value}
                          alt="Product image preview"
                          className="object-cover"
                          onError={(e) => {
                            // Hide broken image
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <FormDescription>
                      Enter a valid image URL or leave empty. The image will be displayed in the store.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Product will be visible in the store when active
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSpecialDeal"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Special Deal</FormLabel>
                      <FormDescription>
                        Mark this product as a special deal
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('isSpecialDeal') && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="specialPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specialStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {form.watch('type') === 'bundle' && (
                <Accordion type="single" collapsible defaultValue="bundle" className="w-full">
                  <AccordionItem value="bundle">
                    <AccordionTrigger>Bundle Products</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {form.watch('bundleProducts')?.map((bundleProduct, index) => (
                          <div key={index} className="grid gap-4 p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="grid grid-cols-2 gap-4 flex-1">
                                <FormField
                                  control={form.control}
                                  name={`bundleProducts.${index}.productId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Product</FormLabel>
                                      <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                          const selectedProduct = products.find(p => p.id === value)
                                          if (selectedProduct) {
                                            form.setValue(`bundleProducts.${index}.name`, selectedProduct.name)
                                            form.setValue(`bundleProducts.${index}.price`, selectedProduct.price)
                                            // Update total price
                                            const bundleProducts = form.getValues('bundleProducts')
                                            const totalPrice = bundleProducts.reduce((sum, bp) => 
                                              sum + (bp.price * (bp.quantity || 1)), 0
                                            )
                                            const savings = form.getValues('bundleSavings') || 0
                                            form.setValue('price', totalPrice - savings)
                                          }
                                          field.onChange(value)
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {products
                                            .filter(p => p.type !== 'bundle' && p.isActive)
                                            .map((product) => (
                                              <SelectItem key={product.id} value={product.id}>
                                                {product.name} - ${product.price.toFixed(2)}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`bundleProducts.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Quantity</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          min="1"
                                          {...field}
                                          value={field.value || 1}
                                          onChange={e => {
                                            const value = parseInt(e.target.value) || 1
                                            field.onChange(value)
                                            // Update total price
                                            const bundleProducts = form.getValues('bundleProducts')
                                            bundleProducts[index].quantity = value
                                            const totalPrice = bundleProducts.reduce((sum, bp) => 
                                              sum + (bp.price * (bp.quantity || 1)), 0
                                            )
                                            const savings = form.getValues('bundleSavings') || 0
                                            form.setValue('price', totalPrice - savings)
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const bundleProducts = form.getValues('bundleProducts')
                                  form.setValue('bundleProducts', bundleProducts.filter((_, i) => i !== index))
                                  // Update total price
                                  const remainingProducts = bundleProducts.filter((_, i) => i !== index)
                                  const totalPrice = remainingProducts.reduce((sum, bp) => 
                                    sum + (bp.price * (bp.quantity || 1)), 0
                                  )
                                  const savings = form.getValues('bundleSavings') || 0
                                  form.setValue('price', totalPrice - savings)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {bundleProduct.name && (
                              <div className="text-sm text-muted-foreground">
                                Selected: {bundleProduct.name} - ${bundleProduct.price.toFixed(2)} x {bundleProduct.quantity}
                                = ${(bundleProduct.price * bundleProduct.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-between items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const bundleProducts = form.getValues('bundleProducts') || []
                              form.setValue('bundleProducts', [
                                ...bundleProducts,
                                { 
                                  productId: '',
                                  quantity: 1,
                                  name: '',
                                  price: 0
                                }
                              ])
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product to Bundle
                          </Button>

                          <div className="text-sm text-muted-foreground">
                            Total before savings: $
                            {(form.watch('bundleProducts')?.reduce((sum, bp) => 
                              sum + (bp.price * (bp.quantity || 1)), 0
                            ) || 0).toFixed(2)}
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="bundleSavings"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bundle Savings</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  min="0"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={e => {
                                    const value = e.target.value ? parseFloat(e.target.value) : 0
                                    field.onChange(value)
                                    // Update total price
                                    const bundleProducts = form.getValues('bundleProducts') || []
                                    const totalPrice = bundleProducts.reduce((sum, bp) => 
                                      sum + (bp.price * (bp.quantity || 1)), 0
                                    )
                                    form.setValue('price', totalPrice - value)
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the amount to discount from the total bundle price
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="text-sm font-medium">
                          Final Bundle Price: ${form.watch('price')?.toFixed(2)}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>Product Details</AccordionTrigger>
                <AccordionContent>
                  {form.watch('type') === 'flower' && (
                    <>
                      <FormField
                        control={form.control}
                        name="details.thc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>THC %</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="details.cbd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CBD %</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="details.strainType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strain Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select strain type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="indica">Indica</SelectItem>
                                <SelectItem value="sativa">Sativa</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {form.watch('type') === 'edible' && (
                    <>
                      <FormField
                        control={form.control}
                        name="details.ingredients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ingredients</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value?.join(', ') || ''}
                                onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter ingredients separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="details.allergens"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergens</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value?.join(', ') || ''}
                                onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter allergens separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="details.effects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effects</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value?.join(', ') || ''}
                            onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter effects separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="details.flavors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flavors</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value?.join(', ') || ''}
                            onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter flavors separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="variations">
                <AccordionTrigger>Product Variations</AccordionTrigger>
                <AccordionContent>
                  {form.watch('variations')?.map((variation, index) => (
                    <div key={index} className="grid gap-4 mb-6 p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-3 gap-4 flex-1">
                          <FormField
                            control={form.control}
                            name={`variations.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variations.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    {...field}
                                    value={field.value || ''}
                                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variations.${index}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field}
                                    value={field.value || ''}
                                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const variations = form.getValues('variations') || []
                            form.setValue('variations', variations.filter((_, i) => i !== index))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`variations.${index}.imageUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Variation Image</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => field.onChange('')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {field.value && (
                                <div className="mt-2 relative aspect-square w-20 rounded-lg border overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={field.value}
                                    alt={form.getValues(`variations.${index}.name`)}
                                    className="object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variations.${index}.isDefault`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      const variations = form.getValues('variations') || []
                                      variations.forEach((_, i) => {
                                        if (i !== index) {
                                          form.setValue(`variations.${i}.isDefault`, false)
                                        }
                                      })
                                    }
                                    field.onChange(checked)
                                  }}
                                />
                              </FormControl>
                              <FormLabel>Default Variation</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const variations = form.getValues('variations') || []
                      form.setValue('variations', [
                        ...variations,
                        { 
                          name: '', 
                          price: form.getValues('price'), 
                          stock: form.getValues('stock'),
                          imageUrl: '',
                          isDefault: variations.length === 0 
                        }
                      ])
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variation
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>

          <DialogFooter>
            <Button type="submit">
              {selectedProduct ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${showBundles ? 'bundles' : 'products'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          New {showBundles ? 'Bundle' : 'Product'}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => sortProducts('name')}
                  className="flex items-center gap-1"
                >
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => sortProducts('price')}
                  className="flex items-center gap-1"
                >
                  Price
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => sortProducts('stock')}
                  className="flex items-center gap-1"
                >
                  Stock
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {searchQuery ? 'No products found matching your search' : 'No products found'}
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.name}
                    {product.description && (
                      <div className="text-sm text-muted-foreground">
                        {product.description}
                      </div>
                    )}
                    {product.type === 'bundle' && (
                      <Badge variant="secondary" className="ml-2">
                        Bundle Deal
                      </Badge>
                    )}
                    {product.isSpecialDeal && (
                      <Badge variant="secondary" className="ml-2">
                        Special Deal
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.categoryNames?.map((cat, index) => (
                      <Badge key={index} variant="secondary" className="mr-1">
                        {cat}
                      </Badge>
                    ))}
                    {product.type && (
                      <Badge variant="outline" className="mr-1">
                        {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={product.isActive ? "default" : "secondary"}
                      className={updatingStatus === product.id ? "opacity-50" : ""}
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          disabled={updatingStatus === product.id}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          Edit product
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleView(product)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateSpecialDeal(product)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Create Special Deal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateProductStatus(product.id, !product.isActive)}
                          className={product.isActive ? "text-destructive" : "text-primary"}
                        >
                          {product.isActive ? "Deactivate" : "Activate"} product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to the product here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {renderProductForm()}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <div className="text-sm">{selectedProduct?.name}</div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <div className="text-sm">{selectedProduct?.description || '-'}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Price</Label>
                <div className="text-sm">${selectedProduct?.price.toFixed(2)}</div>
              </div>
              <div className="grid gap-2">
                <Label>Stock</Label>
                <div className="text-sm">{selectedProduct?.stock}</div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Categories</Label>
              <div className="flex gap-1">
                {selectedProduct?.categoryNames?.map((cat, index) => (
                  <Badge key={index} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Weight/Size</Label>
              <div className="text-sm">{selectedProduct?.weightSize || '-'}</div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="text-sm">
                <Badge variant={selectedProduct?.isActive ? "default" : "secondary"}>
                  {selectedProduct?.status}
                </Badge>
              </div>
            </div>
            {selectedProduct?.type === 'bundle' && (
              <div className="grid gap-2">
                <Label>Bundle Products</Label>
                <div className="space-y-2">
                  {selectedProduct.bundleProducts?.map((bp, index) => (
                    <div key={index} className="flex items-center justify-between border rounded-lg p-2">
                      <div>
                        <div className="font-medium">{bp.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {bp.quantity}
                        </div>
                      </div>
                      <div className="text-sm">
                        ${bp.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {selectedProduct.bundleSavings && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Bundle Savings: ${selectedProduct.bundleSavings.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            )}
            {selectedProduct?.isSpecialDeal && (
              <div className="grid gap-2">
                <Label>Special Deal Details</Label>
                <div className="space-y-2">
                  <div className="text-sm">
                    Original Price: ${selectedProduct.price.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    Special Price: ${selectedProduct.specialPrice?.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    Valid: {selectedProduct.specialStartDate} to {selectedProduct.specialEndDate}
                  </div>
                </div>
              </div>
            )}
            {selectedProduct?.imageUrl && (
              <div className="grid gap-2">
                <Label>Image</Label>
                <div className="relative aspect-square w-40 rounded-lg border overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Product Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {showBundles ? 'Bundle' : 'Product'}</DialogTitle>
            <DialogDescription>
              Add a new {showBundles ? 'bundle' : 'product'} to your store.
            </DialogDescription>
          </DialogHeader>
          {renderProductForm()}
        </DialogContent>
      </Dialog>
    </div>
  )
} 