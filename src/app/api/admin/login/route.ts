import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const DEFAULT_ADMIN_PASSWORD = 'Richmadeit'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
    
    // Check if password matches the admin password (different from site password)
    if (password === adminPassword) {
      const cookieStore = cookies()
      
      // Set admin access cookie
      cookieStore.set('admin_access', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 