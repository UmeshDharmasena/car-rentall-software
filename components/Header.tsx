'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Car } from 'lucide-react'
import LoginButton from './LoginLogoutButton'
import Image from 'next/image'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'HOME', href: '/' },
    { name: 'ANALYSE', href: '/analyse' },
    { name: 'WRITE A REVIEW', href: '/write-review' },
    { name: 'BLOGS', href: '/blogs' },
    { name: 'ABOUT US', href: '/about' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
                      <Image
                        src="/Car Rental Software Logo BGR.png"
                        alt="logo"
                        width={60}
                        height={60}
                        className="w-full h-auto rounded"
                      />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold transition-colors duration-200 hover:text-orange-500 ${
                  isActive(item.href)
                    ? 'text-cyan-500'
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <LoginButton/>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-semibold transition-colors duration-200 hover:text-primary-600 hover:bg-gray-50 rounded-md ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <LoginButton/>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header