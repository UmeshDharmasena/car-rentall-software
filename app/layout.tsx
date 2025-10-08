import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Car Rental Software - Compare. Clarify. Choose',
  description: 'Compare top car rental solutions by price, features, and user ratings. Choose software tailored to your business size and needs.',
  keywords: 'car rental software, fleet management, rental management, software comparison',
  icons: {
    icon: '/Car Rental Logo BGR.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}