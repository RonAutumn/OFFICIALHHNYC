import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HeavenHighNYC Shop',
  description: 'Premium bakery and wellness products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
} 