'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import Camera from '~/components/ui/camera/camera'
import { CameraProvider } from '~/components/ui/camera/camera-provider'
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog'
import { CameraIcon } from 'lucide-react'

interface CameraDialogProps {
  onCapturedImages: (images: string[]) => void
}

export function CameraDialog({ onCapturedImages }: CameraDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <CameraIcon className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
      </DialogTrigger>
      <DialogContent className="h-screen max-w-none border-0 p-0">
        <CameraProvider>
          <Camera
            onClosed={() => setOpen(false)}
            onCapturedImages={onCapturedImages}
          />
        </CameraProvider>
      </DialogContent>
    </Dialog>
  )
}
