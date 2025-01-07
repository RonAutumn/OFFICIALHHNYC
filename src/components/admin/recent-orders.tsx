import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const orders = [
  {
    id: "ORD001",
    customer: "John Doe",
    product: "Product A",
    status: "Processing",
    total: "$125.00",
  },
  {
    id: "ORD002",
    customer: "Jane Smith",
    product: "Product B",
    status: "Shipped",
    total: "$250.00",
  },
  {
    id: "ORD003",
    customer: "Bob Johnson",
    product: "Product C",
    status: "Delivered",
    total: "$75.50",
  },
  {
    id: "ORD004",
    customer: "Alice Brown",
    product: "Product D",
    status: "Processing",
    total: "$199.99",
  },
  {
    id: "ORD005",
    customer: "Charlie Wilson",
    product: "Product E",
    status: "Shipped",
    total: "$149.99",
  },
]

export function RecentOrders() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    order.status === "Processing" ? "bg-yellow-100 text-yellow-800" :
                    order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {order.status}
                  </div>
                </TableCell>
                <TableCell className="text-right">{order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 