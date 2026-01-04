import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { SightingPhoto, type Sighting, type Stray } from 'db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Spinner } from '~/components/ui/spinner'
import { formatRelativeDate } from '~/utils/date'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from '~/components/ui/carousel'
import { useFindSightingPhotos } from '~/hooks/server/useFindSightingPhotos'
import { getSightingFullImageUrl } from '~/utils/files'
import { User } from 'better-auth'
import { Img } from 'react-image'
import { getPlaceholderImage } from '~/utils/strayImageFallbacks'
import { useRouter } from '@tanstack/react-router'
import { authClient } from '~/lib/auth-client'
import { MoreVertical, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useDeleteSighting } from '~/hooks/server/useDeleteSighting'
import { ConfirmationDialog } from './ConfirmationDialog'
import { useState } from 'react'

interface SightingDialogProps {
  selectedSighting:
  | (Stray & {
    sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
  })
  | null
  onClose: () => void
}

export function SightingDialog({
  selectedSighting,
  onClose,
}: SightingDialogProps) {
  const router = useRouter()
  const deleteSightingMutation = useDeleteSighting()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  if (!selectedSighting) return null

  const { data: session } = authClient.useSession()
  const isOwner = session?.user?.id === selectedSighting.sighting.user.id

  const { data: sightingPhotos, isLoading } = useFindSightingPhotos(
    selectedSighting.sighting.id
  )

  const handleDelete = () => {
    setIsDeleting(true)
    deleteSightingMutation.mutate(selectedSighting.sighting.id, {
      onSuccess: () => {
        setIsDeleting(false)
        setIsDeleteDialogOpen(false)
        onClose()
      },
      onError: () => {
        setIsDeleting(false)
        // You might want to show a toast here
      }
    })
  }

  return (
    <Card className="border-0 max-w-2xl w-full overflow-hidden relative group">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
        onClick={e => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Close popup"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* User Header - Instagram style */}
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-1 ring-primary/10">
            <AvatarImage src={selectedSighting.sighting.user.image || ''} />
            <AvatarFallback className="text-sm bg-primary/5 text-primary">
              {selectedSighting.sighting.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-none text-foreground">
              {selectedSighting.sighting.user.name}
              {isOwner && ' (me)'}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-tight">
              {formatRelativeDate(
                Number(selectedSighting.sighting.sightingTime)
              )}
            </span>
          </div>
        </div>
        {isOwner && (
          <div className="mr-8"> {/* mr-8 to avoid overlap with close button which is absolute */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  Delete Sighting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmationDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              title="Delete Sighting"
              description="Are you sure you want to delete this sighting? This action cannot be undone."
              confirmText="Delete"
              variant="destructive"
              onConfirm={handleDelete}
              isLoading={isDeleting}
            />
          </div>
        )}
      </div>

      {/* Media / Photos */}
      {isLoading ? (
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
          <Spinner className="size-8" />
        </div>
      ) : sightingPhotos && sightingPhotos.length > 0 ? (
        <div>
          {sightingPhotos.length === 1 ? (
            <Img
              src={getSightingFullImageUrl(sightingPhotos[0].url)}
              loader={
                <div className="w-full h-[500px] flex items-center justify-center bg-muted">
                  <Spinner className="size-8" />
                </div>
              }
              unloader={
                <Img
                  src={getPlaceholderImage(
                    sightingPhotos[0].url,
                    selectedSighting.species === 'cat' ? 'cats' : 'dogs'
                  )}
                  alt={`${selectedSighting.species} sighting photo`}
                  className="w-full h-[500px] object-cover"
                />
              }
              alt={`${selectedSighting.species} sighting photo`}
              className="w-full h-[500px] object-cover"
            />
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {sightingPhotos.map((photo, index) => (
                  <CarouselItem key={photo.id}>
                    <Img
                      src={getSightingFullImageUrl(photo.url)}
                      loader={
                        <div className="w-full h-[500px] flex items-center justify-center bg-muted">
                          <Spinner className="size-8" />
                        </div>
                      }
                      unloader={
                        <Img
                          src={getPlaceholderImage(
                            photo.url,
                            selectedSighting.species === 'cat'
                              ? 'cats'
                              : 'dogs'
                          )}
                          alt={`${selectedSighting.species} sighting photo ${index + 1}`}
                          className="w-full h-[500px] object-cover"
                        />
                      }
                      alt={`${selectedSighting.species} sighting photo ${index + 1}`}
                      className="w-full h-[500px] object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {sightingPhotos.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                  <CarouselDots />
                </>
              )}
            </Carousel>
          )}
        </div>
      ) : (
        <Img
          src={getPlaceholderImage(
            '',
            selectedSighting.species === 'cat' ? 'cats' : 'dogs'
          )}
          alt={`${selectedSighting.species} sighting photo`}
          className="w-full h-[500px] object-cover"
        />
      )}
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            {selectedSighting.name && (
              <CardTitle className="text-2xl font-bold">
                {selectedSighting.name}
              </CardTitle>
            )}
          </div>

          <div className="flex gap-2 flex-wrap pb-2">
            {selectedSighting.status && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary">
                {selectedSighting.status}
              </Badge>
            )}
            {selectedSighting.size && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary">
                {selectedSighting.size}
              </Badge>
            )}
            {selectedSighting.age && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                {selectedSighting.age}
              </Badge>
            )}
            {selectedSighting.breed && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                {selectedSighting.breed}
              </Badge>
            )}
            {selectedSighting.colors && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                {selectedSighting.colors}
              </Badge>
            )}
            {selectedSighting.markings && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                {selectedSighting.markings}
              </Badge>
            )}
          </div>

          {selectedSighting.sighting.description && (
            <div className="text-sm leading-relaxed text-muted-foreground italic border-l-2 border-primary/10 pl-4 py-1">
              &quot;{selectedSighting.sighting.description}&quot;
            </div>
          )}

          {(selectedSighting.healthNotes || selectedSighting.careRequirements) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              {selectedSighting.healthNotes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Health Notes
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedSighting.healthNotes}
                  </p>
                </div>
              )}
              {selectedSighting.careRequirements && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Care Requirements
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedSighting.careRequirements}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
