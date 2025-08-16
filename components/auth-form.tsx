"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [lastMagicLinkTime, setLastMagicLinkTime] = useState<number | null>(null)

  const supabase = createSupabaseClient()

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [countdown])

  // Check if we need to start countdown on component mount
  useEffect(() => {
    const stored = localStorage.getItem('lastMagicLinkTime')
    if (stored) {
      const lastTime = parseInt(stored)
      const now = Date.now()
      const timeDiff = Math.max(0, 60 - Math.floor((now - lastTime) / 1000))
      if (timeDiff > 0) {
        setCountdown(timeDiff)
        setLastMagicLinkTime(lastTime)
      }
    }
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in directly.")
        } else if (error.message.includes("API key")) {
          toast.error("Invalid API key")
        } else {
          toast.error("Registration failed: " + error.message)
        }
      } else {
        toast.success("Registration successful! Please check your email for verification.")
      }
    } catch (error) {
      toast.error("Registration failed, please try again")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password")
        } else {
          toast.error("Sign in failed: " + error.message)
        }
      } else {
        toast.success("Sign in successful!")
        window.location.href = "/profile"
      }
    } catch (error) {
      toast.error("Sign in failed, please try again")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before sending another magic link`)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes("redirect")) {
          toast.error("Redirect URL not allowed")
        } else {
          toast.error("Failed to send magic link: " + error.message)
        }
      } else {
        toast.success("Magic link sent to your email!")
        // Start countdown and store timestamp
        setCountdown(60)
        setLastMagicLinkTime(Date.now())
        localStorage.setItem('lastMagicLinkTime', Date.now().toString())
      }
    } catch (error) {
      toast.error("Failed to send, please try again")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up / Magic Link</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <div className="space-y-4">
            {/* Sign Up Form */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Create Account</h3>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Full Name</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </div>

            {/* Magic Link Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Or use Magic Link</h3>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || countdown > 0}
                  variant={countdown > 0 ? "outline" : "default"}
                >
                  {isLoading ? "Sending..." : 
                   countdown > 0 ? `Wait ${countdown}s` : "Send Magic Link"}
                </Button>
                {countdown > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Magic link sent! Please wait {countdown} seconds before requesting another.
                  </p>
                )}
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
