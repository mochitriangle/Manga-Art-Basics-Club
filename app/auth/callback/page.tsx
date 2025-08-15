"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleCallback = async () => {
      // Get URL parameters from window.location instead of useSearchParams
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get("code")
      const error = urlParams.get("error")
      const errorDescription = urlParams.get("error_description")

      if (error) {
        toast.error(`Authentication failed: ${errorDescription || error}`)
        router.push("/login")
        return
      }

      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            toast.error("Authentication failed, please try again")
            router.push("/login")
          } else {
            toast.success("Authentication successful!")
            router.push("/profile")
          }
        } catch (err) {
          toast.error("Authentication failed, please try again")
          router.push("/login")
        }
      } else {
        router.push("/login")
      }
    }

    handleCallback()
  }, [router, supabase])

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