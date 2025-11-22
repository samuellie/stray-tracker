import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeolocateControl as MaplibreGeolocateControl } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  MapRef,
  Marker,
} from 'react-map-gl/maplibre'
import { useNearbyStrays } from '~/hooks/server/useNearbyStrays'
import type { Sighting, SightingPhoto, Stray } from 'db/schema'
import { SightingPopup } from './SightingPopup'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { SightingDialog } from './dialogs/SightingDialog'
import { useIsMobile } from '~/hooks/use-mobile'
import { User } from 'better-auth'

interface MapProps {
  className?: string
  defaultShowCurrentLocation?: boolean
  showUserLocation?: boolean
  positionInput?: boolean
  onMarkerDragEnd?: (position: { lat: number; lng: number }) => void
  draggable?: boolean
  showNearbySightings?: boolean
  currentUserPosition?: { lat: number; lng: number } | null
  onUserPositionChange?: (position: { lat: number; lng: number }) => void
  selectedSighting?: (Stray & {
    sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
  }) | null
  onSelectSighting?: (
    sighting:
      | (Stray & {
          sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
        })
      | null
  ) => void
}

export function MapComponent({
  className,
  defaultShowCurrentLocation = false,
  showUserLocation = true,
  positionInput = false,
  onMarkerDragEnd,
  draggable = false,
  showNearbySightings = false,
  currentUserPosition,
  onUserPositionChange,
  selectedSighting,
  onSelectSighting,
}: MapProps) {
  const isMobile = useIsMobile()
  const MapGeolocateControl = useRef<MaplibreGeolocateControl>(null)
  const MapContainer = useRef<MapRef>(null)
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null
  )
  
  const [internalUserPosition, setInternalUserPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const effectiveUserPosition = currentUserPosition !== undefined ? currentUserPosition : internalUserPosition

  // Internal state for selected sighting if not controlled
  const [internalSelectedSighting, setInternalSelectedSighting] = useState<
    | (Stray & {
        sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
      })
    | null
  >(null)

  const effectiveSelectedSighting = selectedSighting !== undefined ? selectedSighting : internalSelectedSighting
  const handleSelectSighting = onSelectSighting || setInternalSelectedSighting

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSightingForDialog, setSelectedSightingForDialog] = useState<
    | (Stray & {
        sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
      })
    | null
  >(null)

  const { data } = useNearbyStrays(
    showNearbySightings ? effectiveUserPosition?.lat : undefined,
    showNearbySightings ? effectiveUserPosition?.lng : undefined,
    5
  )

  // Fly to selected sighting when it changes
  useEffect(() => {
    if (effectiveSelectedSighting && MapContainer.current) {
      const { lat, lng } = effectiveSelectedSighting.sighting
       // Offset the center slightly north (higher latitude) so marker appears below center
       const offsetLat = lat + 0.001 // Approximately 50 meters north at equator
       MapContainer.current.flyTo({
         center: [lng, offsetLat],
         zoom: 16,
       })
    }
  }, [effectiveSelectedSighting])

  const handleMarkerDragEnd = (event: {
    lngLat: { lat: number; lng: number }
  }) => {
    const newPos = { lat: event.lngLat.lat, lng: event.lngLat.lng }
    onMarkerDragEnd?.(newPos)
    setMarker(newPos)
  }

  const handleMapClick = (event: { lngLat: { lat: number; lng: number } }) => {
    if (positionInput) {
      const newPos = { lat: event.lngLat.lat, lng: event.lngLat.lng }
      setMarker(newPos)
      onMarkerDragEnd?.(newPos)
    }
  }

  const handleOnload = () => {
    if (MapGeolocateControl.current) {
      MapGeolocateControl.current.on(
        'geolocate',
        (e: { coords: { latitude: number; longitude: number } }) => {
          const newPos = {
            lat: e.coords.latitude,
            lng: e.coords.longitude,
          }
          if (onUserPositionChange) {
            onUserPositionChange(newPos)
          } else {
            setInternalUserPosition(newPos)
          }
          setMarker(newPos)
        }
      )
      if (defaultShowCurrentLocation) {
        MapGeolocateControl.current.trigger()
      }
    }
  }

  return (
    <div
      className={`relative w-full h-full bg-muted rounded-lg overflow-hidden ${className}`}
    >
      <Map
        ref={MapContainer}
        interactive
        initialViewState={{
          latitude: 3.1072086999999984,
          longitude: 101.67908995767199,
          zoom: 16,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
        onLoad={handleOnload}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" />
        {showUserLocation && (
          <GeolocateControl
            ref={MapGeolocateControl}
            position="top-left"
            showUserLocation={!positionInput}
            trackUserLocation={!positionInput}
            positionOptions={{ enableHighAccuracy: true }}
          />
        )}
        {positionInput && (
          <Marker
            latitude={marker?.lat || 3.1072086999999984}
            longitude={marker?.lng || 101.67908995767199}
            draggable
            onDragEnd={handleMarkerDragEnd}
          >
            <img
              src="/icons/location-pin.svg"
              alt="Location pin"
              className="w-8 h-8"
            />
          </Marker>
        )}
        {data?.map(stray => (
          <Marker
            key={stray.id}
            longitude={stray.sightings[0].lng}
            latitude={stray.sightings[0].lat}
            onClick={e => {
              e.originalEvent.stopPropagation()
              handleSelectSighting({
                ...stray,
                sighting: stray.sightings[0],
              })
            }}
          >
            <div className="text-lg cursor-pointer">
              {stray.species === 'cat'
                ? '🐱'
                : stray.species === 'dog'
                  ? '🐶'
                  : '🐾'}
            </div>
          </Marker>
        ))}
        <SightingPopup
          selectedSighting={effectiveSelectedSighting}
          onClose={() => handleSelectSighting(null)}
          onOpenDialog={() => {
            setSelectedSightingForDialog(effectiveSelectedSighting)
            setDialogOpen(true)
            handleSelectSighting(null)
          }}
        />
      </Map>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={`p-0 ${isMobile ? 'w-full h-full' : 'max-w-2xl'}`}
        >
          <SightingDialog
            selectedSighting={selectedSightingForDialog}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
