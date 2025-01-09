import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const { pathname } = request.nextUrl

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Only handle admin routes
  if (pathname.startsWith('/admin')) {
    const isAuthenticated = request.cookies.get('admin_access')?.value === 'true'

    // If trying to access login page
    if (pathname === '/admin/login') {
      // If already authenticated, redirect to admin dashboard
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      // Allow access to login page
      return NextResponse.next()
    }

    // If not authenticated and trying to access admin routes
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configure middleware matching
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)'
  ]
}
