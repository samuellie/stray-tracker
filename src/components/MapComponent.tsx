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
  Popup,
} from 'react-map-gl/maplibre'
import { useNearbySightings } from '~/hooks/server/useNearbySightings'
import type { Sighting, Stray } from 'db/schema'

interface MapProps {
  className?: string
  defaultShowCurrentLocation?: boolean
  showUserLocation?: boolean
  markerPosition?: { lat: number; lng: number } | null
  onMarkerDragEnd?: (position: { lat: number; lng: number }) => void
  draggable?: boolean
  showNearbySightings?: boolean
}

export function MapComponent({
  className,
  defaultShowCurrentLocation = false,
  showUserLocation = true,
  markerPosition,
  onMarkerDragEnd,
  draggable = false,
  showNearbySightings = false,
}: MapProps) {
  const MapGeolocateControl = useRef<MaplibreGeolocateControl>(null)
  const MapContainer = useRef<MapRef>(null)
  const [marker, setMarker] = useState(markerPosition)
  const [currentUserPosition, setCurrentUserPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedSighting, setSelectedSighting] = useState<
    (Sighting & { stray: Stray }) | null
  >(null)

  useEffect(() => {
    setMarker(markerPosition)
  }, [markerPosition])

  const nearbySightingsQuery = useNearbySightings(
    showNearbySightings ? currentUserPosition?.lat : undefined,
    showNearbySightings ? currentUserPosition?.lng : undefined,
    5
  )

  const handleMarkerDragEnd = (event: {
    lngLat: { lat: number; lng: number }
  }) => {
    const newPos = { lat: event.lngLat.lat, lng: event.lngLat.lng }
    setMarker(newPos)
    onMarkerDragEnd?.(newPos)
  }

  const handleOnload = () => {
    if (MapGeolocateControl.current) {
      MapGeolocateControl.current.on(
        'geolocate',
        (e: { coords: { latitude: number; longitude: number } }) => {
          setCurrentUserPosition({
            lat: e.coords.latitude,
            lng: e.coords.longitude,
          })
        }
      )
      if (defaultShowCurrentLocation) {
        MapGeolocateControl.current.trigger()
      }
    }
  }

  return (
    <div
      className={`relative w-full h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}
    >
      <Map
        ref={MapContainer}
        interactive
        initialViewState={{
          latitude: markerPosition?.lat || 3.1072086999999984,
          longitude: markerPosition?.lng || 101.67908995767199,
          zoom: 16,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
        onLoad={handleOnload}
      >
        <NavigationControl position="top-left" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-left" />
        <GeolocateControl
          ref={MapGeolocateControl}
          position="bottom-left"
          showUserLocation={showUserLocation}
          // onGeolocate={} // when user location updates, update the current location too
          positionOptions={{ enableHighAccuracy: true }}
        />
        {marker && (
          <Marker
            longitude={marker.lng}
            latitude={marker.lat}
            draggable={draggable}
            onDragEnd={handleMarkerDragEnd}
          >
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
          </Marker>
        )}
        {nearbySightingsQuery?.data?.map(sighting => (
          <Marker
            key={sighting.id}
            longitude={sighting.lng}
            latitude={sighting.lat}
            onClick={() => setSelectedSighting(sighting)}
          >
            <div className="text-lg cursor-pointer">
              {sighting.stray.species === 'cat'
                ? '🐱'
                : sighting.stray.species === 'dog'
                  ? '🐶'
                  : '🐾'}
            </div>
          </Marker>
        ))}
        {selectedSighting && (
          <Popup
            longitude={selectedSighting.lng}
            latitude={selectedSighting.lat}
            onClose={() => setSelectedSighting(null)}
            closeOnClick={false}
            className="max-w-sm"
          >
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">
                {selectedSighting.stray.species.charAt(0).toUpperCase() +
                  selectedSighting.stray.species.slice(1)}{' '}
                Details
              </h3>
              <div className="space-y-1 text-sm">
                {selectedSighting.stray.name && (
                  <p>
                    <strong>Name:</strong> {selectedSighting.stray.name}
                  </p>
                )}
                <p>
                  <strong>Breed:</strong>{' '}
                  {selectedSighting.stray.breed || 'Unknown'}
                </p>
                <p>
                  <strong>Age:</strong>{' '}
                  {selectedSighting.stray.age || 'Unknown'}
                </p>
                <p>
                  <strong>Size:</strong> {selectedSighting.stray.size}
                </p>
                <p>
                  <strong>Colors:</strong>{' '}
                  {selectedSighting.stray.colors || 'Unknown'}
                </p>
                <p>
                  <strong>Markings:</strong>{' '}
                  {selectedSighting.stray.markings || 'None'}
                </p>
                <p>
                  <strong>Status:</strong> {selectedSighting.stray.status}
                </p>
                {selectedSighting.stray.description && (
                  <p>
                    <strong>Description:</strong>{' '}
                    {selectedSighting.stray.description}
                  </p>
                )}
                {selectedSighting.stray.healthNotes && (
                  <p>
                    <strong>Health Notes:</strong>{' '}
                    {selectedSighting.stray.healthNotes}
                  </p>
                )}
                {selectedSighting.stray.careRequirements && (
                  <p>
                    <strong>Care Requirements:</strong>{' '}
                    {selectedSighting.stray.careRequirements}
                  </p>
                )}
              </div>
              <hr className="my-3" />
              <h4 className="font-semibold mb-2">Sighting Details</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Sighting Time:</strong>{' '}
                  {new Date(
                    Number(selectedSighting.sightingTime) * 1000
                  ).toLocaleString()}
                </p>
                {selectedSighting.description && (
                  <p>
                    <strong>Description:</strong> {selectedSighting.description}
                  </p>
                )}
                {selectedSighting.weatherCondition && (
                  <p>
                    <strong>Weather:</strong>{' '}
                    {selectedSighting.weatherCondition}
                  </p>
                )}
                {selectedSighting.confidence && (
                  <p>
                    <strong>Confidence:</strong> {selectedSighting.confidence}
                    /10
                  </p>
                )}
                {selectedSighting.notes && (
                  <p>
                    <strong>Notes:</strong> {selectedSighting.notes}
                  </p>
                )}
                {selectedSighting.location && (
                  <p>
                    <strong>Location:</strong>{' '}
                    {[
                      selectedSighting.location.address1,
                      selectedSighting.location.address2,
                      selectedSighting.location.city,
                      selectedSighting.location.postcode,
                      selectedSighting.location.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                <p>
                  <strong>Reported:</strong>{' '}
                  {new Date(
                    Number(selectedSighting.createdAt) * 1000
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
