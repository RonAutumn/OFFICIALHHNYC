import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const isAdmin = cookieStore.get('admin_access')

  if (!isAdmin) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}