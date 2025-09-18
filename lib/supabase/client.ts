import { createBrowserClient } from '@supabase/ssr'

// Cache the client instance to avoid recreating it
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseClient() {
  // Always create a fresh client to avoid caching issues
  const supabaseUrl = 'https://byictuxdystsrdbynnsl.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWN0dXhkeXN0c3JkYnlubnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzI1MjAsImV4cCI6MjA3MDgwODUyMH0.VCEMfBmXTdAFf6lnn6iWzCMOjcYHTlwDYORWOhxBrKo'
  
  // Create client with error handling
  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'manga-art-club'
        }
      }
    })
    
    // Cache the client instance
    if (!supabaseClient) {
      supabaseClient = client
    }
    
    return client
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    // Fallback to basic client
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
}