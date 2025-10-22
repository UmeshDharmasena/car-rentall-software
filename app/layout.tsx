import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Car Rentall Software & Review Site',
  description: 'Compare top car rental solutions by price, features, and user ratings. Choose software tailored to your business size and needs.',
  keywords: 'car rental software, fleet management, rental management, software comparison',
  metadataBase: new URL('https://www.carrentallsoftware.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/Car Rental Logo BGR 16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/Car Rental Logo BGR 32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/Car Rental Logo BGR 32.png',
  },
  openGraph: {
    title: 'Car Rental Software & Review Site',
    description: 'Compare top car rental solutions by price, features, and user ratings. Choose software tailored to your business size and needs.',
    url: 'https://www.carrentallsoftware.com',
    siteName: 'Car Rentall Software',
    images: [
      {
        url: '/Car Rental Software Logo BGR.png',
        width: 1200,
        height: 630,
        alt: 'Car Rental Software Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Rental Software & Review Site',
    description: 'Compare top car rental solutions by price, features, and user ratings. Choose software tailored to your business size and needs.',
    images: ['/Car Rental Software Logo BGR.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PPMWM3XWQ7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PPMWM3XWQ7');
          `}
        </Script>
      </head>
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