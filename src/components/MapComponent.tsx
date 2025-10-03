import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeolocateControl as MaplibreGeolocateControl } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from 'react-map-gl/maplibre'

interface MapProps {
  className?: string
  defaultShowCurrentLocation?: boolean
}

export function MapComponent({
  className,
  defaultShowCurrentLocation = false,
}: MapProps) {
  const MapGeolocateControl = useRef<MaplibreGeolocateControl | null>(null)
  useEffect(() => {
    if (defaultShowCurrentLocation && MapGeolocateControl.current) {
      MapGeolocateControl.current.trigger()
    }
  }, [defaultShowCurrentLocation, MapGeolocateControl.current])

  return (
    <div
      className={`relative w-full h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}
    >
      <Map
        interactive
        initialViewState={{
          latitude: 3.1072086999999984,
          longitude: 101.67908995767199,
          zoom: 16,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
      >
        <NavigationControl position="top-left" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-left" />
        <GeolocateControl
          ref={MapGeolocateControl}
          position="bottom-left"
          positionOptions={{ enableHighAccuracy: true }}
        />
      </Map>
    </div>
  )
}
