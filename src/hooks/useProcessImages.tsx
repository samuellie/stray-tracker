import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { generateSessionKey, uploadSightingPhoto } from '~/server/files'
import { getBaseFileName } from '~/lib/utils'

export interface ProcessedImage {
  file: File
  thumbnail?: File
  key?: string
}

// Progress per image: 1-70 compressing, 70-99 uploading, 100 done, -1 failed
const COMPRESSION_PROGRESS_CEILING = 70
const UPLOAD_STARTED_PROGRESS = 80

export function useProcessImages() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [progress, setProgress] = useState<number[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  // Each compression runs in its own web worker; more than ~4 in flight
  // risks memory pressure on low-end phones
  const maxConcurrentCompressions = 3

  const setProgressAt = useCallback((index: number, value: number) => {
    setProgress(prev => prev.map((p, j) => (j === index ? value : p)))
  }, [])

  const updateImageAt = useCallback(
    (index: number, patch: Partial<ProcessedImage>) => {
      setImages(prev =>
        prev.map((img, j) => (j === index ? { ...img, ...patch } : img))
      )
    },
    []
  )

  const compressImage = useCallback(
    async (
      file: File,
      onProgress: (progress: number) => void
    ): Promise<{ fullSize: File; thumbnail: File }> => {
      const fileBaseName = getBaseFileName(file.name)

      // Compress the full-size image first (reports into the first half of the
      // 0-70 compression band).
      const compressedFull = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        fileType: 'image/webp',
        useWebWorker: true,
        onProgress: p => onProgress(Math.min(35, Math.round(p * 0.35))),
      })
      const fullSize = new File([compressedFull], `${fileBaseName}.webp`, {
        type: 'image/webp',
      })

      // Derive the thumbnail from the already-compressed full-size file
      // instead of re-decoding the original photo. Decoding a ~1MB / 1920px
      // WebP is dramatically cheaper than re-decoding a 12MP camera photo,
      // which was the main source of CPU heat during upload.
      const compressedThumbnail = await imageCompression(fullSize, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 300,
        fileType: 'image/webp',
        useWebWorker: true,
        onProgress: p =>
          onProgress(
            Math.min(COMPRESSION_PROGRESS_CEILING, 35 + Math.round(p * 0.35))
          ),
      })

      return {
        fullSize,
        thumbnail: new File(
          [compressedThumbnail],
          `${fileBaseName}_thumbnail.webp`,
          { type: 'image/webp' }
        ),
      }
    },
    []
  )

  const uploadImage = useCallback(
    async (
      session: string,
      fullSize: File,
      thumbnail: File
    ): Promise<string> => {
      const fullImageFormData = new FormData()
      fullImageFormData.append('sessionId', session)
      fullImageFormData.append('file', fullSize)
      const thumbnailFormData = new FormData()
      thumbnailFormData.append('sessionId', session)
      thumbnailFormData.append('file', thumbnail)

      // Upload full-size and thumbnail concurrently so the radio is on for
      // one window instead of two back-to-back transmissions.
      const [response] = await Promise.all([
        uploadSightingPhoto({ data: fullImageFormData }),
        uploadSightingPhoto({ data: thumbnailFormData }),
      ])
      return response.key
    },
    []
  )

  const getSessionKey = useCallback(async () => {
    if (sessionId == undefined) {
      const sessionKey = await generateSessionKey()
      setSessionId(sessionKey)
      return sessionKey
    }
    return sessionId
  }, [sessionId])

  // Compress + upload the given files, writing progress/results into the
  // images array at each file's index. Failures mark progress -1 and leave
  // the original file in place so it can be retried.
  const processFiles = useCallback(
    async (entries: { file: File; index: number }[]) => {
      const session = await getSessionKey()

      for (let i = 0; i < entries.length; i += maxConcurrentCompressions) {
        const batch = entries.slice(i, i + maxConcurrentCompressions)
        await Promise.all(
          batch.map(async ({ file, index }) => {
            try {
              const { fullSize, thumbnail } = await compressImage(file, p =>
                setProgressAt(index, p)
              )
              updateImageAt(index, { file: fullSize, thumbnail })
              setProgressAt(index, UPLOAD_STARTED_PROGRESS)

              const key = await uploadImage(session, fullSize, thumbnail)
              updateImageAt(index, { key })
              setProgressAt(index, 100)
            } catch (error) {
              console.error('Failed to process image', index, error)
              setProgressAt(index, -1)
            }
          })
        )
      }
    },
    [
      getSessionKey,
      compressImage,
      uploadImage,
      setProgressAt,
      updateImageAt,
      maxConcurrentCompressions,
    ]
  )

  const addImages = useCallback(
    async (files: File[]) => {
      const startIndex = images.length
      setImages(prev => [...prev, ...files.map(file => ({ file }))])
      setProgress(prev => [...prev, ...new Array(files.length).fill(1)])

      await processFiles(
        files.map((file, i) => ({ file, index: startIndex + i }))
      )
    },
    [images.length, processFiles]
  )

  const retryImage = useCallback(
    async (index: number) => {
      const img = images[index]
      if (!img) return
      setProgressAt(index, 1)
      await processFiles([{ file: img.file, index }])
    },
    [images, processFiles, setProgressAt]
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
    retryImage,
    removeImage,
  }
}
