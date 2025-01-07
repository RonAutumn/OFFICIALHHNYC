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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OrderDetails } from "./order-details"
import { toast } from "sonner"

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
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

type SortField = 'id' | 'date' | 'total'
type SortDirection = 'asc' | 'desc'

async function getOrders(): Promise<Order[]> {
  const response = await fetch('/api/orders')
  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }
  const data = await response.json()
  return data
}

async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error('Failed to update order status')
  }
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    getOrders()
      .then(data => {
        setOrders(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch orders:', error)
        setIsLoading(false)
      })
  }, [])

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))

      // Update selected order if it's the one being viewed
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }

    } catch (error) {
      throw error
    }
  }

  const sortOrders = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase()
    const customerName = order.shippingForm?.name?.toLowerCase() || ''
    const itemNames = order.items.map(item => item.name.toLowerCase()).join(' ')
    
    return (
      order.id.toString().includes(searchLower) ||
      order.email.toLowerCase().includes(searchLower) ||
      customerName.includes(searchLower) ||
      itemNames.includes(searchLower)
    )
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'id':
        return (a.id - b.id) * modifier
      case 'date':
        return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * modifier
      case 'total':
        return (a.total - b.total) * modifier
      default:
        return 0
    }
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const shippingOrders = orders.filter(order => order.method === "shipping")
  const pickupOrders = orders.filter(order => order.method === "pickup")

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium">Total Orders</h3>
          <div className="mt-2 text-2xl font-bold">{orders.length}</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Total Revenue</h3>
          <div className="mt-2 text-2xl font-bold">
            ${totalRevenue.toFixed(2)}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Shipping Orders</h3>
          <div className="mt-2 text-2xl font-bold">
            {shippingOrders.length}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Pickup Orders</h3>
          <div className="mt-2 text-2xl font-bold">
            {pickupOrders.length}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" onClick={() => setSearchQuery('')}>
          Clear
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => sortOrders('id')}
                  className="flex items-center gap-1"
                >
                  Order ID
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => sortOrders('total')}
                  className="flex items-center gap-1"
                >
                  Total
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => sortOrders('date')}
                  className="flex items-center gap-1"
                >
                  Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : sortedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  {searchQuery ? 'No orders found matching your search' : 'No orders found'}
                </TableCell>
              </TableRow>
            ) : (
              sortedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {order.shippingForm?.name || order.email}
                    <div className="text-sm text-muted-foreground">
                      {order.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.method === "shipping" ? "default" : "secondary"}>
                      {order.method}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'cancelled' ? 'destructive' :
                      order.status === 'delivered' ? 'default' :
                      order.status === 'shipped' ? 'default' :
                      order.status === 'processing' ? 'secondary' :
                      'outline'
                    }>
                      {order.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                          View details
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

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
} 