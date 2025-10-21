"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setToken } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get("token")

    if (token) {
      setToken(token)
      router.push("/dashboard")
    } else {
      router.push("/signin")
    }
  }, [searchParams, setToken, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-lg">QS</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Signing you in...</h1>
        <p className="text-muted-foreground">Please wait while we complete your authentication</p>
      </div>
    </div>
  )
}
