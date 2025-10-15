import { SightingPhoto, type Sighting, type Stray } from 'db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
import { getKey } from '~/utils/files'
import { User } from 'better-auth'

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
  console.log(selectedSighting)

  if (!selectedSighting) return null
  selectedSighting.sighting.user
  const { data: sightingPhotos, isLoading } = useFindSightingPhotos(
    selectedSighting.sighting.id
  )
  return (
    <Card className="border-0 max-w-2xl w-full overflow-hidden">
      <CardHeader className="p-0">
        {isLoading ? (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : sightingPhotos && sightingPhotos.length > 0 ? (
          <div>
            {sightingPhotos.length === 1 ? (
              <img
                src={`/api/files/animal-photos/${getKey(sightingPhotos[0].url)}`}
                alt={`${selectedSighting.species} sighting photo`}
                className="w-full h-96 object-cover"
              />
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {sightingPhotos.map((photo, index) => (
                    <CarouselItem key={photo.id}>
                      <img
                        src={`/api/files/animal-photos/${getKey(photo.url)}`}
                        alt={`${selectedSighting.species} sighting photo ${index + 1}`}
                        className="w-full h-96 object-cover "
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
        ) : null}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <CardTitle className="text-lg font-semibold">
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
      <CardContent className="px-4 pb-4">
        {/* Instagram-style post header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-8 h-8  bg-gray-300 flex items-center justify-center overflow-hidden">
            {selectedSighting.sighting.user.image ? (
              <img
                src={selectedSighting.sighting.user.image}
                alt={`${selectedSighting.sighting.user.name} avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {selectedSighting.sighting.user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
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

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Breed:</span>
            <span className="text-sm text-gray-800">
              {selectedSighting.breed || 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Colors:</span>
            <span className="text-sm text-gray-800">
              {selectedSighting.colors || 'Unknown'}
            </span>
          </div>
          {selectedSighting.markings && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Markings:
              </span>
              <span className="text-sm text-gray-800">
                {selectedSighting.markings}
              </span>
            </div>
          )}
        </div>

        {(selectedSighting.description ||
          selectedSighting.healthNotes ||
          selectedSighting.careRequirements) && (
          <>
            <Separator className="my-3" />
            <div className="space-y-3">
              {selectedSighting.description && (
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedSighting.description}
                  </p>
                </div>
              )}
              {selectedSighting.healthNotes && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Health Notes:
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed mt-1">
                    {selectedSighting.healthNotes}
                  </p>
                </div>
              )}
              {selectedSighting.careRequirements && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Care Requirements:
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed mt-1">
                    {selectedSighting.careRequirements}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
