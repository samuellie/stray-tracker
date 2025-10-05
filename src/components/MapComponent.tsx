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

interface MapProps {
  className?: string
  defaultShowCurrentLocation?: boolean
  defaultMarkerUseCurrentLocation?: boolean
  showUserLocation?: boolean
  markerPosition?: { lat: number; lng: number } | null
  onMarkerDragEnd?: (position: { lat: number; lng: number }) => void
  draggable?: boolean
}

export function MapComponent({
  className,
  defaultShowCurrentLocation = false,
  defaultMarkerUseCurrentLocation = false,
  showUserLocation = true,
  markerPosition,
  onMarkerDragEnd,
  draggable = false,
}: MapProps) {
  const MapGeolocateControl = useRef<MaplibreGeolocateControl>(null)
  const MapContainer = useRef<MapRef>(null)
  const [marker, setMarker] = useState(markerPosition)

  useEffect(() => {
    setMarker(markerPosition)
  }, [markerPosition])

  const handleMarkerDragEnd = (event: any) => {
    const newPos = { lat: event.lngLat.lat, lng: event.lngLat.lng }
    setMarker(newPos)
    onMarkerDragEnd?.(newPos)
  }

  const handleOnload = () => {
    if (defaultShowCurrentLocation && MapGeolocateControl.current) {
      MapGeolocateControl.current.trigger()
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
      </Map>
    </div>
  )
}
