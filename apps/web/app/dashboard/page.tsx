"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { VideoUpload } from "@/components/video-upload"
import { VideosList } from "@/components/videos-list"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin")
    }
  }, [isAuthenticated, router])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome to your Quill Stream dashboard</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Create Notes</h2>
                  <p className="text-muted-foreground">Upload a video to generate AI-powered notes</p>
                </div>
                <VideoUpload />
              </div>
            </div>

            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">How it works</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">1</span>
                    <span>Upload your video</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">2</span>
                    <span>AI processes the content</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">3</span>
                    <span>Get organized notes</span>
                  </li>
                </ol>
              </Card>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Tip:</span> Longer videos with clear audio produce better notes.
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Videos</h2>
            <VideosList />
          </div>
        </div>
      </div>
    </main>
  )
}
