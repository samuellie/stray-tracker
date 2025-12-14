import { useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '~/components/ui/input'
import { Upload } from 'lucide-react'

interface ImageUploadAreaProps {
  onFilesSelected: (files: FileList | null) => void
}

export function ImageUploadArea({
  onFilesSelected,
  compact = false,
}: ImageUploadAreaProps & { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      onFilesSelected(files)
    },
    [onFilesSelected]
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <motion.div
      layout
      className={`border-gray-300 rounded-xl text-center hover:border-gray-400 transition-colors hover:cursor-pointer flex flex-col items-center justify-center overflow-hidden 
        ${compact ? 'border-2 p-4 h-12' : 'border-dashed border-4 p-4 min-h-[200px]'
        }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <motion.div
        layout
        className={`flex ${compact ? 'flex-row items-center gap-3' : 'flex-col items-center'}`}
      >
        <motion.div layout className="relative">
          <Upload className={`${compact ? 'h-6 w-6' : 'h-12 w-12'} text-muted-foreground transition-all duration-300`} />
        </motion.div>

        <motion.div layout className="flex flex-col items-start">
          <motion.p
            layout
            className={`${compact ? 'text-base' : 'text-lg'} font-medium text-foreground transition-all duration-300`}
          >
            {compact ? 'Add more photos' : 'Drag and drop photos here'}
          </motion.p>
          <AnimatePresence>
            {!compact && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-muted-foreground"
              >
                or click to select a file
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={e => onFilesSelected(e.target.files)}
        className="hidden"
        id="file-upload"
        ref={inputRef}
      />
    </motion.div>
  )
}
