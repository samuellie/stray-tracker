import { Popup } from 'react-map-gl/maplibre'
import { SightingPhoto, type Sighting, type Stray } from 'db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { formatRelativeDate } from '~/utils/date'
import { getSightingThumbnailUrl } from '~/utils/files'
import { getPlaceholderImage } from '~/utils/strayImageFallbacks'
import { X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { User } from 'better-auth'
import { Img } from 'react-image'
import { Spinner } from '~/components/ui/spinner'

interface SightingPopupProps {
  selectedSighting:
  | (Stray & {
    sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
  })
  | null
  onClose: () => void
  onOpenDialog?: () => void
}

export function SightingPopup({
  selectedSighting,
  onClose,
  onOpenDialog,
}: SightingPopupProps) {
  if (!selectedSighting) return null

  const sightingPhotos = selectedSighting.sighting.sightingPhotos
  const primaryPhoto = sightingPhotos?.[0] // Use first photo as primary
  const imageSrc = primaryPhoto
    ? getSightingThumbnailUrl(primaryPhoto.url)
    : getPlaceholderImage(
      '',
      selectedSighting.species === 'cat' ? 'cats' : 'dogs'
    )

  return (
    <Popup
      longitude={selectedSighting.sighting.lng}
      latitude={selectedSighting.sighting.lat}
      onClose={onClose}
      closeOnClick
      className="custom-maplibregl-popup w-96"
      closeButton={false}
    >
      <Card
        className="border-0 shadow-lg overflow-hidden cursor-pointer"
        onClick={onOpenDialog}
      >
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
        </Button>        {/* User Header - Instagram style */}
        <div className="p-3 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 ring-1 ring-primary/10">
              <AvatarImage src={selectedSighting.sighting.user.image || ''} />
              <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                {selectedSighting.sighting.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none text-foreground">
                {selectedSighting.sighting.user.name}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-tight">
                {formatRelativeDate(
                  Number(selectedSighting.sighting.sightingTime)
                )}
              </span>
            </div>
          </div>
        </div>
        {/* Primary Image */}
        <div className="relative bg-muted aspect-[4/3] overflow-hidden group">
          <Img
            src={imageSrc}
            loader={
              <div className="w-full h-full flex items-center justify-center">
                <Spinner />
              </div>
            }
            unloader={
              primaryPhoto ? (
                <Img
                  src={getPlaceholderImage(
                    primaryPhoto.url,
                    selectedSighting.species === 'cat' ? 'cats' : 'dogs'
                  )}
                  alt={`${selectedSighting.species} sighting photo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Img
                  src={getPlaceholderImage(
                    '',
                    selectedSighting.species === 'cat' ? 'cats' : 'dogs'
                  )}
                  alt={`${selectedSighting.species} sighting photo`}
                  className="w-full h-full object-cover"
                />
              )
            }
            alt={`${selectedSighting.species} sighting photo`}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>

        <CardContent className="p-2 space-y-2">
          {/* Caption / Description */}
          {selectedSighting.sighting.description && (
            <div className="text-xs leading-relaxed line-clamp-2 text-muted-foreground italic">
              {selectedSighting.sighting.description}
            </div>
          )}

          {/* Stray Header & Badges */}
          <div className="space-y-2">
            {selectedSighting.name &&
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-bold truncate">
                  {selectedSighting.name}
                </CardTitle>
              </div>
            }
            <div className="flex gap-1.5 flex-wrap">
              {selectedSighting.size && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium border-primary/20 bg-primary/5 text-primary">
                  {selectedSighting.size}
                </Badge>
              )}
              {selectedSighting.species && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium border-primary/20 bg-primary/5 text-primary">
                  {selectedSighting.species}
                </Badge>
              )}
              {selectedSighting.age && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium">
                  {selectedSighting.age}
                </Badge>
              )}
              {selectedSighting.breed && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium">
                  {selectedSighting.breed}
                </Badge>
              )}
              {selectedSighting.colors && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium">
                  {selectedSighting.colors}
                </Badge>
              )}
              {selectedSighting.markings && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium">
                  {selectedSighting.markings}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Popup>
  )
}
