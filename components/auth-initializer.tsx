"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useFetchUser } from "@/lib/use-fetch-user"

export function AuthInitializer() {
  const router = useRouter()
  const pathname = usePathname()
  const { initializeAuth, isAuthenticated, token } = useAuthStore()

  // Initialize auth from localStorage
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Fetch user data if authenticated
  useFetchUser()

  // Auto-redirect to dashboard if authenticated and on public pages
  useEffect(() => {
    if (isAuthenticated && token && (pathname === "/" || pathname === "/signin")) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, token, pathname, router])

  return null
}
