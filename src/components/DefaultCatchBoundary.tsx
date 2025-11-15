import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: state => state.id === rootRouteId,
  })

  console.error('DefaultCatchBoundary Error:', error)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-muted-foreground">
            Error
          </CardTitle>
          <CardDescription className="text-lg">
            Oops! Something went wrong and the app is feeling a bit ruff!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <ErrorComponent error={error} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => {
                router.invalidate()
              }}
              variant="outline"
              className="flex-1"
            >
              Try Again
            </Button>
            {isRoot ? (
              <Button asChild className="flex-1">
                <Link to="/">Home</Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
