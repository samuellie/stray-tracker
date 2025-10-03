import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Plus } from 'lucide-react'
import { MapComponent } from '~/components/MapComponent'
import { ReportSightingForm } from '~/components/ReportSightingForm'
import { useState } from 'react'

export const Route = createFileRoute('/app/_appLayout/')({
  component: Home,
})

function Home() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      {/* Map Container - Full Screen */}
      <div className="h-full w-full">
        <MapComponent defaultShowCurrentLocation />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-96 p-0 max-h-[80vh] overflow-y-auto"
            side="top"
            align="end"
          >
            <ReportSightingForm onSuccess={() => setIsPopoverOpen(false)} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
