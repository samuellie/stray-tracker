import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart, MapPin, RefreshCw } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Img } from 'react-image'
import { Spinner } from '~/components/ui/spinner'
import { useFollowedStrays } from '~/hooks/server/useFollowStray'
import { getSightingThumbnailUrl } from '~/utils/files'
import { getPlaceholderImage } from '~/utils/strayImageFallbacks'
import { formatRelativeDate } from '~/utils/date'
import { getErrorMessage } from '~/lib/errors'

export const Route = createFileRoute('/app/following/')({
  component: FollowingPage,
})

function FollowingPage() {
  const { data: subscriptions, isLoading, error, refetch } = useFollowedStrays()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Following</h1>
        <p className="text-muted-foreground">
          Strays you follow, with their latest sighting
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-label="Loading followed strays">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="font-medium text-destructive">
            {getErrorMessage(error, 'Could not load followed strays').title}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </div>
      ) : !subscriptions || subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="mt-3 font-medium">
            You&apos;re not following any strays yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a stray&apos;s profile and tap Follow to keep up with new
            sightings.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/app">Browse the map</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map(subscription => {
            const stray = subscription.stray!
            const latest = stray.sightings?.[0]
            const photo = latest?.sightingPhotos?.[0]
            return (
              <Link
                key={subscription.id}
                to="/app/strays/$strayId"
                params={{ strayId: stray.id.toString() }}
                className="block"
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Img
                        src={
                          photo
                            ? getSightingThumbnailUrl(photo.url)
                            : getPlaceholderImage(
                              '',
                              stray.species === 'cat' ? 'cats' : 'dogs'
                            )
                        }
                        loader={
                          <div className="w-full h-full flex items-center justify-center">
                            <Spinner className="h-4 w-4" />
                          </div>
                        }
                        unloader={
                          <Img
                            src={getPlaceholderImage(
                              photo?.url || '',
                              stray.species === 'cat' ? 'cats' : 'dogs'
                            )}
                            alt={`${stray.species} photo`}
                            className="w-full h-full object-cover"
                          />
                        }
                        alt={`${stray.name || stray.species} photo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium truncate">
                          {stray.name || 'Unknown Stray'}
                        </h3>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {stray.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {stray.species}
                        {stray.colors ? ` • ${stray.colors}` : ''}
                      </p>
                      {latest && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                          <MapPin className="h-3 w-3" />
                          Last seen {formatRelativeDate(Number(latest.sightingTime))}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
