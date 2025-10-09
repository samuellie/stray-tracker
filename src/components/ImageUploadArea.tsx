import { useCallback, useRef } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Upload } from 'lucide-react'

interface ImageUploadAreaProps {
  onFilesSelected: (files: FileList | null) => void
}

export function ImageUploadArea({ onFilesSelected }: ImageUploadAreaProps) {
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
    <div
      className="border-4 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-gray-400 transition-colors hover:cursor-pointer"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="text-lg font-medium text-gray-900 ">
        Drag and drop photos here
      </p>
      <p className="text-sm text-gray-500">or click to select a file</p>
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={e => onFilesSelected(e.target.files)}
        className="hidden"
        id="file-upload"
        ref={inputRef}
      />
    </div>
  )
}
