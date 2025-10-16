'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PopupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page since we don't need a separate popup page
    // The popup is now integrated into the main page as a modal
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
        <p className="text-gray-600">Taking you back to the main page.</p>
      </div>
    </div>
  )
}