"use client"

import { useFetchVideos } from "@/lib/use-fetch-videos"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

const statusColors: Record<string, string> = {
  UPLOADING: "bg-blue-500/10 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-500/10 text-purple-700 border-purple-200",
  COMPLETED: "bg-green-500/10 text-green-700 border-green-200",
  FAILED: "bg-red-500/10 text-red-700 border-red-200",
}

export function VideosList() {
  const { videos, loading, error } = useFetchVideos()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-700">Error loading videos: {error}</p>
      </Card>
    )
  }

  if (videos.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <p className="text-muted-foreground">No videos yet. Upload your first video to get started!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => (
        <Card key={video.id} className="p-4 hover:bg-card/80 transition-colors cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{video.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(video.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge className={`flex-shrink-0 ${statusColors[video.status] || "bg-gray-100 text-gray-700"}`}>
              {video.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
