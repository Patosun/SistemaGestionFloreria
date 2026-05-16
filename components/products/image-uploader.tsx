"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export function ImageUploader({ value, onChange, maxImages = 5 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/v1/upload", { method: "POST", body: formData })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Error al subir imagen")
    return json.data.url as string
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const remaining = maxImages - value.length
    if (remaining <= 0) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`)
      return
    }
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    try {
      const urls = await Promise.all(toUpload.map(uploadFile))
      onChange([...value, ...urls])
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al subir")
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50 hover:bg-muted/40",
          uploading && "pointer-events-none opacity-60",
          value.length >= maxImages && "pointer-events-none opacity-40",
        )}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          {uploading ? "Subiendo…" : value.length >= maxImages
            ? `Límite de ${maxImages} imágenes alcanzado`
            : "Haz clic o arrastra imágenes aquí"}
        </p>
        <p className="text-xs text-muted-foreground/60">JPG, PNG o WEBP · máx. 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {value.map((url, i) => (
            <div key={url} className="group relative aspect-square rounded-lg overflow-hidden border border-border/50">
              <Image
                src={url}
                alt={`Imagen ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized={url.startsWith("/uploads/")}
              />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
