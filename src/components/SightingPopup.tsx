import { Popup } from 'react-map-gl/maplibre'
import { SightingPhoto, type Sighting, type Stray } from 'db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import { formatRelativeDate } from '~/utils/date'
import { getThumbnailKey } from '~/utils/files'
import { Expand, X } from 'lucide-react'

interface SightingPopupProps {
  selectedSighting:
    | (Stray & { sighting: Sighting & { sightingPhotos: SightingPhoto[] } })
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
      closeOnClick={false}
      className="max-w-2xl m-0"
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
          {primaryPhoto && (
            <div>
              <img
                src={`/api/files/animal-photos/${getThumbnailKey(primaryPhoto.url)}`}
                alt={`${selectedSighting.species} sighting photo`}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </div>
          )}
          <div className="p-3 pb-2">
            <div className="flex items-center gap-3 mb-2">
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
        <CardContent className="px-3 pb-3">
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

          {(selectedSighting.description ||
            selectedSighting.healthNotes ||
            selectedSighting.careRequirements) && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                {selectedSighting.description && (
                  <div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {selectedSighting.description}
                    </p>
                  </div>
                )}
                {selectedSighting.healthNotes && (
                  <div>
                    <span className="text-xs font-medium text-gray-600">
                      Health Notes:
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed mt-1">
                      {selectedSighting.healthNotes}
                    </p>
                  </div>
                )}
                {selectedSighting.careRequirements && (
                  <div>
                    <span className="text-xs font-medium text-gray-600">
                      Care Requirements:
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed mt-1">
                      {selectedSighting.careRequirements}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {formatRelativeDate(
                Number(selectedSighting.sighting.sightingTime)
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </Popup>
  )
}
