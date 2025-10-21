"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function CTA() {
  const router = useRouter()

  const handleStartTrial = () => {
    router.push("/signin")
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl blur-3xl"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-card/80 to-card/40 border border-primary/30 rounded-2xl p-12 md:p-16 text-center backdrop-blur-sm">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who are saving hours every week with Quill Stream.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground group"
              onClick={handleStartTrial}
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={20} />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            No credit card required. Get 5 free video processing credits.
          </p>
        </div>
      </div>
    </section>
  )
}
