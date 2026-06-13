import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useFindStrayById } from '~/hooks/server/useFindStrayById'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { formatRelativeDate } from '~/utils/date'
import { getPlaceholderImage } from '~/utils/strayImageFallbacks'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Img } from 'react-image'
import { Spinner } from '~/components/ui/spinner'
import { Button } from '~/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { SightingDialog } from '~/components/dialogs/SightingDialog'
import { useIsMobile } from '~/hooks/use-mobile'
import { Skeleton } from '~/components/ui/skeleton'
import { getSightingThumbnailUrl } from '~/utils/files'
import type { SightingWithDetails, StrayWithRelations } from '~/types/sighting'
import { authClient } from '~/lib/auth-client'
import { useDeleteSighting } from '~/hooks/server/useDeleteSighting'
import { ConfirmationDialog } from '~/components/dialogs/ConfirmationDialog'
import { NamingSuggestions } from '~/components/NamingSuggestions'
import { toast } from 'sonner'
import { getErrorMessage } from '~/lib/errors'
import { toastUndoable } from '~/lib/undoable'
import { useRouter } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'

export const Route = createFileRoute('/app/strays/$strayId')({
  // ?sighting=<id> drives the sighting dialog (deep-linkable, back-button friendly)
  validateSearch: (search: Record<string, unknown>): { sighting?: number } => {
    const raw = Number(search.sighting)
    return Number.isFinite(raw) && raw > 0 ? { sighting: raw } : {}
  },
  component: StrayDetailPage,
})

