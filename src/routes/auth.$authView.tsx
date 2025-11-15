import { cn } from '~/lib/utils'
import { AuthView } from '@daveyplate/better-auth-ui'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/$authView')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authView } = Route.useParams()

  return (
    <main className="h-screen flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AuthView
        pathname={authView}
        redirectTo="/app"
        cardHeader={
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            🐾 Stray Tracker
          </Link>
        }
      />
    </main>
  )
}
