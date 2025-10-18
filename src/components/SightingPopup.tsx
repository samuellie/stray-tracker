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
          className="absolute top-2 left-2 h-8 w-8 rounded-full z-10"
          onClick={e => {
            e.stopPropagation()
            onClose()
          }}
          aria-label="Close popup"
        >
          <X />
        </Button>
        <CardHeader className="p-0">
          <Img
            src={getSightingThumbnailUrl(primaryPhoto.url)}
            loader={
              <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                <Spinner />
              </div>
            }
            unloader={
              <Img
                src={getPlaceholderImage(
                  primaryPhoto.url,
                  selectedSighting.species === 'cat' ? 'cats' : 'dogs'
                )}
                alt={`${selectedSighting.species} sighting photo`}
                className="w-full h-48 object-cover"
              />
            }
            alt={`${selectedSighting.species} sighting photo`}
            className="w-full h-48 object-cover"
          />
          <div className="px-3">
            <div className="flex-col items-center gap-3 mb-2">
              <CardTitle className="text-base font-semibold">
                {selectedSighting.name}
              </CardTitle>
              <div className="flex gap-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {selectedSighting.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedSighting.size}
                </Badge>
                {selectedSighting.age && (
                  <Badge variant="outline" className="text-xs">
                    {selectedSighting.age}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedSighting.sighting.user.image || ''} />
              <AvatarFallback>
                {selectedSighting.sighting.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {selectedSighting.sighting.user.name}
              </p>
              <p className="text-xs text-gray-500">
                Sighted{' '}
                {formatRelativeDate(
                  Number(selectedSighting.sighting.sightingTime)
                )}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600">Breed:</span>
              <span className="text-xs text-gray-800">
                {selectedSighting.breed || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600">Colors:</span>
              <span className="text-xs text-gray-800">
                {selectedSighting.colors || 'Unknown'}
              </span>
            </div>
            {selectedSighting.markings && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">
                  Markings:
                </span>
                <span className="text-xs text-gray-800">
                  {selectedSighting.markings}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Popup>
  )
}
