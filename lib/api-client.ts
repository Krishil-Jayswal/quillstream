import { useAuthStore } from "./auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787"

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const { token } = useAuthStore.getState()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = token
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

export function getGoogleAuthUrl() {
  return `${API_BASE_URL}/api/v1/auth/google`
}
