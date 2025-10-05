import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { Plus } from 'lucide-react'
import { MapComponent } from '~/components/MapComponent'
import { ReportSightingForm } from '~/components/ReportSightingForm'
import { useState } from 'react'
import { useIsMobile } from '~/hooks/use-mobile'

export const Route = createFileRoute('/app/_appLayout/')({
  component: Home,
})

function Home() {
  const isMobile = useIsMobile()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 ">
      {/* Map Container - Full Screen */}
      <div className="h-full w-full">
        <MapComponent defaultShowCurrentLocation />
      </div>

      {/* Floating Action Button */}
      <div
        className={`fixed z-10 bottom-6 left-1/2 transform -translate-x-1/2`}
      >
        {isMobile ? (
          <Sheet open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className={`h-14 w-24 rounded-full shadow-lg hover:shadow-xl transition-shadow`}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-screen overflow-y-auto p-0"
            >
              <ReportSightingForm onSuccess={() => setIsPopoverOpen(false)} />
            </SheetContent>
          </Sheet>
        ) : (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                size="lg"
                className={`h-14 w-24 rounded-full shadow-lg hover:shadow-xl transition-shadow`}
              >
                <Plus className="h-7 w-7" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-96 p-0 max-h-[80vh] overflow-y-auto"
              side="top"
              align="center"
            >
              <ReportSightingForm onSuccess={() => setIsPopoverOpen(false)} />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}
