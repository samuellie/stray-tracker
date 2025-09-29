import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sightings')({
  component: Sightings,
})

function Sightings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sightings</h1>
      <p className="text-gray-600">
        View recent stray animal sightings in your area.
      </p>
      {/* TODO: Add sightings tracking component */}
    </div>
  )
}