function StrayDetailPage() {
  const { strayId } = Route.useParams()
  const strayIdNum = Number(strayId)
  const isMobile = useIsMobile()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const deleteSightingMutation = useDeleteSighting()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sightingToDelete, setSightingToDelete] = useState<number | null>(null)
  const navigate = Route.useNavigate()
  const { sighting: sightingParam } = Route.useSearch()
  const [dialogPlaceholder, setDialogPlaceholder] =
    useState<SightingWithDetails | null>(null)
  const openedFromRef = useRef<number | null>(null)

  const openSightingDialog = (sighting: SightingWithDetails) => {
    setDialogPlaceholder(sighting)
    openedFromRef.current = sighting.sighting.id
    navigate({ search: { sighting: sighting.sighting.id } })
  }

  const closeSightingDialog = () => {
    navigate({ search: {} })
  }

  const { data: stray, isLoading, error } = useFindStrayById(strayIdNum)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" aria-label="Loading stray details">
        <div className="mb-6">
          <Skeleton className="h-10 w-36 mb-4" />
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Skeleton className="w-full h-80 rounded-t-lg rounded-b-none" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
            <Card>
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="w-16 h-16 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stray) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-600">{error?.message || 'Stray not found'}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/app/strays">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Strays
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const strayWithRelations = stray as StrayWithRelations
  const latestSighting = strayWithRelations.sightings?.[0]
  const primaryPhoto = latestSighting?.sightingPhotos?.[0]
  const imageSrc = primaryPhoto
    ? primaryPhoto.url
    : getPlaceholderImage('', stray.species === 'cat' ? 'cats' : 'dogs')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/app/strays">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Strays
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{stray.name || 'Unnamed Stray'}</h1>
        <p className="text-muted-foreground">
          Detailed view and sighting history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stray Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo and Basic Info */}
          <Card>
            <CardHeader className="p-0">
              <Img
                src={imageSrc}
                loader={
                  <div className="w-full h-80 flex items-center justify-center bg-muted">
                    <Spinner />
                  </div>
                }
                unloader={
                  <Img
                    src={getPlaceholderImage(
                      '',
                      stray.species === 'cat' ? 'cats' : 'dogs'
                    )}
                    alt={`${stray.species} photo`}
                    className="w-full h-80 object-cover"
                  />
                }
                alt={`${stray.species} photo`}
                className="w-full h-80 object-cover rounded-t-lg"
              />
              <div className="p-6">
                <div className="flex-col items-center gap-3 mb-4">
                  <CardTitle className="text-xl font-semibold">
                    {stray.name || 'Unnamed Stray'}
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={
                        stray.status === 'spotted'
                          ? 'default'
                          : stray.status === 'being_cared_for'
                            ? 'secondary'
                            : stray.status === 'adopted'
                              ? 'outline'
                              : 'destructive'
                      }
                    >
                      {stray.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{stray.size}</Badge>
                    <Badge variant="outline">{stray.species}</Badge>
                    {stray.age && <Badge variant="outline">{stray.age}</Badge>}
                  </div>
                </div>
                {stray.description && (
                  <p className="text-sm text-muted-foreground">
                    {stray.description}
                  </p>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Detailed Information */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {stray.breed && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Breed:
                    </span>
                    <p className="text-sm">{stray.breed}</p>
                  </div>
                )}
                {stray.colors && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Colors:
                    </span>
                    <p className="text-sm">{stray.colors}</p>
                  </div>
                )}
                {stray.markings && (
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Markings:
                    </span>
                    <p className="text-sm">{stray.markings}</p>
                  </div>
                )}
                {stray.healthNotes && (
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Health Notes:
                    </span>
                    <p className="text-sm">{stray.healthNotes}</p>
                  </div>
                )}
                {stray.careRequirements && (
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Care Requirements:
                    </span>
                    <p className="text-sm">{stray.careRequirements}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sightings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sightings</CardTitle>
            </CardHeader>
            <CardContent>
              {strayWithRelations.sightings.length > 0 ? (
                <div className="space-y-4">
                  {strayWithRelations.sightings.slice(0, 5).map(sighting => (
                    <div
                      key={sighting.id}
                      onClick={() => {
                        openSightingDialog({
                          ...stray,
                          sighting,
                        })
                      }}
                    >
                      <div className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={sighting.user.image || ''} />
                          <AvatarFallback>
                            {sighting.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold">
                              {sighting.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeDate(
                                Number(sighting.sightingTime)
                              )}
                            </p>
                          </div>
                          {sighting.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {sighting.description}
                            </p>
                          )}
                          {sighting.sightingPhotos.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                              {sighting.sightingPhotos
                                .slice(0, 3)
                                .map(photo => (
                                  <Img
                                    key={photo.id}
                                    src={getSightingThumbnailUrl(photo.url)}
                                    alt="Sighting photo"
                                    className="w-16 h-16 object-cover rounded"
                                    loader={
                                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                        <Spinner />
                                      </div>
                                    }
                                    unloader={
                                      <Img
                                        src={getPlaceholderImage(
                                          photo.url,
                                          stray.species === 'cat'
                                            ? 'cats'
                                            : 'dogs'
                                        )}
                                        alt="Sighting photo"
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                    }
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                        {(session?.user?.role === 'admin' ||
                          session?.user?.id === sighting.userId) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                              onClick={e => {
                                e.stopPropagation()
                                setSightingToDelete(sighting.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent sightings</p>
              )}
            </CardContent>
          </Card>

          <Dialog
            open={sightingParam != null}
            onOpenChange={open => {
              if (!open) closeSightingDialog()
            }}
          >
            <DialogContent
              className={`p-0 ${isMobile ? 'w-full h-full' : 'max-w-2xl'}`}
            >
              <SightingDialog
                sightingId={sightingParam}
                initialSighting={dialogPlaceholder}
                onNavigateToSighting={id =>
                  navigate({ search: { sighting: id } })
                }
                canGoBack={
                  sightingParam != null &&
                  openedFromRef.current != null &&
                  sightingParam !== openedFromRef.current
                }
                onBack={() => router.history.back()}
                onClose={closeSightingDialog}
              />
            </DialogContent>
          </Dialog>

          <ConfirmationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Sighting"
            description={(() => {
              const target = strayWithRelations.sightings.find(
                s => s.id === sightingToDelete
              )
              const when = target
                ? ` from ${formatRelativeDate(Number(target.sightingTime))}`
                : ''
              const photos = target?.sightingPhotos.length ?? 0
              return `This removes the sighting${when}${photos > 0 ? ` along with ${photos} photo${photos > 1 ? 's' : ''}` : ''}. You'll have a few seconds to undo.`
            })()}
            confirmText="Delete"
            variant="destructive"
            onConfirm={() => {
              if (!sightingToDelete) return
              const id = sightingToDelete
              setDeleteDialogOpen(false)
              setSightingToDelete(null)
              toastUndoable({
                message: 'Sighting deleted',
                onCommit: () =>
                  deleteSightingMutation.mutate(id, {
                    onSuccess: () => router.invalidate(),
                    onError: error => {
                      const { title, description } = getErrorMessage(
                        error,
                        'Could not delete the sighting'
                      )
                      toast.error(title, { description })
                    },
                  }),
              })
            }}
          />


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community naming */}
          <Card>
            <CardContent className="pt-6">
              <NamingSuggestions strayId={strayIdNum} />
            </CardContent>
          </Card>

          {/* Primary Location */}
          {stray.primaryLocation && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {stray.primaryLocation.address ||
                    stray.primaryLocation.neighborhood ||
                    'Location information available'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Caretaker */}
          {stray.caretaker && (
            <Card>
              <CardHeader>
                <CardTitle>Caretaker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={stray.caretaker.image || ''} />
                    <AvatarFallback>
                      {stray.caretaker.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {stray.caretaker.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stray.caretaker.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Created:
                </span>
                <p className="text-sm">
                  {formatRelativeDate(Number(stray.createdAt))}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Last Updated:
                </span>
                <p className="text-sm">
                  {formatRelativeDate(Number(stray.updatedAt))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
