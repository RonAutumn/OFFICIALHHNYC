"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface OrderDetailsProps {
  order: {
    id: number
    method: string
    email: string
    total: number
    status?: OrderStatus
    items: Array<{
      id: number
      name: string
      category: string
      quantity: number
      price: number
      selectedVariation?: {
        price: number
      }
    }>
    shippingForm?: {
      name: string
      email: string
      street: string
      city: string
      state: string
      zipCode: string
    }
    timestamp: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate?: (orderId: number, newStatus: OrderStatus) => Promise<void>
}

const ORDER_STATUSES: { value: OrderStatus; label: string; variant: "default" | "secondary" | "destructive" | "outline" }[] = [
  { value: 'pending', label: 'Pending', variant: 'outline' },
  { value: 'processing', label: 'Processing', variant: 'secondary' },
  { value: 'shipped', label: 'Shipped', variant: 'default' },
  { value: 'delivered', label: 'Delivered', variant: 'default' },
  { value: 'cancelled', label: 'Cancelled', variant: 'destructive' },
]

export function OrderDetails({ order, open, onOpenChange, onStatusUpdate }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status || 'pending')

  const formatPrice = (price?: number) => {
    if (typeof price !== 'number') return '0.00'
    return price.toFixed(2)
  }

  const getItemPrice = (item: OrderDetailsProps['order']['items'][0]) => {
    return item.selectedVariation?.price || item.price || 0
  }

  const getItemTotal = (item: OrderDetailsProps['order']['items'][0]) => {
    const price = getItemPrice(item)
    return (item.quantity * price)
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!onStatusUpdate) return
    
    try {
      setIsUpdating(true)
      await onStatusUpdate(order.id, newStatus)
      setCurrentStatus(newStatus)
      toast.success("Order status updated successfully")
    } catch (error) {
      toast.error("Failed to update order status")
      console.error("Error updating order status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    return statusConfig?.variant || 'default'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.id}</span>
            <div className="flex items-center gap-2">
              <Badge variant={order.method === "shipping" ? "default" : "secondary"}>
                {order.method}
              </Badge>
              <Badge variant={getStatusBadgeVariant(currentStatus)}>
                {currentStatus}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Status Update */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Update Status</h3>
            <div className="flex items-center gap-2">
              <Select
                value={currentStatus}
                onValueChange={(value: OrderStatus) => handleStatusUpdate(value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Order Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Order Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p>{new Date(order.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">${formatPrice(order.total)}</p>
              </div>
            </div>
          </Card>

          {/* Customer Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="grid gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{order.email}</p>
              </div>
              {order.shippingForm && (
                <>
                  <Separator className="my-2" />
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p>{order.shippingForm.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shipping Address</p>
                    <p>{order.shippingForm.street}</p>
                    <p>
                      {order.shippingForm.city}, {order.shippingForm.state}{" "}
                      {order.shippingForm.zipCode}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p>{item.quantity}x ${formatPrice(getItemPrice(item))}</p>
                    <p className="font-medium">
                      ${formatPrice(getItemTotal(item))}
                    </p>
                  </div>
                  {item !== order.items[order.items.length - 1] && (
                    <Separator className="col-span-2 my-2" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 