import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Checkbox } from '~/components/ui/checkbox'
import { toast } from 'sonner'
import { createSighting } from '~/routes/api/sightings'
import { authClient } from '~/lib/auth-client'
import { sightingFormDefaults } from '~/form-config'

interface ReportSightingFormProps {
  onSuccess?: () => void
}

export function ReportSightingForm({ onSuccess }: ReportSightingFormProps) {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [getUserLocation, setGetUserLocation] = useState(false)
  const [reportingNewAnimal, setReportingNewAnimal] = useState(false)

  const { data: session, isPending } = authClient.useSession()

  const form = useForm({
    defaultValues: sightingFormDefaults,
    onSubmit: async ({ value }) => {
      try {
        // Check if user is logged in
        if (!session?.user?.id) {
          throw new Error('You must be logged in to report a sighting')
        }

        const sightingData = {
          strayId: value.strayId,
          userId: session.user.id,
          description: value.description,
          location:
            value.location || (value.latitude && value.longitude)
              ? {
                  lat: value.latitude!,
                  lng: value.longitude!,
                  address: value.location || 'Current location',
                }
              : null,
          sightingTime: value.date ? new Date(value.date) : new Date(),
          notes: value.notes,
          weatherCondition: value.weatherCondition,
          confidence: value.confidence,
          ...(reportingNewAnimal && {
            species: value.species,
            animalSize: value.animalSize,
          }),
        }

        await createSighting({ data: sightingData })
        toast.success('Sighting reported successfully!')
        form.reset()
        onSuccess?.()
      } catch (error) {
        console.error('Failed to report sighting:', error)
        toast.error(
          error instanceof Error ? error.message : 'Failed to report sighting'
        )
        throw error
      }
    },
  })

  const handleGetCurrentLocation = () => {
    setLocationLoading(true)
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        form.setFieldValue('latitude', latitude)
        form.setFieldValue('longitude', longitude)
        toast.success('Location collected successfully')
        setLocationLoading(false)
      },
      error => {
        console.error('Error getting location:', error)
        toast.error('Failed to get your location. Please enter it manually.')
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }

  const handleLocationCheckboxChange = (checked: boolean) => {
    setGetUserLocation(checked)
    if (checked && !currentLocation) {
      handleGetCurrentLocation()
    } else if (checked && currentLocation) {
      form.setFieldValue('latitude', currentLocation.lat)
      form.setFieldValue('longitude', currentLocation.lng)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Report a Sighting</h1>
        <p className="text-gray-600 text-sm">
          Help reunite lost pets by reporting when you've seen stray animals.
          Your reports help track animal movements and aid rescue efforts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sighting Details</CardTitle>
          <CardDescription>
            Fill in the details of the stray animal you observed. Be as
            descriptive as possible to help others identify and locate the
            animal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {/* Animal Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reporting-new-animal"
                  checked={reportingNewAnimal}
                  onCheckedChange={checked =>
                    setReportingNewAnimal(checked === true)
                  }
                />
                <Label htmlFor="reporting-new-animal">
                  I'm reporting a new animal not in the system yet
                </Label>
              </div>

              {reportingNewAnimal ? (
                <>
                  {/* Species Selection */}
                  <form.Field
                    name="species"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'Species is required for new animals'
                          : undefined,
                    }}
                    children={field => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Species *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={value =>
                            field.setValue(value as 'cat' | 'dog' | 'other')
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select species" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cat">Cat</SelectItem>
                            <SelectItem value="dog">Dog</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors ? (
                          <p className="text-sm text-red-600">
                            {field.state.meta.errors.join(', ')}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />

                  {/* Size Selection */}
                  <form.Field
                    name="animalSize"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? 'Size is required for new animals' : undefined,
                    }}
                    children={field => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Size *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={value =>
                            field.setValue(
                              value as 'small' | 'medium' | 'large'
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors ? (
                          <p className="text-sm text-red-600">
                            {field.state.meta.errors.join(', ')}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                </>
              ) : (
                /* Stray Linkage */
                <form.Field
                  name="strayId"
                  children={field => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Stray Animal ID</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={field.state.value?.toString()}
                        onBlur={field.handleBlur}
                        onChange={e =>
                          field.handleChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        placeholder="Enter the ID of the stray animal you observed"
                      />
                      <p className="text-sm text-gray-500">
                        Leave empty if you're reporting a new animal not in the
                        system. You can find the stray ID on the animal's
                        profile page or from previous listings.
                      </p>
                      {field.state.meta.errors ? (
                        <p className="text-sm text-red-600">
                          {field.state.meta.errors.join(', ')}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
              )}
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-location"
                  checked={getUserLocation}
                  onCheckedChange={handleLocationCheckboxChange}
                />
                <Label htmlFor="use-location">Use my current location</Label>
                {getUserLocation && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading
                      ? 'Getting location...'
                      : 'Refresh location'}
                  </Button>
                )}
              </div>

              {getUserLocation && currentLocation && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    Location captured: {currentLocation.lat.toFixed(6)},{' '}
                    {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <form.Field
                name="location"
                children={field => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Address/Location Description
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                      placeholder="Street address, cross streets, or landmark"
                    />
                    {!getUserLocation && (
                      <p className="text-sm text-gray-500">
                        Please provide an address since location sharing is
                        disabled
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Description */}
            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) =>
                  !value || value.length < 10
                    ? 'Description must be at least 10 characters'
                    : undefined,
              }}
              children={field => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Detailed Description *</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="Describe what you observed: behavior, condition, any unusual markings, injuries, or other notable details..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">
                    Helpful details include: animal behavior, health condition,
                    specific markings, notable colors, or distinctive features.
                  </p>
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            />

            {/* Date and Time */}
            <form.Field
              name="date"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Date is required'
                  const date = new Date(value)
                  if (isNaN(date.getTime())) return 'Invalid date format'
                  if (date > new Date()) return 'Cannot report future sightings'
                  return undefined
                },
              }}
              children={field => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    When did you see the animal? *
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            />

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="weatherCondition"
                children={field => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Weather Conditions</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={value => field.setValue(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select weather condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunny">Sunny</SelectItem>
                        <SelectItem value="cloudy">Cloudy</SelectItem>
                        <SelectItem value="rainy">Rainy</SelectItem>
                        <SelectItem value="snowy">Snowy</SelectItem>
                        <SelectItem value="windy">Windy</SelectItem>
                        <SelectItem value="foggy">Foggy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <form.Field
                name="confidence"
                children={field => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Confidence Level</Label>
                    <Select
                      value={field.state.value?.toString()}
                      onValueChange={value => field.setValue(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How sure are you about the identification?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Very Unsure</SelectItem>
                        <SelectItem value="2">Unsure</SelectItem>
                        <SelectItem value="3">Somewhat Sure</SelectItem>
                        <SelectItem value="4">Confident</SelectItem>
                        <SelectItem value="5">Very Confident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>

            {/* Notes */}
            <form.Field
              name="notes"
              children={field => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Additional Notes</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="Any additional information that might be helpful for animal care or identification..."
                    rows={3}
                  />
                </div>
              )}
            />

            {/* Contact Info */}
            <form.Field
              name="contactInfo"
              children={field => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Contact Information (Optional)
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="Phone number or preferred contact method for follow-up"
                  />
                  <p className="text-sm text-gray-500">
                    Only provide if you're willing to be contacted about this
                    sighting.
                  </p>
                </div>
              )}
            />

            {/* Submit Button */}
            <div className="pt-4">
              <form.Subscribe
                selector={state => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit}
                    size="lg"
                  >
                    {isSubmitting ? 'Reporting Sighting...' : 'Report Sighting'}
                  </Button>
                )}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          By reporting this sighting, you're helping reunite lost pets with
          their owners. All information is handled confidentially and used
          solely for animal welfare purposes.
        </p>
      </div>
    </div>
  )
}
