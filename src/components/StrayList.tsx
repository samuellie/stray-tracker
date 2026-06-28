import { useState, useEffect, useRef } from 'react'
import { motion, PanInfo, useDragControls } from 'motion/react'
import { useInfiniteNearbyStrays } from '~/hooks/server/useNearbyStrays'
import { useIsMobile } from '~/hooks/use-mobile'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Loader2, MapPin, PawPrint, Plus } from 'lucide-react'
import { getSightingThumbnailUrl } from '~/utils/files'
import { getPlaceholderImage } from '~/utils/strayImageFallbacks'
import { Img } from 'react-image'
import { Spinner } from '~/components/ui/spinner'
import type { SightingWithDetails } from '~/types/sighting'

interface StrayListProps {
  currentUserPosition: { lat: number; lng: number } | null
  mapState: { lat: number; lng: number; radius: number } | null
  isExpanded?: boolean
  onToggleExpand?: (expanded: boolean) => void
  onStrayClick?: (stray: SightingWithDetails) => void
  onAddSighting?: () => void
}

import { getDistance } from '~/lib/utils'

export function StrayList({
  currentUserPosition,
  mapState,
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteNearbyStrays(
      mapState?.lat,
      mapState?.lng,
      mapState?.radius ?? 1 // Default to 1km if not set
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

  // Animation variants

  // Animation variants
  const variants = {
    expanded: { y: 0, height: '100dvh', borderRadius: '0px' },
    collapsed: {
      y: 0,
      height: isMobile ? '96px' : '120px',
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

  const dragControls = useDragControls()
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop ?? 0
    if (scrollTop <= 0) {
      touchStart.current = e.touches[0].clientY
    } else {
      touchStart.current = null
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return

    // Calculate distance
    const currentY = e.touches[0].clientY
    const diff = currentY - touchStart.current

    // If pulling down significantly at the top
    if (diff > 100) {
      // We could add visual feedback here, but for now we'll just rely on the snap
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return

    const currentY = e.changedTouches[0].clientY
    const diff = currentY - touchStart.current

    if (diff > 100) {
      handleToggleExpand(false)
    }
    touchStart.current = null
  }

  return (
    <motion.div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-20 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 flex flex-col overflow-y-auto no-scrollbar overscroll-contain"
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={variants}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      drag="y"
      dragControls={dragControls}
      dragListener={!isExpanded}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag Handle Area */}
      <div onPointerDown={(e) => dragControls.start(e)} className="shrink-0 bg-white sticky top-0 z-10">
        <div
          className="w-full flex justify-center pt-3 pb-1 cursor-pointer"
          onClick={() => handleToggleExpand(!isExpanded)}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="px-6 pb-2 flex justify-between items-center"
          onClick={() => handleToggleExpand(!isExpanded)}
        >
          <h2 className="text-lg font-semibold text-gray-800">Nearby Strays</h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">{strays.length} found</div>
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="px-4 pb-6 bg-white">
        {isLoading || !currentUserPosition ? (
          <div className="space-y-3 pt-2" aria-label="Loading nearby strays">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl border border-gray-100"
              >
                <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : strays.length === 0 ? (
          <div className="text-center py-10">
            <PawPrint className="w-10 h-10 mx-auto text-gray-300" />
            <p className="mt-3 font-medium text-gray-700">
              No strays reported in this area yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Seen a stray around here? Be the first to report it.
            </p>
            <Button
              className="mt-4"
              onClick={e => {
                e.stopPropagation()
                onAddSighting?.()
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Report the first sighting
            </Button>
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
                <div className="h-16 w-16 shrink-0 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-gray-100">
                  <Img
                    src={
                      stray.sightings[0]?.sightingPhotos[0]
                        ? getSightingThumbnailUrl(
                          stray.sightings[0].sightingPhotos[0].url
                        )
                        : getPlaceholderImage(
                          '',
                          stray.species === 'cat' ? 'cats' : 'dogs'
                        )
                    }
                    loader={
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Spinner className="h-4 w-4" />
                      </div>
                    }
                    unloader={
                      <Img
                        src={getPlaceholderImage(
                          stray.sightings[0]?.sightingPhotos[0]?.url || '',
                          stray.species === 'cat' ? 'cats' : 'dogs'
                        )}
                        alt={`${stray.species} sighting photo`}
                        className="w-full h-full object-cover"
                      />
                    }
                    alt={`${stray.species} sighting photo`}
                    className="w-full h-full object-cover"
                  />
                </div>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
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
