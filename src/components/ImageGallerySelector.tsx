import { useRef } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { ImageIcon } from 'lucide-react'

interface ImageGallerySelectorProps {
  onFilesSelected: (files: FileList | null) => void
}

export function ImageGallerySelector({
  onFilesSelected,
}: ImageGallerySelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="text-center">
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => onFilesSelected(e.target.files)}
        className="hidden"
      />
      <Button
        variant="outline"
        className="w-full"
        type="button"
        onClick={handleButtonClick}
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Choose from Gallery
      </Button>
    </div>
  )
}
