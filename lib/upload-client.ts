import { useAuthStore } from "./auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787"

interface SASUrlResponse {
  url: string
  method: string
  headers: Record<string, string>
}

export async function getPresignedUrl(filename: string): Promise<SASUrlResponse> {
  const { token, clearToken } = useAuthStore.getState()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = token
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/upload/pre-signed-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({ filename }),
  })

  if (response.status === 401) {
    clearToken()
    throw new Error("UNAUTHORIZED")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Failed to get presigned URL: ${response.statusText}`)
  }

  return response.json()
}

export async function uploadToAzure(
  file: File,
  sasUrl: string,
  headers: Record<string, string>,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        onProgress?.(progress)
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"))
    })

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"))
    })

    xhr.open(headers.method || "PUT", sasUrl)

    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== "method") {
        xhr.setRequestHeader(key, value)
      }
    })

    xhr.send(file)
  })
}

export function validateFileType(filename: string): boolean {
  const allowedTypes = ["mp4", "webm", "mov", "mkv"]
  const extension = filename.split(".").pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}
