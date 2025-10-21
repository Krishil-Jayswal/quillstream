"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"

export function useFetchUser() {
  const { token, isAuthenticated, setUser, clearToken, setLoading, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const fetchUser = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/me`, {
          headers: {
            Authorization: token,
          },
        })

        if (response.status === 401) {
          clearToken()
          router.push("/signin")
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user")
        }

        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error("[v0] Error fetching user:", error)
        clearToken()
        router.push("/signin")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isAuthenticated, token, setUser, clearToken, setLoading, router])
}
