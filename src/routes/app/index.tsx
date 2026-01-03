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
import { SightingDialog } from '~/components/dialogs/SightingDialog'

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

  const [mapState, setMapState] = useState<{
    lat: number
    lng: number
    radius: number
  } | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSightingForDialog, setSelectedSightingForDialog] = useState<
    | (Stray & {
      sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
    })
    | null
  >(null)

  const handleOpenSightingDialog = (
    sighting: Stray & {
      sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
    }
  ) => {
    setSelectedSightingForDialog(sighting)
    setDialogOpen(true)
  }

  const handleSightingSubmitSuccess = (sighting: any) => {
    setIsPopoverOpen(false)
    if (sighting) {
      const strayResult = { ...sighting.stray, sighting: sighting }
      handleOpenSightingDialog(strayResult)
    }
  }

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

          onMapStateChange={setMapState}
          onOpenSightingDialog={handleOpenSightingDialog}
        />
      </div>

      <StrayList
        currentUserPosition={currentUserPosition}
        mapState={mapState}
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
            <ReportSightingForm
              onSuccess={handleSightingSubmitSuccess}
              initialLocation={
                currentUserPosition ??
                (mapState ? { lat: mapState.lat, lng: mapState.lng } : null)
              }
            />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
            <ReportSightingForm
              onSuccess={handleSightingSubmitSuccess}
              initialLocation={
                currentUserPosition ??
                (mapState ? { lat: mapState.lat, lng: mapState.lng } : null)
              }
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Floating Action Button */}
      {!isStrayListExpanded && (
        <div className={`fixed z-30 ${isMobile ? "bottom-[100px]" : "bottom-[200px]"} right-4`}>
          <Button
            size="lg"
            className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow`}
            onClick={() => setIsPopoverOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
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
