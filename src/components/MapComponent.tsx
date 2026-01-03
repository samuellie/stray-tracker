import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeolocateControl as MaplibreGeolocateControl } from 'maplibre-gl'
import { useEffect, useRef, useState, useMemo } from 'react'
import Map, {
  NavigationControl,
  GeolocateControl,
  MapRef,
  Marker,
  Source,
  Layer,
} from 'react-map-gl/maplibre'
import { useNearbyStrays } from '~/hooks/server/useNearbyStrays'
import type { Sighting, SightingPhoto, Stray } from 'db/schema'
import { SightingPopup } from './SightingPopup'
import { useIsMobile } from '~/hooks/use-mobile'
import { User } from 'better-auth'
import { useDebounce } from '~/hooks/use-debounce'
import { Loader2 } from 'lucide-react'
import { createGeoJSONCircle, calculateDistanceInKm } from '~/lib/utils'
import { LOADING_PUNS } from '~/lib/constants'
import { useMapPulseAnimation } from '~/hooks/use-map-pulse-animation'

interface MapProps {
  className?: string
  defaultShowCurrentLocation?: boolean
  showUserLocation?: boolean
  positionInput?: boolean
  onMarkerDragEnd?: (position: { lat: number; lng: number }) => void
  draggable?: boolean
  showNearbySightings?: boolean
  currentUserPosition?: { lat: number; lng: number } | null
  initialMarkerPosition?: { lat: number; lng: number } | null
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
  onMapStateChange?: (state: {
    lat: number
    lng: number
    radius: number
  }) => void
  mapState?: { lat: number; lng: number; radius: number } | null
  onOpenSightingDialog?: (
    sighting: Stray & {
      sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
    }
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
  onMapStateChange,
  mapState,
  onOpenSightingDialog,
  initialMarkerPosition,
}: MapProps) {
  const isMobile = useIsMobile()
  const MapGeolocateControl = useRef<MaplibreGeolocateControl>(null)
  const MapContainer = useRef<MapRef>(null)
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialMarkerPosition ?? null
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


  const [viewState, setViewState] = useState({
    latitude: initialMarkerPosition?.lat ?? 3.1072086999999984,
    longitude: initialMarkerPosition?.lng ?? 101.67908995767199,
    zoom: 16,
  })

  const debouncedViewState = useDebounce(viewState, 500)

  useEffect(() => {
    if (onMapStateChange) {
      // Calculate radius based on zoom level
      // Approximate visible radius in km: 25000 / 2^zoom
      const radius = 25000 / Math.pow(2, debouncedViewState.zoom)
      onMapStateChange({
        lat: debouncedViewState.latitude,
        lng: debouncedViewState.longitude,
        radius,
      })
    }
  }, [debouncedViewState, onMapStateChange])

  // Optimize nearby strays fetching
  // Only update the fetching parameters if:
  // 1. Initial load
  // 2. Distance moved > 0.5km
  // 3. Zoom level changed significantly (implying radius change)
  const [fetchParams, setFetchParams] = useState<{
    lat: number
    lng: number
    radius: number
  } | null>(null)

  useEffect(() => {
    if (!showNearbySightings) return

    const currentLat = mapState?.lat ?? debouncedViewState.latitude
    const currentLng = mapState?.lng ?? debouncedViewState.longitude
    const currentRadius =
      mapState?.radius ?? 25000 / Math.pow(2, debouncedViewState.zoom)

    // Initial fetch
    if (!fetchParams) {
      setFetchParams({
        lat: currentLat,
        lng: currentLng,
        radius: currentRadius,
      })
      return
    }

    // Check distance
    const dist = calculateDistanceInKm(
      currentLat,
      currentLng,
      fetchParams.lat,
      fetchParams.lng
    )

    // Check radius change (zoom)
    // If radius changed by more than 10%, strictly update
    const radiusRatio = Math.abs(currentRadius - fetchParams.radius) / fetchParams.radius

    if (dist > 0.5 || radiusRatio > 0.1) {
      setFetchParams({
        lat: currentLat,
        lng: currentLng,
        radius: currentRadius,
      })
    }
  }, [debouncedViewState, mapState, showNearbySightings, fetchParams])

  const { data, isLoading } = useNearbyStrays(
    showNearbySightings ? fetchParams?.lat : undefined,
    showNearbySightings ? fetchParams?.lng : undefined,
    fetchParams?.radius
  )

  // Delayed loading state for smoother animation
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
    } else {
      const timer = setTimeout(() => setShowLoading(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

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

  const loadingMessage = useMemo(() => {
    if (!showLoading) return ''
    return LOADING_PUNS[Math.floor(Math.random() * LOADING_PUNS.length)]
  }, [showLoading])

  const radiusCircle = useMemo(() => {
    const center = {
      lat: mapState?.lat ?? debouncedViewState.latitude,
      lng: mapState?.lng ?? debouncedViewState.longitude,
    }
    const radius =
      mapState?.radius ?? 25000 / Math.pow(2, debouncedViewState.zoom)
    return createGeoJSONCircle(center, radius)
  }, [mapState, debouncedViewState])

  // Pulse animation for query circle
  useMapPulseAnimation({
    mapRef: MapContainer,
    showLoading,
    center: {
      lat: mapState?.lat ?? debouncedViewState.latitude,
      lng: mapState?.lng ?? debouncedViewState.longitude,
    },
    radius: mapState?.radius ?? 25000 / Math.pow(2, debouncedViewState.zoom),
    zoom: debouncedViewState.zoom,
  })

  return (
    <div
      className={`relative w-full h-full bg-muted rounded-lg overflow-hidden ${className}`}
    >
      <Map
        ref={MapContainer}
        interactive
        initialViewState={{
          latitude: initialMarkerPosition?.lat ?? 3.1072086999999984,
          longitude: initialMarkerPosition?.lng ?? 101.67908995767199,
          zoom: 16,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
        onLoad={handleOnload}
        onClick={handleMapClick}
        onMove={evt => setViewState(evt.viewState)}
      >
        {showLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-gray-200">
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            <span className="text-xs font-medium text-gray-600">
              {loadingMessage}
            </span>
          </div>
        )}

        {/* query circle */}
        <Source id="radius-source" type="geojson" data={radiusCircle}>
          <Layer
            id="radius-layer"
            type="fill"
            paint={{
              'fill-color': '#3b82f6',
              'fill-opacity': 0, // Start hidden
            }}
          />

        </Source>
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
            if (effectiveSelectedSighting) {
              onOpenSightingDialog?.(effectiveSelectedSighting)
            }
            handleSelectSighting(null)
          }}
        />
      </Map>
    </div>
  )
}
