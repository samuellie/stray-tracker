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
import { useRef, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useIsMobile } from '~/hooks/use-mobile'

import { StrayList } from '~/components/StrayList'
import type { CreatedSighting, SightingWithDetails } from '~/types/sighting'
import { SightingDialog } from '~/components/dialogs/SightingDialog'

export const Route = createFileRoute('/app/')({
  // ?sighting=<id> drives the sighting dialog, making sightings deep-linkable
  // and giving the browser back button natural behaviour inside the dialog
  validateSearch: (search: Record<string, unknown>): { sighting?: number } => {
    const raw = Number(search.sighting)
    return Number.isFinite(raw) && raw > 0 ? { sighting: raw } : {}
  },
  component: Home,
})

function Home() {
  const isMobile = useIsMobile()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [currentUserPosition, setCurrentUserPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedSighting, setSelectedSighting] =
    useState<SightingWithDetails | null>(null)
  const [isStrayListExpanded, setIsStrayListExpanded] = useState(false)

  const [mapState, setMapState] = useState<{
    lat: number
    lng: number
    radius: number
  } | null>(null)

  const router = useRouter()
  const navigate = Route.useNavigate()
  const { sighting: sightingParam } = Route.useSearch()
  // Instantly-renderable data for the sighting being opened, and the id the
  // dialog was opened with (in-dialog navigation away from it enables Back)
  const [dialogPlaceholder, setDialogPlaceholder] =
    useState<SightingWithDetails | null>(null)
  const openedFromRef = useRef<number | null>(null)

  const handleOpenSightingDialog = (sighting: SightingWithDetails) => {
    setDialogPlaceholder(sighting)
    openedFromRef.current = sighting.sighting.id
    navigate({ search: { sighting: sighting.sighting.id } })
  }

  const closeSightingDialog = () => {
    navigate({ search: {} })
  }

  const handleSightingSubmitSuccess = (sighting?: CreatedSighting) => {
    setIsPopoverOpen(false)
    if (sighting) {
      handleOpenSightingDialog({ ...sighting.stray, sighting })
    }
  }

  const handleStrayClick = (stray: SightingWithDetails) => {
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
      <Dialog
        open={sightingParam != null}
        onOpenChange={open => {
          if (!open) closeSightingDialog()
        }}
      >
        <DialogContent
          className={`p-0 ${isMobile ? 'w-full h-full' : 'max-w-2xl'}`}
        >
          <SightingDialog
            sightingId={sightingParam}
            initialSighting={dialogPlaceholder}
            onNavigateToSighting={id => navigate({ search: { sighting: id } })}
            canGoBack={
              sightingParam != null &&
              openedFromRef.current != null &&
              sightingParam !== openedFromRef.current
            }
            onBack={() => router.history.back()}
            onClose={closeSightingDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
