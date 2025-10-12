import { useForm } from '@tanstack/react-form'
import { useState, useCallback, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'
import { authClient } from '~/lib/auth-client'
import { useCreateSighting } from '~/hooks/server/useCreateSighting'
import { sightingFormDefaults } from '~/form-config'
import {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
  StepperContent,
} from '~/components/ui/stepper'
import { ImageLocationStep } from '~/components/sighting-form-steps/ImageLocationStep'
import { AnimalTypeStep } from '~/components/sighting-form-steps/AnimalTypeStep'
import { ObservationStep } from '~/components/sighting-form-steps/ObservationStep'
import { AdditionalInfoStep } from '~/components/sighting-form-steps/AdditionalInfoStep'
import { ImageManagerDialog } from '~/components/ImageManagerDialog'
import { useProcessImages, type ProcessedImage } from '~/hooks/useProcessImages'

interface ReportSightingFormProps {
  onSuccess?: () => void
}

export function ReportSightingForm({ onSuccess }: ReportSightingFormProps) {
  const [reportingNewAnimal, setReportingNewAnimal] = useState(false)
  const [images, setImages] = useState<ProcessedImage[]>([])
  const steps = [
    { id: 'images-location', title: 'Pictures' },
    {
      id: 'animal-type',
      title: 'Matching',
    },
    {
      id: 'observation-additional',
      title: 'Details',
    },
  ]

  const { data: session } = authClient.useSession()

  const createSightingMutation = useCreateSighting()

  // Handle mutation errors with toast
  useEffect(() => {
    if (createSightingMutation.isError && createSightingMutation.error) {
      toast.error(
        createSightingMutation.error?.message || 'Failed to report sighting'
      )
      createSightingMutation.reset()
    }
  }, [
    createSightingMutation.isError,
    createSightingMutation.error,
    createSightingMutation,
  ])

  const form = useForm({
    defaultValues: sightingFormDefaults,
    onSubmit: async ({ value }) => {
      try {
        // Construct location data if coordinates are available
        const location =
          value.latitude && value.longitude
            ? {
                lat: value.latitude,
                lng: value.longitude,
                address: value.location,
              }
            : null

        if (!location) {
          toast.error('Location coordinates are required')
          return
        }

        const sightingData = {
          strayId: value.strayId,
          description: value.description,
          lat: value.latitude!,
          lng: value.longitude!,
          location: { address1: value.location },
          sightingTime: value.date ? new Date(value.date) : new Date(),
          notes: value.notes,
          weatherCondition: value.weatherCondition,
          confidence: value.confidence,
          imageKeys: images.map(img => img.key).filter(Boolean),
          ...(reportingNewAnimal && {
            species: value.species,
            animalSize: value.animalSize,
          }),
        }

        console.log(sightingData)

        await createSightingMutation.mutateAsync(sightingData)
        toast.success('Sighting reported successfully!')
        form.reset()
        onSuccess?.()
      } catch (error) {
        console.error('Failed to report sighting:', error)
        throw error
      }
    },
  })

  const [currentStep, setCurrentStep] = useState(1)

  const handleMarkerDragEnd = useCallback(
    (position: { lat: number; lng: number }) => {
      form.setFieldValue('latitude', position.lat)
      form.setFieldValue('longitude', position.lng)
    },
    [form]
  )

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
  }, [steps.length])

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto p-2 pb-24">
      <h1 className="text-2xl font-bold">New Sighting</h1>
      <form
        onSubmit={e => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="mt-4"
      >
        <Stepper
          className="space-y-4"
          value={currentStep}
          onValueChange={setCurrentStep}
        >
          <StepperNav className="align-middle">
            {steps.map((step, index) => (
              <StepperItem className="flex-grow" key={step.id} step={index + 1}>
                <StepperTrigger className="flex flex-col gap-2.5">
                  <StepperIndicator>{index + 1}</StepperIndicator>
                  <StepperTitle>{step.title}</StepperTitle>
                </StepperTrigger>
                {index < steps.length - 1 && <StepperSeparator />}
              </StepperItem>
            ))}
          </StepperNav>

          <StepperContent value={1}>
            <ImageLocationStep
              onMarkerDragEnd={handleMarkerDragEnd}
              onImagesUpdate={setImages}
            />
          </StepperContent>

          <StepperContent value={2}>
            <AnimalTypeStep
              reportingNewAnimal={reportingNewAnimal}
              onReportingNewAnimalChange={setReportingNewAnimal}
              strayId={form.state.values.strayId}
              onStrayIdChange={value => form.setFieldValue('strayId', value)}
              species={form.state.values.species}
              onSpeciesChange={value => form.setFieldValue('species', value)}
              animalSize={form.state.values.animalSize}
              onAnimalSizeChange={value =>
                form.setFieldValue('animalSize', value)
              }
              strayIdError={form.state.fieldMeta.strayId?.errors?.[0]}
              speciesError={form.state.fieldMeta.species?.errors?.[0]}
              animalSizeError={form.state.fieldMeta.animalSize?.errors?.[0]}
            />
          </StepperContent>

          <StepperContent value={3}>
            <ObservationStep
              description={form.state.values.description || ''}
              onDescriptionChange={value =>
                form.setFieldValue('description', value)
              }
              descriptionError={form.state.fieldMeta.description?.errors?.[0]}
              date={form.state.values.date || ''}
              onDateChange={value => form.setFieldValue('date', value)}
              dateError={form.state.fieldMeta.date?.errors?.[0]}
            />
            <AdditionalInfoStep
              weatherCondition={form.state.values.weatherCondition}
              onWeatherConditionChange={value =>
                form.setFieldValue('weatherCondition', value)
              }
              confidence={form.state.values.confidence}
              onConfidenceChange={value =>
                form.setFieldValue('confidence', value)
              }
              notes={form.state.values.notes || ''}
              onNotesChange={value => form.setFieldValue('notes', value)}
            />
          </StepperContent>
        </Stepper>

        <div className="fixed bottom-0 left-0 right-0 flex justify-between z-50 bg-white/95 rounded-lg p-4 w-full">
          <Button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
          >
            Previous
          </Button>

          {currentStep === steps.length ? (
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || createSightingMutation.isPending}
                  size="lg"
                >
                  {isSubmitting || createSightingMutation.isPending
                    ? 'Reporting Sighting...'
                    : 'Report Sighting'}
                </Button>
              )}
            />
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
