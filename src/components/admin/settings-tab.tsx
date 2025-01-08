"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordManagement } from "./password-management"
import { StoreManagement } from "./store-management"

export function SettingsTab() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>
            Manage your store settings and configurations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreManagement />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Management</CardTitle>
          <CardDescription>
            Manage site access and admin passwords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordManagement />
        </CardContent>
      </Card>
    </div>
  )
} 