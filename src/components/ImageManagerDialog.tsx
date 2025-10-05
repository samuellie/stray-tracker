import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

interface ImageManagerDialogProps {
  images: File[]
  onRemoveImage: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageManagerDialog({
  images,
  onRemoveImage,
  open,
  onOpenChange,
}: ImageManagerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Images</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1"
                onClick={() => onRemoveImage(index)}
              >
                X
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
