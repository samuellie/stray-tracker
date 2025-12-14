import { useForm } from '@tanstack/react-form'
import { useState, useCallback, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'
import { useCreateSighting } from '~/hooks/server/useCreateSighting'
import { sightingFormDefaults } from '~/form-config'
import {
  Stepper,
  StepperContent,
} from '~/components/ui/stepper'
import { ImageLocationStep } from '~/components/sighting-form-steps/ImageLocationStep'
import { AnimalTypeStep } from '~/components/sighting-form-steps/AnimalTypeStep'
import { type ProcessedImage } from '~/hooks/useProcessImages'
import { useIsMobile } from '~/hooks/use-mobile'

interface ReportSightingFormProps {
  onSuccess?: () => void
}

export function ReportSightingForm({ onSuccess }: ReportSightingFormProps) {
  const [reportingNewAnimal, setReportingNewAnimal] = useState(false)
  const [images, setImages] = useState<ProcessedImage[]>([])
  const isMobile = useIsMobile()

  const steps = [
    { id: 'images-location', title: 'Details' },
    {
      id: 'animal-type',
      title: 'Matching',
    },
  ]

  const createSightingMutation = useCreateSighting(true)

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
          // Removed fields: notes, weatherCondition, confidence
          imageKeys: images.map(img => img.key).filter(Boolean),
          ...(reportingNewAnimal && {
            species: value.species,
            animalSize: value.animalSize,
          }),
        }

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
    <div className={`w-full flex-1 min-h-0 flex flex-col ${isMobile ? 'p-0' : 'p-0'} `}>
      <form
        onSubmit={e => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex-1 min-h-0 flex flex-col overflow-hidden"
      >
        <Stepper
          className="flex flex-col flex-1 overflow-hidden"
          value={currentStep}
          onValueChange={setCurrentStep}
        >
          <div className="flex-1 overflow-y-auto p-6">
            <StepperContent value={1} forceMount className="mt-0">
              <form.Subscribe
                selector={state => [state.values.description, state.values.date]}
                children={([description, date]) => (
                  <ImageLocationStep
                    onMarkerDragEnd={handleMarkerDragEnd}
                    onImagesUpdate={setImages}
                    description={description || ''}
                    onDescriptionChange={value =>
                      form.setFieldValue('description', value)
                    }
                    date={date || new Date().toISOString()}
                    onDateChange={value => form.setFieldValue('date', value)}
                  />
                )}
              />
            </StepperContent>

            <StepperContent value={2} forceMount className="mt-0">
              <form.Subscribe
                selector={state => ({
                  values: state.values,
                  fieldMeta: state.fieldMeta,
                })}
                children={({ values, fieldMeta }) => (
                  <AnimalTypeStep
                    reportingNewAnimal={reportingNewAnimal}
                    onReportingNewAnimalChange={setReportingNewAnimal}
                    strayId={values.strayId}
                    onStrayIdChange={value => form.setFieldValue('strayId', value)}
                    species={values.species}
                    onSpeciesChange={value => form.setFieldValue('species', value)}
                    animalSize={values.animalSize}
                    onAnimalSizeChange={value =>
                      form.setFieldValue('animalSize', value)
                    }
                    strayIdError={fieldMeta.strayId?.errors?.[0]}
                    speciesError={fieldMeta.species?.errors?.[0]}
                    animalSizeError={fieldMeta.animalSize?.errors?.[0]}
                    latitude={values.latitude}
                    longitude={values.longitude}
                  />
                )}
              />
            </StepperContent>
          </div>
        </Stepper>

        <div className="flex justify-between bg-background border-t p-4 shrink-0 mt-auto">
          {currentStep !== 1 ? (
            <Button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {currentStep === steps.length ? (
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || createSightingMutation.isPending}
                >
                  {isSubmitting || createSightingMutation.isPending
                    ? 'Submitting'
                    : 'Submit'}
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
