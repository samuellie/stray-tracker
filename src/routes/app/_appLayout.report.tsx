import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_appLayout/report')({
  component: Report,
})

function Report() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Report a Sighting</h1>
      <p className="text-gray-600">
        Help reunite lost pets by reporting stray animal sightings.
      </p>
      {/* TODO: Add report form component */}
    </div>
  )
}
