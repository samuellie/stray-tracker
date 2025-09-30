import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_appLayout/animals')({
  component: Animals,
})

function Animals() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Animals</h1>
      <p className="text-gray-600">Browse pets available for adoption.</p>
      {/* TODO: Add animals listing component */}
    </div>
  )
}
