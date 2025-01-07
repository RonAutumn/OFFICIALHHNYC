"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductVariation, VariationType } from "@/lib/airtable"
import { Plus, X } from "lucide-react"

interface ProductVariationsProps {
  variations: ProductVariation[]
  onVariationsChange: (variations: ProductVariation[]) => void
  productType?: 'cart' | 'flower' | 'edible'
}

const VARIATION_TYPE_LABELS: Record<VariationType, string> = {
  flavor: 'Flavor',
  size: 'Size',
  brand: 'Brand',
  strain: 'Strain',
  weight: 'Weight'
}

const DEFAULT_VARIATION_OPTIONS: Record<string, Record<VariationType, string[]>> = {
  cart: {
    flavor: ['Original', 'Mint', 'Berry', 'Citrus'],
    size: ['0.5g', '1.0g'],
    brand: ['House Brand', 'Premium'],
    strain: ['OG Kush', 'Blue Dream', 'Sour Diesel'],
    weight: []
  },
  flower: {
    flavor: [],
    size: [],
    brand: ['House Brand', 'Premium'],
    strain: ['OG Kush', 'Blue Dream', 'Sour Diesel'],
    weight: ['1g', '3.5g', '7g', '14g', '28g']
  },
  edible: {
    flavor: ['Chocolate', 'Vanilla', 'Strawberry', 'Mint'],
    size: ['Single', 'Pack of 5', 'Pack of 10'],
    brand: ['House Brand', 'Premium'],
    strain: [],
    weight: []
  }
}

export function ProductVariations({
  variations,
  onVariationsChange,
  productType = 'cart'
}: ProductVariationsProps) {
  const [newVariation, setNewVariation] = useState<Partial<ProductVariation>>({
    type: 'flavor',
    isActive: true
  })

  const handleAddVariation = () => {
    if (!newVariation.name) return

    const variation: ProductVariation = {
      id: crypto.randomUUID(),
      type: newVariation.type as VariationType,
      name: newVariation.name,
      price: newVariation.price || 0,
      sku: newVariation.sku,
      stock: newVariation.stock || 0,
      isActive: newVariation.isActive || true
    }

    onVariationsChange([...variations, variation])
    setNewVariation({ type: 'flavor', isActive: true })
  }

  const handleRemoveVariation = (id: string) => {
    onVariationsChange(variations.filter(v => v.id !== id))
  }

  const handleUpdateVariation = (id: string, updates: Partial<ProductVariation>) => {
    onVariationsChange(
      variations.map(v => v.id === id ? { ...v, ...updates } : v)
    )
  }

  const getAvailableTypes = (): VariationType[] => {
    switch (productType) {
      case 'cart':
        return ['flavor', 'size', 'brand']
      case 'flower':
        return ['strain', 'weight', 'brand']
      case 'edible':
        return ['flavor', 'size', 'brand']
      default:
        return ['flavor', 'size', 'brand', 'strain', 'weight']
    }
  }

  const getSuggestedValues = (type: VariationType): string[] => {
    return DEFAULT_VARIATION_OPTIONS[productType]?.[type] || []
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="space-y-2 flex-1">
          <Label>Variation Type</Label>
          <Select
            value={newVariation.type}
            onValueChange={(value) => setNewVariation({ ...newVariation, type: value as VariationType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableTypes().map((type) => (
                <SelectItem key={type} value={type}>
                  {VARIATION_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1">
          <Label>Name</Label>
          <Select
            value={newVariation.name}
            onValueChange={(value) => setNewVariation({ ...newVariation, name: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select or enter value" />
            </SelectTrigger>
            <SelectContent>
              {getSuggestedValues(newVariation.type as VariationType).map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-24">
          <Label>Price +$</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={newVariation.price || ''}
            onChange={(e) => setNewVariation({ ...newVariation, price: parseFloat(e.target.value) })}
          />
        </div>

        <div className="space-y-2 w-24">
          <Label>Stock</Label>
          <Input
            type="number"
            min="0"
            value={newVariation.stock || ''}
            onChange={(e) => setNewVariation({ ...newVariation, stock: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2 flex-1">
          <Label>SKU</Label>
          <Input
            value={newVariation.sku || ''}
            onChange={(e) => setNewVariation({ ...newVariation, sku: e.target.value })}
          />
        </div>

        <Button onClick={handleAddVariation} className="mb-0.5">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price +$</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Active</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variations.map((variation) => (
            <TableRow key={variation.id}>
              <TableCell>{VARIATION_TYPE_LABELS[variation.type]}</TableCell>
              <TableCell>
                <Input
                  value={variation.name}
                  onChange={(e) => handleUpdateVariation(variation.id, { name: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variation.price}
                  onChange={(e) => handleUpdateVariation(variation.id, { price: parseFloat(e.target.value) })}
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  value={variation.stock}
                  onChange={(e) => handleUpdateVariation(variation.id, { stock: parseInt(e.target.value) })}
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={variation.sku || ''}
                  onChange={(e) => handleUpdateVariation(variation.id, { sku: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={variation.isActive}
                  onCheckedChange={(checked) => handleUpdateVariation(variation.id, { isActive: checked })}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveVariation(variation.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 