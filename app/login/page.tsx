import { Metadata } from "next"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Sign In - Manga & Art Basics Club",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your Manga & Art Basics Club account
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
