import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, PanInfo } from 'motion/react'
import { useInfiniteNearbyStrays } from '~/hooks/server/useNearbyStrays'
import { useIsMobile } from '~/hooks/use-mobile'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Loader2, MapPin, Plus } from 'lucide-react'
import type { Stray, Sighting, SightingPhoto } from 'db/schema'
import type { User } from 'better-auth'

interface StrayListProps {
  currentUserPosition: { lat: number; lng: number } | null
  isExpanded?: boolean
  onToggleExpand?: (expanded: boolean) => void
  onStrayClick?: (
    stray: Stray & {
      sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
    }
  ) => void
  onAddSighting?: () => void
}

export function StrayList({
  currentUserPosition,
  isExpanded: isExpandedProp,
  onToggleExpand,
  onStrayClick,
  onAddSighting,
}: StrayListProps) {
  const isMobile = useIsMobile()
  const [internalIsExpanded, setInternalIsExpanded] = useState(false)
  const isExpanded =
    isExpandedProp !== undefined ? isExpandedProp : internalIsExpanded
  const handleToggleExpand = (expanded: boolean) => {
    if (onToggleExpand) {
      onToggleExpand(expanded)
    } else {
      setInternalIsExpanded(expanded)
    }
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteNearbyStrays(
    currentUserPosition?.lat,
    currentUserPosition?.lng,
    5 // 5km radius
  )

  const strays = data?.pages.flatMap(page => page) || []

  // Intersection Observer for infinite scroll
  const observerTarget = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.5 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Calculate distance for display
  const getDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
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

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  // Animation variants
  const variants = {
    expanded: { y: 0, height: '100dvh', borderRadius: '0px' },
    collapsed: {
      y: 0,
      height: isMobile ? '180px' : '200px',
      borderRadius: '24px 24px 0 0',
    },
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y < -50) {
      handleToggleExpand(true)
    } else if (info.offset.y > 50) {
      handleToggleExpand(false)
    }
  }

  if (!currentUserPosition) return null

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-20 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 flex flex-col"
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={variants}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle */}
      <div
        className="w-full flex justify-center pt-3 pb-1 cursor-pointer shrink-0"
        onClick={() => handleToggleExpand(!isExpanded)}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Header */}
      <div
        className="px-6 pb-2 flex justify-between items-center bg-white shrink-0"
        onClick={() => handleToggleExpand(!isExpanded)}
      >
        <h2 className="text-lg font-semibold text-gray-800">Nearby Strays</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">{strays.length} found</div>

        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : strays.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No strays found nearby.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {strays.map(stray => (
              <div
                key={stray.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                onClick={() =>
                  onStrayClick?.({ ...stray, sighting: stray.sightings[0] })
                }
              >
                <Avatar className="h-16 w-16 rounded-lg border-2 border-white shadow-sm">
                  <AvatarImage
                    src={stray.sightings[0]?.sightingPhotos[0]?.url}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg text-2xl">
                    {stray.species === 'cat' ? '🐱' : '🐶'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 truncate">
                      {stray.name || 'Unknown Stray'}
                    </h3>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {stray.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {stray.species} • {stray.colors}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                    <MapPin className="h-3 w-3" />
                    {getDistance(
                      currentUserPosition.lat,
                      currentUserPosition.lng,
                      stray.sightings[0].lat,
                      stray.sightings[0].lng
                    )}
                    {' away'}
                  </div>
                </div>
              </div>
            ))}

            {/* Infinite Scroll Loader */}
            <div ref={observerTarget} className="py-4 flex justify-center">
              {isFetchingNextPage && (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              )}
            </div>
            {/* Spacer for bottom safe area if needed */}
            <div className="h-8" />
          </div>
        )}
      </div>

      {/* Floating Action Button (only when expanded) */}
      {isExpanded && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            onClick={e => {
              e.stopPropagation()
              onAddSighting?.()
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </motion.div>
  )
}
