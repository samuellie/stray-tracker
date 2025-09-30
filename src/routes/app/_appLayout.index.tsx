import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { SidebarProvider } from '~/components/ui/sidebar'
import { Plus } from 'lucide-react'
import { Map } from '~/components/Map'
import { useState } from 'react'

export const Route = createFileRoute('/app/_appLayout/')({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const [showSightingForm, setShowSightingForm] = useState(false)

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
        {/* Map Container - Full Screen */}
        <div className="h-screen w-screen">
          <Map className="w-full h-full" />
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={() => navigate({ to: '/app/report' })}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </SidebarProvider>
  )
}
