import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/animals')({
  component: Animals,
})

function Animals() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Animals</h1>
      <p className="text-muted-foreground">
        Browse pets available for adoption.
      </p>
      {/* TODO: Add animals listing component */}
    </div>
  )
}
