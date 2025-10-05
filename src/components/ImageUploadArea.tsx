import { useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Upload } from 'lucide-react'

interface ImageUploadAreaProps {
  onFilesSelected: (files: FileList | null) => void
}

export function ImageUploadArea({ onFilesSelected }: ImageUploadAreaProps) {
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

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-900 mb-2">
        Drag and drop a photo here
      </p>
      <p className="text-sm text-gray-500 mb-4">or click to select a file</p>
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={e => onFilesSelected(e.target.files)}
        className="hidden"
        id="file-upload"
      />
      <Label htmlFor="file-upload">
        <Button variant="outline" type="button">
          Choose File
        </Button>
      </Label>
    </div>
  )
}
