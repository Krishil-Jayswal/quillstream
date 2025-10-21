"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { isAuthenticated, clearToken, initializeAuth, user } = useAuthStore()

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [initializeAuth])

  const handleSignOut = () => {
    clearToken()
    router.push("/")
  }

  const handleSignIn = () => {
    router.push("/signin")
  }

  const handleGetStarted = () => {
    router.push("/signin")
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  if (!mounted) return null

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QS</span>
            </div>
            <span className="text-xl font-bold text-foreground">Quill Stream</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
              How It Works
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
              Pricing
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-foreground hover:bg-muted">
                    Dashboard
                  </Button>
                </Link>
                <button onClick={handleProfileClick} className="flex items-center gap-2 hover:opacity-80 transition">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-border hover:bg-muted bg-transparent"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSignIn}
                  variant="ghost"
                  className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <a href="#features" className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-300" onClick={() => setIsOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-300" onClick={() => setIsOpen(false)}>
              How It Works
            </a>
            <a href="#pricing" className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-300" onClick={() => setIsOpen(false)}>
              Pricing
            </a>
            <div className="px-4 pt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="block">
                    <Button variant="ghost" className="w-full text-foreground">
                      Dashboard
                    </Button>
                  </Link>
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                  </button>
                  <Button onClick={handleSignOut} variant="outline" className="w-full border-border bg-transparent">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSignIn}
                    variant="ghost"
                    className="w-full text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                  >
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="w-full bg-primary text-primary-foreground">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
