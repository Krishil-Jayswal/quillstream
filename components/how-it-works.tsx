"use client"

import { Card } from "@/components/ui/card"
import { Upload, Wand2, Download, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Your Video",
    description: "Share any video URL or upload directly. Supports all major formats.",
    step: "01",
  },
  {
    icon: Wand2,
    title: "AI Processing",
    description: "Our LLMs analyze the content and extract key information.",
    step: "02",
  },
  {
    icon: Download,
    title: "Get Your Notes",
    description: "Receive beautifully formatted notes in your preferred format.",
    step: "03",
  },
  {
    icon: CheckCircle,
    title: "Share & Collaborate",
    description: "Share notes with classmates or team members instantly.",
    step: "04",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">How Quill Stream Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Simple, intuitive, and incredibly powerful</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="relative">
                <Card className="p-6 border border-border bg-background/50 backdrop-blur-sm h-full hover:border-primary/50 transition-all">
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>

                  <div className="w-12 h-12 rounded-lg bg-primary/20 p-2.5 mb-4">
                    <Icon className="w-full h-full text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
