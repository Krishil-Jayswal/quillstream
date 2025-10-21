"use client"

import { useEffect, useState } from "react"
import { apiCall } from "./api-client"

export interface Video {
  id: string
  title: string
  status: string
  createdAt: string
}

export function useFetchVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiCall("/api/v1/upload")
        setVideos(data.videos || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch videos")
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return { videos, loading, error }
}
