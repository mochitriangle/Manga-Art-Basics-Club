import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseClient() {
  // These should be available at build time and bundled into the client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Client env check:', { 
    url: supabaseUrl ? 'EXISTS' : 'MISSING', 
    key: supabaseAnonKey ? 'EXISTS' : 'MISSING' 
  })
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables:', { supabaseUrl, supabaseAnonKey })
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}