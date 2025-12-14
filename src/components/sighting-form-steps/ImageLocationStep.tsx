import { useCallback, useState, useEffect, useRef } from 'react'
import { useIsMobile } from '~/hooks/use-mobile'
import { ProcessedImage, useProcessImages } from '~/hooks/useProcessImages'
import { CameraDialog } from '~/components/CameraDialog'
import { ImageGallerySelector } from '~/components/ImageGallerySelector'
import { ImageUploadArea } from '~/components/ImageUploadArea'
import { MapComponent } from '~/components/MapComponent'
import { ImagePreviewGallery } from '~/components/ImagePreviewGallery'
import { Textarea } from '~/components/ui/textarea'

interface ImageLocationStepProps {
  onImagesUpdate?: (images: ProcessedImage[]) => void
  onMarkerDragEnd: (position: { lat: number; lng: number }) => void
  description: string
  onDescriptionChange: (value: string) => void
  date: string
  onDateChange: (value: string) => void
}

export function ImageLocationStep({
  onImagesUpdate,
  onMarkerDragEnd,
  description,
  onDescriptionChange,
  date,
  onDateChange,
}: ImageLocationStepProps) {
  const isMobile = useIsMobile()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>()
  const {
    images,
    progress: imageProgress,
    addImages,
    removeImage,
  } = useProcessImages()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    onImagesUpdate?.(images)
  }, [images, onImagesUpdate])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [description])

  const handleCapturedImages = useCallback(
    async (imageDataUrls: string[]) => {
      // Convert base64 data URLs to File objects
      const newFiles = imageDataUrls.map((dataUrl, index) => {
        const [mimeInfo, base64] = dataUrl.split(',')
        const mimeType = mimeInfo.split(':')[1].split(';')[0]
        const blob = new Blob(
          [Uint8Array.from(atob(base64), c => c.charCodeAt(0))],
          { type: mimeType }
        )
        return new File([blob], `sighting-image-${Date.now()}-${index}.jpg`, {
          type: mimeType,
        })
      })
      await addImages(newFiles)
    },
    [addImages]
  )

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (files) {
        const fileArray = Array.from(files)
        await addImages(fileArray)
      }
    },
    [addImages]
  )

  const handleMarkerDragEnd = (position: { lat: number; lng: number }) => {
    setMarkerPosition(position)
    onMarkerDragEnd(position)
  }

  // Format date for display
  const displayDate = date
    ? new Date(date).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    : 'Now'

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">New Sighting</h2>
        {/* Subtle Date Picker */}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <span>{displayDate}</span>
            <span className="opacity-50 text-[10px]">▼</span>
          </button>
        </div>
        {showDatePicker && (
          <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <input
              type="datetime-local"
              value={date}
              onChange={e => {
                onDateChange(e.target.value)
              }}
              className="text-sm bg-transparent border rounded p-1 text-foreground"
            />
          </div>
        )}
        <div className="space-y-4">
          {/* Image Preview & Upload */}
          <ImagePreviewGallery
            images={images}
            imageProgress={imageProgress}
            onRemove={removeImage}
          />
          {isMobile ? (
            <div className="flex gap-2">
              <CameraDialog onCapturedImages={handleCapturedImages} />
              <ImageGallerySelector onFilesSelected={handleFileUpload} />
            </div>
          ) : (
            <ImageUploadArea onFilesSelected={handleFileUpload} compact={images.length > 0} />
          )}

          {/* Description Input (Instagram style) */}
          <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-2">Caption</h3>
          <Textarea
            ref={textareaRef}
            className="w-full resize-none bg-transparent border-0 border-b border-border p-0 pb-2 text-base focus:ring-0 focus:border-primary placeholder:text-muted-foreground overflow-hidden min-h-0 focus-visible:ring-0 shadow-none rounded-none"
            placeholder="Write a something about this sighting..."
            rows={2}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />

          <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-2">Location</h3>
          <div className={isMobile ? 'h-64' : 'h-64'}>
            <MapComponent
              draggable
              className="h-full rounded-md overflow-hidden"
              defaultShowCurrentLocation
              positionInput
              onMarkerDragEnd={handleMarkerDragEnd}
            // showUserLocation={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
