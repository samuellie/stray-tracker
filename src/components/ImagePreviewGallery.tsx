import { useEffect, useMemo, useRef } from 'react'
import { Button } from '~/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useIsMobile } from '~/hooks/use-mobile'
import { ProcessedImage } from '~/hooks/useProcessImages'

interface ImagePreviewGalleryProps {
  images: ProcessedImage[]
  imageProgress: number[]
  onRemove?: (index: number) => void
  onSetPrimary?: (index: number) => void
}

export function ImagePreviewGallery({
  images,
  imageProgress,
  onRemove,
  onSetPrimary,
}: ImagePreviewGalleryProps) {
  const isMobile = useIsMobile()

  // Cache an object URL per File so we don't allocate a new blob URL on every
  // render. Re-renders during upload were leaking URLs and causing the <img>
  // src to change every frame, which flashed the previews.
  const urlCacheRef = useRef(new Map<File, string>())
  const sources = useMemo(
    () =>
      images.map(({ file, thumbnail }) => {
        const key = thumbnail ?? file
        const cache = urlCacheRef.current
        let url = cache.get(key)
        if (!url) {
          url = URL.createObjectURL(key)
          cache.set(key, url)
        }
        return { key, url }
      }),
    [images]
  )

  // Drop URLs for files that have been removed from the gallery.
  useEffect(() => {
    const cache = urlCacheRef.current
    const live = new Set(sources.map(s => s.key))
    for (const [file, url] of cache) {
      if (!live.has(file)) {
        URL.revokeObjectURL(url)
        cache.delete(file)
      }
    }
  }, [sources])

  // Revoke everything on unmount.
  useEffect(() => {
    const cache = urlCacheRef.current
    return () => {
      for (const url of cache.values()) {
        URL.revokeObjectURL(url)
      }
      cache.clear()
    }
  }, [])

  if (images.length === 0) return null

  return (
    <div>
      {onSetPrimary && images.length > 1 && (
        <p className="text-xs mt-1 mb-2 text-primary/80 font-medium">
          Tap a photo to set as cover
        </p>
      )}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {images.map(({ file }, index) => {
          const isPrimary = index === 0
          const src = sources[index]?.url
          const progress = imageProgress[index]
          return (
            <div
              key={file.name}
              className="relative group cursor-pointer"
              onClick={() => onSetPrimary?.(index)}
            >
              <img
                src={src}
                alt={`Selected image ${index + 1}`}
                className={`w-full aspect-square object-cover rounded-xl border-2 transition-colors ${isPrimary ? 'border-primary' : 'border-transparent'}`}
              />
              {isPrimary && (
                <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-[2px]">
                  Cover
                </div>
              )}
              {progress !== undefined && progress < 100 && (
                <div className="absolute bottom-1 left-0 right-0 h-2 bg-white/80 rounded overflow-hidden mx-1">
                  <div
                    className="h-full bg-red-500 rounded transition-[width] duration-200"
                    style={{ width: `${Math.max(progress, 0)}%` }}
                  />
                </div>
              )}
              {onRemove && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className={`absolute top-2 right-2 transition-opacity ${isMobile ? '' : 'opacity-0 group-hover:opacity-100'}`}
                  onClick={e => {
                    e.stopPropagation()
                    onRemove(index)
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
