"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { VideoReel3D } from "@/components/video-reel-3d"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleStartTrial = () => {
    router.push("/signin")
  }

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            className={`space-y-6 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                ✨ AI-Powered Note Generation
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
              Transform Videos into{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Intelligent Notes
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Quill Stream uses advanced LLMs to automatically generate comprehensive, well-structured notes from any
              video. Save hours of manual note-taking and focus on what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground group"
                onClick={handleStartTrial}
              >
                Start Free Trial
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={20} />
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Videos Processed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2min</p>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
              </div>
            </div>
          </div>

          {/* Right 3D Content */}
          <div className={`transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <VideoReel3D />
          </div>
        </div>
      </div>
    </section>
  )
}
