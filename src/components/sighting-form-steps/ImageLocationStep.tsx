import { useCallback, useState, useEffect } from 'react'
import { useIsMobile } from '~/hooks/use-mobile'
import { useProcessImages } from '~/hooks/useProcessImages'
import { CameraDialog } from '~/components/CameraDialog'
import { ImageGallerySelector } from '~/components/ImageGallerySelector'
import { ImageUploadArea } from '~/components/ImageUploadArea'
import { MapComponent } from '~/components/MapComponent'
import { ImagePreviewGallery } from '~/components/ImagePreviewGallery'

interface ImageLocationStepProps {
  onImagesUpdate: (images: File[]) => void
  onThumbnailsUpdate: (thumbnails: File[]) => void
  onMarkerDragEnd: (position: { lat: number; lng: number }) => void
}

export function ImageLocationStep({
  onImagesUpdate,
  onThumbnailsUpdate,
  onMarkerDragEnd,
}: ImageLocationStepProps) {
  const isMobile = useIsMobile()
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>()
  const {
    images,
    thumbnails,
    progress: imageProgress,
    addImages,
    removeImage,
  } = useProcessImages()

  useEffect(() => {
    onImagesUpdate(images)
    onThumbnailsUpdate(thumbnails)
  }, [images, thumbnails, onImagesUpdate, onThumbnailsUpdate])

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Set Location</h2>
        <div className="space-y-4">
          <div className="h-44">
            <MapComponent
              draggable
              className="h-full"
              defaultShowCurrentLocation
              markerPosition={markerPosition}
              onMarkerDragEnd={handleMarkerDragEnd}
              // showUserLocation={false}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Add Images</h2>
        <ImagePreviewGallery
          thumbnails={images}
          imageProgress={imageProgress}
          onRemove={removeImage}
        />
        {isMobile ? (
          <div className="space-y-4">
            <CameraDialog onCapturedImages={handleCapturedImages} />
            <ImageGallerySelector onFilesSelected={handleFileUpload} />
          </div>
        ) : (
          <ImageUploadArea onFilesSelected={handleFileUpload} />
        )}
      </div>
    </div>
  )
}
