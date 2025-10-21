"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPresignedUrl, uploadToAzure, validateFileType } from "@/lib/upload-client"

export function VideoUpload() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(false)
    setUploadProgress(0)

    // Validate file type
    if (!validateFileType(file.name)) {
      setError("Unsupported file type. Allowed: mp4, webm, mov, mkv.")
      return
    }

    try {
      setIsUploading(true)

      // Step 1: Get presigned URL
      const sasResponse = await getPresignedUrl(file.name)

      // Step 2: Upload to Azure
      await uploadToAzure(file, sasResponse.url, sasResponse.headers, (progress) => {
        setUploadProgress(Math.round(progress))
      })

      // Step 3: Show success message
      setSuccess(true)
      setUploadProgress(100)
      setIsUploading(false)

      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 3000)
    } catch (err) {
      setIsUploading(false)
      const errorMessage = err instanceof Error ? err.message : "Upload failed. Please try again."

      if (errorMessage === "UNAUTHORIZED") {
        router.push("/signin")
        return
      }

      setError(errorMessage)
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="p-12 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isUploading ? "Uploading..." : "Upload Video"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Drag and drop your video here or click to select</p>
          <p className="text-xs text-muted-foreground">Supported formats: MP4, WebM, MOV, MKV</p>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.webm,.mov,.mkv,video/mp4,video/webm,video/quicktime,video/x-matroska"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Upload successful. Processing will start shortly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
