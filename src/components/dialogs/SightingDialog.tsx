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
import { ArrowLeft, MoreVertical, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useDeleteSighting } from '~/hooks/server/useDeleteSighting'
import { ConfirmationDialog } from './ConfirmationDialog'
import { useState, useRef, useEffect } from 'react'
import { useFindInfiniteStraySightings } from '~/hooks/server/useFindInfiniteStraySightings'
import { calculateDistance } from '~/utils/distance'

type SightingWithDetails = Stray & {
  sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
}

interface SightingDialogProps {
  selectedSighting: SightingWithDetails | null
  onClose: () => void
}

export function SightingDialog({
  selectedSighting: initialSighting,
  onClose,
}: SightingDialogProps) {
  const router = useRouter()
  const deleteSightingMutation = useDeleteSighting()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Stack to keep track of navigation history within the dialog
  const [sightingHistory, setSightingHistory] = useState<SightingWithDetails[]>([])

  // Current sighting to display is either the top of the stack or the initial prop
  const currentSighting = sightingHistory.length > 0
    ? sightingHistory[sightingHistory.length - 1]
    : initialSighting

  if (!currentSighting) return null

  const { data: session } = authClient.useSession()
  const isOwner = session?.user?.id === currentSighting.sighting.user.id

  const { data: sightingPhotos, isLoading } = useFindSightingPhotos(
    currentSighting.sighting.id
  )

  const handleBack = () => {
    setSightingHistory(prev => prev.slice(0, -1))
  }

  const handleSightingClick = (sighting: any) => {
    // Construct the SightingWithDetails object from the simple sighting data
    // Note: We might be missing some deep nested data like full user details if not returned by search
    // But for display purposes in the dialog, we map what we have.
    // Ideally, we should fetch the full sighting details, but we can reuse the type if the structure matches.

    // Check if the clicked sighting is already the current one (avoid duplicates)
    if (sighting.id === currentSighting.sighting.id) return;

    const newSighting: SightingWithDetails = {
      ...currentSighting, // Inherit stray details
      sighting: {
        ...sighting,
        user: sighting.user || currentSighting.sighting.user, // Fallback if user not in timeline data
        sightingPhotos: sighting.sightingPhotos || []
      }
    }
    setSightingHistory(prev => [...prev, newSighting])
  }

  const handleDelete = () => {
    setIsDeleting(true)
    deleteSightingMutation.mutate(currentSighting.sighting.id, {
      onSuccess: () => {
        setIsDeleting(false)
        setIsDeleteDialogOpen(false)
        if (sightingHistory.length > 0) {
          handleBack()
        } else {
          onClose()
        }
      },
      onError: () => {
        setIsDeleting(false)
        // You might want to show a toast here
      }
    })
  }

  return (
    <Card className="border-0 max-w-2xl w-full overflow-hidden relative group">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
          onClick={e => {
            e.stopPropagation()
            onClose()
          }}
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>


      {/* User Header - Instagram style */}
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-3">
          {sightingHistory.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2 mr-1 text-muted-foreground hover:text-foreground"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="w-10 h-10 ring-1 ring-primary/10">
            <AvatarImage src={currentSighting.sighting.user.image || ''} />
            <AvatarFallback className="text-sm bg-primary/5 text-primary">
              {currentSighting.sighting.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-none text-foreground">
              {currentSighting.sighting.user.name}
              {isOwner && ' (me)'}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-tight">
              {formatRelativeDate(
                Number(currentSighting.sighting.sightingTime)
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
                    currentSighting.species === 'cat' ? 'cats' : 'dogs'
                  )}
                  alt={`${currentSighting.species} sighting photo`}
                  className="w-full h-[500px] object-cover"
                />
              }
              alt={`${currentSighting.species} sighting photo`}
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
                            currentSighting.species === 'cat'
                              ? 'cats'
                              : 'dogs'
                          )}
                          alt={`${currentSighting.species} sighting photo ${index + 1}`}
                          className="w-full h-[500px] object-cover"
                        />
                      }
                      alt={`${currentSighting.species} sighting photo ${index + 1}`}
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
            currentSighting.species === 'cat' ? 'cats' : 'dogs'
          )}
          alt={`${currentSighting.species} sighting photo`}
          className="w-full h-[500px] object-cover"
        />
      )}
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            {currentSighting.name && (
              <CardTitle className="text-2xl font-bold">
                {currentSighting.name}
              </CardTitle>
            )}
          </div>

          <div className="flex gap-2 flex-wrap pb-2">
            {currentSighting.status && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary">
                {currentSighting.status}
              </Badge>
            )}
            {currentSighting.size && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary">
                {currentSighting.size}
              </Badge>
            )}
            {currentSighting.age && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                {currentSighting.age}
              </Badge>
            )}
            {currentSighting.breed && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                {currentSighting.breed}
              </Badge>
            )}
            {currentSighting.colors && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                {currentSighting.colors}
              </Badge>
            )}
            {currentSighting.markings && (
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                {currentSighting.markings}
              </Badge>
            )}
          </div>

          {currentSighting.sighting.description && (
            <div className="text-sm leading-relaxed text-muted-foreground italic border-l-2 border-primary/10 pl-4 py-1">
              &quot;{currentSighting.sighting.description}&quot;
            </div>
          )}

          {(currentSighting.healthNotes || currentSighting.careRequirements) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              {currentSighting.healthNotes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Health Notes
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {currentSighting.healthNotes}
                  </p>
                </div>
              )}
              {currentSighting.careRequirements && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Care Requirements
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {currentSighting.careRequirements}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {sightingHistory.length === 0 && (
          <SightingTimeline
            strayId={currentSighting.id}
            excludeSightingId={currentSighting.sighting.id}
            primaryLocation={currentSighting.sighting.lat && currentSighting.sighting.lng ? { lat: currentSighting.sighting.lat, lng: currentSighting.sighting.lng } : null}
            onSightingClick={handleSightingClick}
          />
        )}
      </CardContent>
    </Card>
  )
}

