"use client"

import { Card } from "@/components/ui/card"
import { Zap, Brain, Clock, Shield, BarChart3, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced LLMs understand context and extract key insights automatically",
    color: "from-primary to-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process videos in minutes, not hours. Get your notes instantly.",
    color: "from-secondary to-purple-500",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Spend less time taking notes, more time learning and creating.",
    color: "from-accent to-blue-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your videos and notes are encrypted and never shared.",
    color: "from-primary to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Smart Formatting",
    description: "Automatically organized with headers, bullet points, and summaries.",
    color: "from-secondary to-indigo-500",
  },
  {
    icon: Sparkles,
    title: "Multiple Formats",
    description: "Export as Markdown, PDF, or integrate with your favorite tools.",
    color: "from-accent to-cyan-500",
  },
]

export function Features() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Powerful Features for Modern Learners
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform your video learning experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`p-6 border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-500 group cursor-pointer ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
