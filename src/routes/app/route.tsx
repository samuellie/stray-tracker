import { useState, useEffect } from 'react'
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { authClient } from '~/lib/auth-client'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { User, Menu } from 'lucide-react'
import { useIsMobile } from '~/hooks/use-mobile'
import { LoadingPage } from '~/components/LoadingPage'
import { useTheme } from 'next-themes'
import { Switch } from '~/components/ui/switch'
import { Moon, Sun } from 'lucide-react'

export const Route = createFileRoute('/app')({
  component: AppLayout,
})

function AppLayout() {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const {
    data: session,
    isPending, //loading state
  } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: '/', search: {} })
    }
  }, [isPending, session, navigate])

  const NavigationLinks = () => (
    <>
      <Link
        to="/app"
        className={`${isMobile ? 'block py-3 px-4 text-base' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
        activeProps={{
          className: isMobile
            ? 'text-blue-600 bg-blue-50 font-medium'
            : 'text-blue-600 font-medium',
        }}
        activeOptions={{ exact: true }}
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/app/animals"
        className={`${isMobile ? 'block py-3 px-4 text-base' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
        activeProps={{
          className: isMobile
            ? 'text-blue-600 bg-blue-50 font-medium'
            : 'text-blue-600 font-medium',
        }}
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        Animals
      </Link>
      {(session?.user as any)?.role === 'admin' && (
        <>
          <Link
            to="/app/admin/shadcn-test"
            className={`${isMobile ? 'block py-3 px-4 text-base' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
            activeProps={{
              className: isMobile
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-blue-600 font-medium',
            }}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            UI Test
          </Link>
          <Link
            to="/app/admin/users"
            className={`${isMobile ? 'block py-3 px-4 text-base' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
            activeProps={{
              className: isMobile
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-blue-600 font-medium',
            }}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            Users
          </Link>
        </>
      )}
    </>
  )

  const ThemeToggle = () => (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle theme"
      />
      <Moon className="h-4 w-4" />
    </div>
  )

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? 'default' : 'icon'}
          className={isMobile ? 'w-full justify-start px-4 py-3' : ''}
        >
          <User className="h-5 w-5" />
          {isMobile && <span>Account</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isMobile ? 'start' : 'end'}
        className={isMobile ? 'w-full' : ''}
      >
        <DropdownMenuItem asChild>
          <Link
            to="/app/account/{-$accountView}"
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => authClient.signOut()}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (isPending) {
    return <LoadingPage />
  }

  if (!session) {
    return null // Redirect will happen via useEffect
  }
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background shadow-sm">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/app"
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              🐾 Stray Tracker
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-6">
                <NavigationLinks />
                <ThemeToggle />
                <UserMenu />
              </div>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-2 mt-6">
                    <NavigationLinks />
                    <div className="border-t pt-4 mt-4 space-y-4">
                      <ThemeToggle />
                      <UserMenu />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  )
}