function SightingTimeline({
  strayId,
  excludeSightingId,
  primaryLocation,
  onSightingClick
}: {
  strayId: number,
  excludeSightingId: number,
  primaryLocation: { lat: number, lng: number } | null
  onSightingClick: (sighting: any) => void
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFindInfiniteStraySightings(strayId, excludeSightingId)
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  const sightings = data?.pages.flatMap((page: any) => page) || []

  if (sightings.length === 0) return null

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="text-sm font-semibold mb-4 text-foreground">Sighting History</h3>
      <div className="space-y-4">
        {sightings.map((sighting: any) => {
          const distance = primaryLocation
            ? calculateDistance(
              primaryLocation.lat,
              primaryLocation.lng,
              sighting.lat,
              sighting.lng
            )
            : null

          return (
            <div
              key={sighting.id}
              className="flex gap-3 items-start cursor-pointer hover:bg-gray-50 pt-2 rounded-lg transition-colors group"
              onClick={() => onSightingClick(sighting)}
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-gray-100">
                {sighting.sightingPhotos && sighting.sightingPhotos.length > 0 ? (
                  <Img
                    src={getSightingFullImageUrl(sighting.sightingPhotos[0].url)}
                    loader={<div className="w-full h-full bg-muted animate-pulse" />}
                    unloader={
                      <Img
                        src={getPlaceholderImage(
                          sighting.sightingPhotos[0].url,
                          sighting.stray?.species === 'cat' ? 'cats' : 'dogs'
                        )}
                        className="w-full h-full object-cover"
                      />
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 bg-muted">
                    <span className="text-xs">No img</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className="text-sm font-medium text-foreground">
                  {formatRelativeDate(Number(sighting.sightingTime))}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {distance !== null
                    ? `${distance.toFixed(2)} km from primary location`
                    : 'Distance unknown'
                  }
                </p>
              </div>
            </div>
          )
        })}
        <div ref={observerRef} className="h-4 w-full flex items-center justify-center">
          {isFetchingNextPage && <Spinner className="size-4 opacity-50" />}
        </div>
      </div>
    </div>
  )
}
