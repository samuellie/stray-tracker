import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { generateSessionKey, uploadSightingPhoto } from '~/server/files'
import { file } from 'better-auth'
import { getBaseFileName } from '~/lib/utils'

export interface ProcessedImage {
  file: File
  thumbnail?: File
  key?: string
}

export function useProcessImages() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [progress, setProgress] = useState<number[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const maxConcurrentCompressions = 1

  const compressImages = useCallback(
    async (
      files: File[],
      startIndex: number,
      onProgress?: (actualIndex: number, progress: number) => void
    ): Promise<{ fullSize: File[]; thumbnails: File[] }> => {
      const fullSize: File[] = []
      const thumbnails: File[] = []
      for (let i = 0; i < files.length; i += maxConcurrentCompressions) {
        const batch = files.slice(i, i + maxConcurrentCompressions)
        // Compress full size first
        await Promise.all(
          batch.map(async (file, idx) => {
            const actualIndex = startIndex + i + idx
            try {
              const compressedFile = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                fileType: 'image/webp',
                useWebWorker: true,
                onProgress: progress =>
                  onProgress?.(actualIndex, progress * 0.375), // Half progress for full size
              })
              const fileBaseName = getBaseFileName(file.name)
              const fullSizeFile = new File(
                [compressedFile],
                `${fileBaseName}.webp`,
                { type: 'image/webp' }
              )
              fullSize[actualIndex - startIndex] = fullSizeFile
              const compressedThumbnail = await imageCompression(file, {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 300,
                fileType: 'image/webp',
                useWebWorker: true,
                onProgress: progress =>
                  onProgress?.(actualIndex, progress * 0.375 + 37.5), // Remaining Half progress for thumbnail size
              })
              const thumbnailBaseName = getBaseFileName(file.name)
              const thumbnailFile = new File(
                [compressedThumbnail],
                `${thumbnailBaseName}_thumbnail.webp`,
                { type: 'image/webp' }
              )
              thumbnails[actualIndex - startIndex] = thumbnailFile

              onProgress?.(actualIndex, 50) // Set to 50% after full size
            } catch (error) {
              console.error(
                'Full size compression failed for image',
                actualIndex,
                error
              )
              onProgress?.(actualIndex, -1) // -1 indicate failure
            }
          })
        )
      }
      return { fullSize, thumbnails }
    },
    [maxConcurrentCompressions]
  )

  const getSessionKey = useCallback(async () => {
    if (sessionId == undefined) {
      const sessionKey = await generateSessionKey()
      setSessionId(sessionKey)
      return sessionKey
    }
    return sessionId
  }, [sessionId])

  const uploadToTempStorage = useCallback(
    async (
      sessionId: string,
      processedImages: ProcessedImage[],

      onProgress?: (index: number, progress: number) => void
    ): Promise<ProcessedImage[]> => {
      try {
        // Upload files directly to R2
        const uploadPromises = processedImages.map(async (img, index) => {
          const fullImageFormData = new FormData()
          fullImageFormData.append('sessionId', sessionId)
          fullImageFormData.append('file', img.file)
          const thumbnailFormData = new FormData()
          thumbnailFormData.append('sessionId', sessionId)
          thumbnailFormData.append('file', img.thumbnail!)

          try {
            const response = await uploadSightingPhoto({
              data: fullImageFormData,
            })
            await uploadSightingPhoto({ data: thumbnailFormData })

            onProgress?.(index, 100)

            return {
              ...img,
              key: response.key,
            }
          } catch (error) {
            console.error('Failed to upload image:', error)
            throw error
          }
        })

        return await Promise.all(uploadPromises)
      } catch (error) {
        console.error('Failed to get upload URLs:', error)
        throw error
      }
    },
    []
  )

  const addImages = useCallback(
    async (files: File[]) => {
      const startIndex = images.length
      const initialImages: ProcessedImage[] = files.map((file, idx) => ({
        file,
      }))

      setImages(prev => [...prev, ...initialImages])
      setProgress(prev => [...prev, ...new Array(files.length).fill(1)])
      // Get sessionId
      const sessionId = await getSessionKey()

      // First compress images
      const { fullSize, thumbnails } = await compressImages(
        files,
        startIndex,
        (actualIndex, prog) =>
          setProgress(prev =>
            prev.map((p, j) => (j === actualIndex ? prog : p))
          )
      )

      // Create processed images
      const processedImages: ProcessedImage[] = fullSize.map((file, idx) => ({
        file,
        thumbnail: thumbnails[idx],
      }))

      // Upload to temporary storage
      const uploadedImages = await uploadToTempStorage(
        sessionId,
        processedImages,
        (index, prog) => {
          const actualIndex = startIndex + index
          setProgress(prev =>
            prev.map((p, j) => (j === actualIndex ? prog : p))
          )
        }
      )
      setImages(prev => {
        const newImages = [...prev]
        for (let i = 0; i < uploadedImages.length; i++) {
          newImages[startIndex + i] = uploadedImages[i]
        }
        return newImages
      })
    },
    [images.length, compressImages, uploadToTempStorage]
  )

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setProgress(prev => prev.filter((_, i) => i !== index))
  }, [])

  return {
    images,
    thumbnails: images.map(img => img.thumbnail),
    progress,
    sessionId,
    setImages,
    setPrimaryImage: useCallback((index: number) => {
      setImages(prev => {
        if (index === 0 || index >= prev.length) return prev
        const newImages = [...prev]
        const [selected] = newImages.splice(index, 1)
        newImages.unshift(selected)
        return newImages
      })
      setProgress(prev => {
        if (index === 0 || index >= prev.length) return prev
        const newProgress = [...prev]
        const [selected] = newProgress.splice(index, 1)
        newProgress.unshift(selected)
        return newProgress
      })
    }, []),
    addImages,
    removeImage,
  }
}
