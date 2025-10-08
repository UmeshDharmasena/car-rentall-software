'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const AuthCallbackContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have auth fragments in the URL
      const hash = window.location.hash
      const urlParams = new URLSearchParams(hash.substring(1)) // Remove the # symbol
      
      const accessToken = urlParams.get('access_token')
      const refreshToken = urlParams.get('refresh_token')
      let next = searchParams.get('next') || localStorage.getItem('post_oauth_redirect') || '/'
      const error = searchParams.get('error')

      // Clear the backup storage
      localStorage.removeItem('post_oauth_redirect')

      console.log('[auth] Callback handler', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        error,
        next 
      })

      if (error) {
        console.error('[auth] OAuth error from callback:', error)
        router.push('/?error=auth_error')
        return
      }

      if (accessToken) {
        console.log('[auth] Processing OAuth tokens')
        try {
          // Set the session using the tokens from the URL
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })

          if (sessionError) {
            console.error('[auth] Session creation failed:', sessionError)
            router.push('/?error=auth_error')
            return
          }

          console.log('[auth] Session created successfully, redirecting to:', next)
          
          // Clean the URL and redirect
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
          router.push(next)
          
        } catch (error) {
          console.error('[auth] Unexpected error:', error)
          router.push('/?error=auth_error')
        }
      } else {
        // If no tokens, redirect to next anyway (fallback)
        router.push(next)
      }
    }

    // Only run if we're on the client side and have URL fragments
    if (typeof window !== 'undefined' && window.location.hash) {
      handleAuthCallback()
    } else {
      // If no hash, perhaps not OAuth, redirect to default
      const next = searchParams.get('next') || localStorage.getItem('post_oauth_redirect') || '/'
      localStorage.removeItem('post_oauth_redirect')
      router.push(next)
    }
  }, [router, searchParams, supabase])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

const AuthCallbackPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

export default AuthCallbackPage