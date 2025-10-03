import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '~/lib/auth-client'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { User } from 'lucide-react'

export const Route = createFileRoute('/app/_appLayout')({
  component: AppLayout,
})
function AppLayout() {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession()
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/app"
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              🐾 Stray Tracker
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/app"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                activeProps={{
                  className: 'text-blue-600 font-medium',
                }}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
              <Link
                to="/app/animals"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                activeProps={{
                  className: 'text-blue-600 font-medium',
                }}
              >
                Animals
              </Link>
              <Link
                to="/app/shadcn-test"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                activeProps={{
                  className: 'text-blue-600 font-medium',
                }}
              >
                UI Test
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/app/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => authClient.signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1">{session ? <Outlet /> : 'unauth'}</main>
    </div>
  )
}
