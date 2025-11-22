import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '~/components/ui/dialog'
import { Sheet, SheetContent } from '~/components/ui/sheet'
import { Plus } from 'lucide-react'
import { MapComponent } from '~/components/MapComponent'
import { ReportSightingForm } from '~/components/ReportSightingForm'
import { useState } from 'react'
import { useIsMobile } from '~/hooks/use-mobile'

import { StrayList } from '~/components/StrayList'
import type { Stray, Sighting, SightingPhoto } from 'db/schema'
import type { User } from 'better-auth'

export const Route = createFileRoute('/app/')({
  component: Home,
})

function Home() {
  const isMobile = useIsMobile()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [currentUserPosition, setCurrentUserPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedSighting, setSelectedSighting] = useState<
    | (Stray & {
        sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
      })
    | null
  >(null)
  const [isStrayListExpanded, setIsStrayListExpanded] = useState(false)

  const handleStrayClick = (
    stray: Stray & {
      sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
    }
  ) => {
    setSelectedSighting(stray)
    setIsStrayListExpanded(false)
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Map Container - Full Screen */}
      <div className="h-full w-full mb-100">
        <MapComponent
          defaultShowCurrentLocation
          showNearbySightings
          currentUserPosition={currentUserPosition}
          onUserPositionChange={setCurrentUserPosition}
          selectedSighting={selectedSighting}
          onSelectSighting={setSelectedSighting}
        />
      </div>

      <StrayList
        currentUserPosition={currentUserPosition}
        isExpanded={isStrayListExpanded}
        onToggleExpand={setIsStrayListExpanded}
        onStrayClick={handleStrayClick}
        onAddSighting={() => setIsPopoverOpen(true)}
      />

      {/* Floating Action Button */}
      {/* Report Sighting Form */}
      {isMobile ? (
        <Sheet open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <SheetContent side="bottom" className="h-screen overflow-y-auto p-0">
            <ReportSightingForm onSuccess={() => setIsPopoverOpen(false)} />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <DialogContent className="min-w-96 max-h-[80vh] overflow-y-auto">
            <ReportSightingForm onSuccess={() => setIsPopoverOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Floating Action Button */}
      {!isStrayListExpanded && (
        <div className={`fixed z-30 bottom-[200px] right-4`}>
          <Button
            size="lg"
            className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow`}
            onClick={() => setIsPopoverOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
