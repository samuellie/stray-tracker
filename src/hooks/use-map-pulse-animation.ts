import { useEffect, useRef } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { createGeoJSONCircle } from '~/lib/utils'
import maplibregl from 'maplibre-gl'

interface UseMapPulseAnimationProps {
    mapRef: React.RefObject<MapRef | null>
    showLoading: boolean
    center: { lat: number; lng: number }
    radius: number
    zoom: number
}

export function useMapPulseAnimation({
    mapRef,
    showLoading,
    center,
    radius,
    zoom,
}: UseMapPulseAnimationProps) {
    useEffect(() => {
        if (!mapRef.current) return

        let animationFrameId: number
        let startTime: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = timestamp - startTime

            // Calculate animated radius: expands from 0 to full radius over 2 seconds
            const duration = 2000
            const t = (progress % duration) / duration

            // Easing function for smoother expansion (optional, linear is fine too)
            const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x)
            const animatedRadius =
                (radius ?? 25000 / Math.pow(2, zoom)) * easeOutQuad(t)

            // Opacity fades out as it expands
            const opacity = 0.3 * (1 - t)

            const map = mapRef.current?.getMap()
            if (!map) return

            // Update GeoJSON data
            const source = map.getSource('radius-source') as maplibregl.GeoJSONSource
            if (source) {
                source.setData(createGeoJSONCircle(center, animatedRadius))
            }

            if (map.getLayer('radius-layer')) {
                map.setPaintProperty('radius-layer', 'fill-opacity', opacity)
            }

            if (showLoading) {
                animationFrameId = requestAnimationFrame(animate)
            } else {
                // Reset when not loading
                if (map.getLayer('radius-layer')) {
                    map.setPaintProperty('radius-layer', 'fill-opacity', 0)
                }
            }
        }

        if (showLoading) {
            animationFrameId = requestAnimationFrame(animate)
        } else {
            // Ensure hidden if not loading
            const map = mapRef.current?.getMap()
            if (map) {
                if (map.getLayer('radius-layer')) {
                    map.setPaintProperty('radius-layer', 'fill-opacity', 0)
                }
            }
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [showLoading, center.lat, center.lng, radius, zoom, mapRef])
}
