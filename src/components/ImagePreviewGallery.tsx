import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useIsMobile } from '~/hooks/use-mobile'
import { motion, AnimatePresence } from 'motion/react'

interface ImagePreviewGalleryProps {
  thumbnails: File[]
  imageProgress: number[]
  onRemove?: (index: number) => void
}

export function ImagePreviewGallery({
  thumbnails,
  imageProgress,
  onRemove,
}: ImagePreviewGalleryProps) {
  const isMobile = useIsMobile()
  return (
    <AnimatePresence mode="wait">
      {thumbnails.length > 0 && (
        <motion.div
          key="gallery"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-muted-foreground mb-2">
            {thumbnails.length} image{thumbnails.length > 1 ? 's' : ''} selected
          </p>
          <div className="grid grid-cols-3 gap-2">
            <AnimatePresence mode="popLayout">
              {thumbnails.map((thumbnail, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt={`Selected image ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  {imageProgress[index] !== undefined &&
                    imageProgress[index] < 100 && (
                      <motion.div className="absolute bottom-1 left-0 right-0 h-2 bg-white/80 rounded overflow-hidden">
                        <motion.div
                          className="h-full bg-red-500 rounded"
                          animate={{ width: `${imageProgress[index] || 0}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    )}
                  {onRemove && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className={`absolute top-2 right-2 transition-opacity ${
                        isMobile ? '' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
