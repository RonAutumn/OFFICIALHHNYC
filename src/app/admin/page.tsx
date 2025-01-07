"use client"

import { StoreManagement } from "@/components/admin/store-management"
import { OrdersManagement } from "@/components/admin/orders-management"
import { Overview } from "@/components/admin/overview"
import { MainNav } from "@/components/admin/main-nav"
import { Search } from "@/components/admin/search"
import TeamSwitcher from "@/components/admin/team-switcher"
import { UserNav } from "@/components/admin/user-nav"
import { CalendarDateRangePicker } from "@/components/admin/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { PasswordManagement } from "@/components/admin/password-management"

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <TeamSwitcher />
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <h3 className="text-sm font-medium">Total Revenue</h3>
                <div className="mt-2 text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium">Orders</h3>
                <div className="mt-2 text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium">Products</h3>
                <div className="mt-2 text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">+19% from last month</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium">Active Now</h3>
                <div className="mt-2 text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 since last hour</p>
              </Card>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <div className="p-6">
                  <h3 className="text-lg font-medium">Overview</h3>
                </div>
                <Overview />
              </Card>
              <Card className="col-span-3">
                <div className="p-6">
                  <h3 className="text-lg font-medium">Recent Orders</h3>
                </div>
                <OrdersManagement />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="store">
            <StoreManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="p-6">
              <h3 className="text-lg font-medium">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Track your store performance, customer behavior, and sales trends.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-4">
                  <h4 className="text-sm font-medium">Sales Trends</h4>
                  <p className="text-sm text-muted-foreground mt-1">Coming soon...</p>
                </Card>
                <Card className="p-4">
                  <h4 className="text-sm font-medium">Customer Insights</h4>
                  <p className="text-sm text-muted-foreground mt-1">Coming soon...</p>
                </Card>
                <Card className="p-4">
                  <h4 className="text-sm font-medium">Product Performance</h4>
                  <p className="text-sm text-muted-foreground mt-1">Coming soon...</p>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-medium">Store Settings</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure your store settings, notifications, and preferences.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="p-4">
                    <h4 className="text-sm font-medium">General Settings</h4>
                    <p className="text-sm text-muted-foreground mt-1">Coming soon...</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="text-sm font-medium">Notifications</h4>
                    <p className="text-sm text-muted-foreground mt-1">Coming soon...</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="text-sm font-medium">User Management</h4>
                    <p className="text-sm text-muted-foreground mt-1">Coming soon...</p>
                  </Card>
                </div>
              </Card>
              
              <PasswordManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 