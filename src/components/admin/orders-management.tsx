"use client"

import { OrdersTab } from "./orders-tab"

export function OrdersManagement() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
      </div>
      <OrdersTab />
    </div>
  )
} 