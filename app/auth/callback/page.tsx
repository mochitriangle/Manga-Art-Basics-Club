"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState('')
  
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('Auth callback started')
      
      try {
        // Get URL parameters from window.location
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("code")
        const error = urlParams.get("error")
        const errorDescription = urlParams.get("error_description")

        console.log('URL params:', { code: !!code, error, errorDescription })

        if (error) {
          console.error('Auth error:', error, errorDescription)
          setErrorMessage(`Authentication failed: ${errorDescription || error}`)
          setStatus('error')
          toast.error(`Authentication failed: ${errorDescription || error}`)
          // Wait a bit before redirecting so user can see the error
          setTimeout(() => router.push("/login"), 3000)
          return
        }

        if (!code) {
          console.log('No auth code found, redirecting to login')
          setErrorMessage('No authentication code found')
          setStatus('error')
          setTimeout(() => router.push("/login"), 3000)
          return
        }

        console.log('Processing auth code...')
        
        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        console.log('Exchange result:', { data, error: exchangeError })
        
        if (exchangeError) {
          console.error('Session exchange error:', exchangeError)
          setErrorMessage(`Authentication failed: ${exchangeError.message}`)
          setStatus('error')
          toast.error("Authentication failed, please try again")
          setTimeout(() => router.push("/login"), 3000)
          return
        }

        if (data.session) {
          console.log('Authentication successful!')
          setStatus('success')
          toast.success("Authentication successful!")
          
          // Force a page refresh to ensure session is loaded
          window.location.href = "/profile"
        } else {
          console.error('No session returned')
          setErrorMessage('Authentication failed: No session returned')
          setStatus('error')
          toast.error("Authentication failed, please try again")
          setTimeout(() => router.push("/login"), 3000)
        }
        
      } catch (err) {
        console.error('Session exchange exception:', err)
        setErrorMessage('Authentication failed due to an unexpected error')
        setStatus('error')
        toast.error("Authentication failed, please try again")
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    handleCallback()
  }, [router, supabase])

  if (status === 'success') {
    return (
      <div className="container mx-auto max-w-md py-12 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-green-600">Authentication Successful!</h1>
          <p className="text-muted-foreground">Redirecting to your profile...</p>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent mx-auto" />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto max-w-md py-12 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Authentication Failed</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
        </div>
      </div>
      )
  }

  return (
    <div className="container mx-auto max-w-md py-12 text-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Processing Authentication...</h1>
        <p className="text-muted-foreground">Please wait while we verify your identity</p>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      </div>
    </div>
  )
}