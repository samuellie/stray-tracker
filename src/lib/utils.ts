import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the base name of a file without its extension.
 *
 * @param fileName - The full file name including extension.
 * @returns The file name without the extension.
 */
export function getBaseFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}

export const createGeoJSONCircle = (
  center: { lat: number; lng: number },
  radiusInKm: number,
  points = 64
) => {
  const coords = {
    latitude: center.lat,
    longitude: center.lng,
  }

  const km = radiusInKm

  const ret = []
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180))
  const distanceY = km / 110.574

  let theta, x, y
  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI)
    x = distanceX * Math.cos(theta)
    y = distanceY * Math.sin(theta)

    ret.push([coords.longitude + x, coords.latitude + y])
  }
  ret.push(ret[0])

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ret],
    },
    properties: {},
  } as GeoJSON.GeoJSON
}

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}
