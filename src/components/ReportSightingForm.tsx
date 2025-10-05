import { useForm } from '@tanstack/react-form'
import { useState, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'
import { createSighting } from '~/routes/api/sightings'
import { authClient } from '~/lib/auth-client'
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

interface ReportSightingFormProps {
  onSuccess?: () => void
}

export function ReportSightingForm({ onSuccess }: ReportSightingFormProps) {
  const [reportingNewAnimal, setReportingNewAnimal] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false)

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

  const form = useForm({
    defaultValues: sightingFormDefaults,
    onSubmit: async ({ value }) => {
      try {
        // Check if user is logged in
        if (!session?.user?.id) {
          throw new Error('You must be logged in to report a sighting')
        }

        // Construct location data if coordinates are available
        const location =
          value.latitude && value.longitude
            ? {
                lat: value.latitude,
                lng: value.longitude,
                address: value.location || 'Current location',
              }
            : null

        const sightingData = {
          strayId: value.strayId,
          userId: session.user.id,
          description: value.description,
          location,
          sightingTime: value.date ? new Date(value.date) : new Date(),
          notes: value.notes,
          weatherCondition: value.weatherCondition,
          confidence: value.confidence,
          images: images,
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

  const [currentStep, setCurrentStep] = useState(1)

  const handleImagesUpdate = useCallback((newImages: File[]) => {
    setImages(newImages)
  }, [])

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

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
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
              images={images}
              onImagesUpdate={handleImagesUpdate}
              onMarkerDragEnd={handleMarkerDragEnd}
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
                form.setFieldValue('weatherCondition', value as any)
              }
              confidence={form.state.values.confidence}
              onConfidenceChange={value =>
                form.setFieldValue('confidence', value)
              }
              notes={form.state.values.notes || ''}
              onNotesChange={value => form.setFieldValue('notes', value)}
              contactInfo={form.state.values.contactInfo || ''}
              onContactInfoChange={value =>
                form.setFieldValue('contactInfo', value)
              }
            />
          </StepperContent>
        </Stepper>

        <div className="fixed bottom-4 left-auto right-auto flex justify-between bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-4 z-50 max-w-md w-full">
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
                <Button type="submit" disabled={!canSubmit} size="lg">
                  {isSubmitting ? 'Reporting Sighting...' : 'Report Sighting'}
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

      <ImageManagerDialog
        images={images}
        onRemoveImage={removeImage}
        open={isImageManagerOpen}
        onOpenChange={setIsImageManagerOpen}
      />
    </div>
  )
}
