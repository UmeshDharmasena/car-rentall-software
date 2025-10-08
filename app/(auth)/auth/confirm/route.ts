import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  const code = searchParams.get('code')

  console.log('[auth] Confirm route called', { 
    hasTokenHash: !!token_hash, 
    hasCode: !!code, 
    type, 
    next,
    fullUrl: request.url 
  })

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('next')
  redirectTo.searchParams.delete('code')

  const supabase = createClient()

  // Handle OAuth code exchange (for Google OAuth)
  if (code) {
    console.log('[auth] OAuth code exchange start', { code: code.substring(0, 10) + '...', next })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session) {
      console.log('[auth] OAuth success, redirecting to:', redirectTo.toString())
      // Make sure we redirect to the 'next' path
      return NextResponse.redirect(redirectTo)
    }
    console.error('[auth] OAuth code exchange failed', { message: error?.message })
  }

  // Handle email confirmation (for email/password signup)
  if (token_hash && type) {
    console.log('[auth] Email confirmation verifyOtp start', { type, tokenHash: token_hash.substring(0, 10) + '...' })
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error && data.session) {
      console.log('[auth] Email confirmation success, redirecting to:', redirectTo.toString())
      return NextResponse.redirect(redirectTo)
    }
    console.error('[auth] Email confirmation failed', { message: error?.message })
  }

  // If we get here, something went wrong
  console.log('[auth] No valid auth method found, redirecting to home with error')
  redirectTo.pathname = '/'
  redirectTo.searchParams.set('error', 'auth_error')
  return NextResponse.redirect(redirectTo)
}