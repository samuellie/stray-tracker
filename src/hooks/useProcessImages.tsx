import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'

export function useProcessImages() {
  const [images, setImages] = useState<File[]>([])
  const [thumbnails, setThumbnails] = useState<File[]>([])
  const [progress, setProgress] = useState<number[]>([])
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
                useWebWorker: true,
                onProgress: progress => {
                  console.log(progress)

                  onProgress?.(actualIndex, progress / 2)
                }, // Half progress for full size
              })
              fullSize[actualIndex - startIndex] = compressedFile
              onProgress?.(actualIndex, 50) // Set to 50% after full size
            } catch (error) {
              console.error(
                'Full size compression failed for image',
                actualIndex,
                error
              )
              // Keep original file if compression fails
              fullSize[actualIndex - startIndex] = file
              onProgress?.(actualIndex, 50)
            }
          })
        )
        // Compress thumbnails
        await Promise.all(
          batch.map(async (file, idx) => {
            const actualIndex = startIndex + i + idx
            try {
              const thumbnailFile = await imageCompression(
                fullSize[actualIndex - startIndex] || file,
                {
                  maxSizeMB: 0.1,
                  maxWidthOrHeight: 300,
                  useWebWorker: true,
                }
              )
              thumbnails[actualIndex - startIndex] = thumbnailFile
              onProgress?.(actualIndex, 100) // Set to 100% after thumbnail
            } catch (error) {
              console.error(
                'Thumbnail compression failed for image',
                actualIndex,
                error
              )
              // Keep original file if compression fails
              thumbnails[actualIndex - startIndex] = file
              onProgress?.(actualIndex, 100)
            }
          })
        )
      }
      return { fullSize, thumbnails }
    },
    [maxConcurrentCompressions]
  )

  const addImages = useCallback(
    async (files: File[]) => {
      const startIndex = images.length
      setProgress(prev => [...prev, ...new Array(files.length).fill(1)])
      setImages(prev => [...prev, ...files])
      setTimeout(async () => {
        const { fullSize, thumbnails: newThumbnails } = await compressImages(
          files,
          startIndex,
          (actualIndex, prog) =>
            setProgress(prev =>
              prev.map((p, j) => (j === actualIndex ? prog : p))
            )
        )
        // setImages(prev => [...prev, ...fullSize])
        setThumbnails(prev => [...prev, ...newThumbnails])
      }, 300)
    },
    [images.length, compressImages]
  )

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setThumbnails(prev => prev.filter((_, i) => i !== index))
    setProgress(prev => prev.filter((_, i) => i !== index))
  }, [])

  return { images, thumbnails, progress, addImages, removeImage }
}
