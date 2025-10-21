import { create } from "zustand"

export interface User {
  id: string
  name: string
  email: string
  profilePicture: string
}

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  setToken: (token: string) => void
  clearToken: () => void
  setUser: (user: User) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  user: null,
  isLoading: false,
  setToken: (token: string) => {
    localStorage.setItem("qs_token", token)
    set({ token, isAuthenticated: true })
  },
  clearToken: () => {
    localStorage.removeItem("qs_token")
    set({ token: null, isAuthenticated: false })
  },
  setUser: (user: User) => {
    set({ user })
  },
  clearUser: () => {
    set({ user: null })
  },
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  initializeAuth: () => {
    const token = localStorage.getItem("qs_token")
    if (token) {
      set({ token, isAuthenticated: true })
    }
  },
}))
