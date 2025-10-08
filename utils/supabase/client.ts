import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create a singleton Supabase client for the browser with persisted session handling
let browserClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (browserClient) return browserClient
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  browserClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  console.log('[supabase] Browser client initialized')
  return browserClient
}