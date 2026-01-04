import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
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
import { User } from 'better-auth'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { SightingDialog } from '~/components/dialogs/SightingDialog'
import { useIsMobile } from '~/hooks/use-mobile'
import { getSightingThumbnailUrl } from '~/utils/files'
import type { Stray, Sighting, SightingPhoto } from 'db/schema'
import { authClient } from '~/lib/auth-client'
import { useDeleteSighting } from '~/hooks/server/useDeleteSighting'
import { ConfirmationDialog } from '~/components/dialogs/ConfirmationDialog'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'

type StrayWithRelations = Stray & {
  caretaker?: User
  sightings: Array<
    Sighting & {
      user: User
      sightingPhotos: SightingPhoto[]
    }
  >
}

export const Route = createFileRoute('/app/strays/$strayId')({
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSightingForDialog, setSelectedSightingForDialog] = useState<
    | (Stray & {
      sighting: Sighting & { sightingPhotos: SightingPhoto[]; user: User }
    })
    | null
  >(null)

  const { data: stray, isLoading, error } = useFindStrayById(strayIdNum)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-muted-foreground">
              Loading stray details...
            </p>
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
                        setSelectedSightingForDialog({
                          ...stray,
                          sighting,
                        })
                        setDialogOpen(true)
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent
              className={`p-0 ${isMobile ? 'w-full h-full' : 'max-w-2xl'}`}
            >
              <SightingDialog
                selectedSighting={selectedSightingForDialog}
                onClose={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <ConfirmationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Sighting"
            description="Are you sure you want to delete this sighting? This will also delete all associated photos and community posts. This action cannot be undone."
            confirmText="Delete"
            variant="destructive"
            onConfirm={async () => {
              if (!sightingToDelete) return
              try {
                await deleteSightingMutation.mutateAsync(sightingToDelete)
                toast.success('Deleted successfully')
                setDeleteDialogOpen(false)
                setSightingToDelete(null)
                router.invalidate()
              } catch (error) {
                toast.error('Failed to delete')
                console.error(error)
              }
            }}
            isLoading={deleteSightingMutation.isPending}
          />


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
