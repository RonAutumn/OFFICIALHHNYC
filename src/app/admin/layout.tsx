import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing orders and products",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 