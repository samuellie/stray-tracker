import { useState } from 'react'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { useNearbyStrays } from '~/hooks/server/useNearbyStrays'
import { type Stray } from 'db/schema'
import { Img } from 'react-image'
import { Spinner } from '~/components/ui/spinner'
import { getSightingThumbnailUrl } from '~/utils/files'
import { getPlaceholderImage } from '~/utils/strayImageFallbacks'
import { calculateDistance } from '~/utils/distance'
import { formatRelativeDate } from '~/utils/date'

interface AnimalTypeStepProps {
  reportingNewAnimal: boolean
  onReportingNewAnimalChange: (checked: boolean) => void
  strayId?: number
  onStrayIdChange: (value: number | undefined) => void
  species?: 'cat' | 'dog' | 'other'
  onSpeciesChange: (value: 'cat' | 'dog' | 'other') => void
  animalSize?: 'small' | 'medium' | 'large'
  onAnimalSizeChange: (value: 'small' | 'medium' | 'large') => void
  strayIdError?: string
  speciesError?: string
  animalSizeError?: string
  latitude?: number
  longitude?: number
}

export function AnimalTypeStep({
  reportingNewAnimal,
  onReportingNewAnimalChange,
  strayId,
  onStrayIdChange,
  species,
  onSpeciesChange,
  animalSize,
  onAnimalSizeChange,
  strayIdError,
  speciesError,
  animalSizeError,
  latitude,
  longitude,
}: AnimalTypeStepProps) {
  const [selectedStray, setSelectedStray] = useState<Stray | null>(null)

  const { data: nearbyStrays, isLoading: isLoadingStrays } = useNearbyStrays(
    latitude,
    longitude,
    5 // 5km radius
  )
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Stray Information</h2>
        <p className="text-sm text-muted-foreground">
          Specify whether this is a new stray or an existing one.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reporting-new-animal"
            checked={reportingNewAnimal}
            onCheckedChange={checked =>
              onReportingNewAnimalChange(checked === true)
            }
          />
          <Label htmlFor="reporting-new-animal">
            I'm reporting a new stray
          </Label>
        </div>

        {reportingNewAnimal ? (
          <div className="space-y-4">
            <Label>Create new stray</Label>
            {/* Species Selection */}
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Select
                value={species}
                onValueChange={value =>
                  onSpeciesChange(value as 'cat' | 'dog' | 'other')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {speciesError && (
                <p className="text-sm text-red-600">{speciesError}</p>
              )}
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <Label htmlFor="animalSize">Size *</Label>
              <Select
                value={animalSize}
                onValueChange={value =>
                  onAnimalSizeChange(value as 'small' | 'medium' | 'large')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
              {animalSizeError && (
                <p className="text-sm text-red-600">{animalSizeError}</p>
              )}
            </div>
          </div>
        ) : (
          /* Stray Selection */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select from nearby strays</Label>
              {isLoadingStrays ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner className="w-4 h-4 mr-2" />
                  <p className="text-sm text-muted-foreground">
                    Loading nearby strays...
                  </p>
                </div>
              ) : nearbyStrays && nearbyStrays.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-full overflow-y-auto p-2">
                  {nearbyStrays.map(stray => {
                    const latestSighting = stray.sightings?.[0]
                    const distance =
                      latestSighting && latitude && longitude
                        ? calculateDistance(
                            latitude,
                            longitude,
                            latestSighting.lat,
                            latestSighting.lng
                          )
                        : null

                    return (
                      <Card
                        key={stray.id}
                        className={`h-48 cursor-pointer transition-colors relative overflow-hidden ${
                          selectedStray?.id === stray.id
                            ? 'ring-4 ring-primary'
                            : 'hover:ring-2 hover:ring-muted-foreground/20'
                        }`}
                        onClick={() => {
                          setSelectedStray(stray)
                          onStrayIdChange(stray.id)
                        }}
                      >
                        <CardContent className="p-0 aspect-square relative">
                          <Img
                            src={getSightingThumbnailUrl(
                              stray.sightings?.[0]?.sightingPhotos?.[0]?.url
                            )}
                            loader={
                              <div className="w-full h-48 bg-muted flex items-center justify-center">
                                <Spinner className="w-6 h-6" />
                              </div>
                            }
                            unloader={
                              <Img
                                src={getPlaceholderImage(
                                  stray.sightings?.[0]?.sightingPhotos?.[0]
                                    ?.url,
                                  stray.species === 'cat' ? 'cats' : 'dogs'
                                )}
                                alt={`${stray.species} photo`}
                                className="w-full h-48 object-cover"
                              />
                            }
                            alt={`${stray.species} photo`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 flex-col gap-2">
                            {stray.name && (
                              <div className="text-white">{stray.name}</div>
                            )}
                            <div className="flex gap-1 justify-between">
                              {distance !== null && (
                                <div className="text-xs text-white">
                                  {(distance * 1000).toFixed(0)} m
                                </div>
                              )}
                              {latestSighting && (
                                <div className="text-xs text-white">
                                  {formatRelativeDate(
                                    latestSighting.sightingTime
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No nearby strays found. You can still enter a stray ID
                  manually below.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
