import { Button } from '~/components/ui/button'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useIsMobile } from '~/hooks/use-mobile'
import { motion, AnimatePresence } from 'motion/react'
import { ProcessedImage } from '~/hooks/useProcessImages'

interface ImagePreviewGalleryProps {
  images: ProcessedImage[]
  imageProgress: number[]
  onRemove?: (index: number) => void
  onSetPrimary?: (index: number) => void
  onRetry?: (index: number) => void
}

export function ImagePreviewGallery({
  images,
  imageProgress,
  onRemove,
  onSetPrimary,
  onRetry,
}: ImagePreviewGalleryProps) {
  const isMobile = useIsMobile()
  return (
    <>
      <AnimatePresence mode="wait">
        {images.length > 0 && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-muted-foreground mb-2">
              {onSetPrimary && images.length > 1 && (
                <span className="block text-xs mt-1 text-primary/80 font-medium">
                  Tap a photo to set as cover
                </span>
              )}
            </p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              <AnimatePresence mode="popLayout">
                {images.map(({ thumbnail, file }, index) => {
                  const isPrimary = index === 0
                  const progress = imageProgress[index]
                  const hasFailed = progress === -1
                  const isProcessing =
                    progress !== undefined && progress >= 0 && progress < 100
                  return (
                    <motion.div
                      key={file.name}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="relative group cursor-pointer"
                      onClick={() => onSetPrimary?.(index)}
                    >
                      <img
                        src={URL.createObjectURL(thumbnail || file)}
                        alt={`Selected image ${index + 1}`}
                        className={`w-full aspect-square object-cover rounded-xl border-2 transition-all ${isPrimary ? 'border-primary' : 'border-transparent'}`}
                      />
                      {isPrimary && (
                        <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-[2px]">
                          Cover
                        </div>
                      )}
                      {hasFailed && (
                        <div className="absolute inset-0 rounded-xl bg-black/60 flex flex-col items-center justify-center gap-1.5 text-white">
                          <span className="text-[11px] font-medium">
                            Upload failed
                          </span>
                          {onRetry && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={e => {
                                e.stopPropagation()
                                onRetry(index)
                              }}
                            >
                              <RotateCcw size={12} className="mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      )}
                      {isProcessing && (
                        <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-black/50 px-2 pt-1 pb-1.5 backdrop-blur-[2px]">
                          <span className="block text-[10px] font-medium text-white mb-0.5">
                            {progress < 70 ? 'Compressing…' : 'Uploading…'}
                          </span>
                          <div className="h-1.5 bg-white/30 rounded overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded"
                              animate={{ width: `${Math.max(progress, 4)}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                      {onRemove && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className={`absolute top-2 right-2 transition-opacity ${isMobile ? '' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          onClick={() => onRemove(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* <ImageManagerDialog
        images={thumbnails}
        onRemoveImage={removeImage}
        open={isImageManagerOpen}
        onOpenChange={setIsImageManagerOpen}
      /> */}
    </>
  )
}
