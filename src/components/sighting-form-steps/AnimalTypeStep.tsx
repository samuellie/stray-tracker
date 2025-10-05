import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

interface AnimalTypeStepProps {
  reportingNewAnimal: boolean
  onReportingNewAnimalChange: (checked: boolean) => void
  strayId?: number
  onStrayIdChange: (value: number | undefined) => void
  species?: 'cat' | 'dog' | 'other'
  onSpeciesChange: (value: 'cat' | 'dog' | 'other') => void
  animalSize?: 'small' | 'medium' | 'large'
  onAnimalSizeChange: (value: 'small' | 'medium' | 'large') => void
  strayIdError?: string
  speciesError?: string
  animalSizeError?: string
}

export function AnimalTypeStep({
  reportingNewAnimal,
  onReportingNewAnimalChange,
  strayId,
  onStrayIdChange,
  species,
  onSpeciesChange,
  animalSize,
  onAnimalSizeChange,
  strayIdError,
  speciesError,
  animalSizeError,
}: AnimalTypeStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Animal Information</h2>
      <p className="text-sm text-muted-foreground">
        Specify whether this is a new animal or an existing one in our system.
      </p>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reporting-new-animal"
            checked={reportingNewAnimal}
            onCheckedChange={checked =>
              onReportingNewAnimalChange(checked === true)
            }
          />
          <Label htmlFor="reporting-new-animal">
            I'm reporting a new animal not in the system yet
          </Label>
        </div>

        {reportingNewAnimal ? (
          <>
            {/* Species Selection */}
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Select
                value={species}
                onValueChange={value =>
                  onSpeciesChange(value as 'cat' | 'dog' | 'other')
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
              {speciesError && (
                <p className="text-sm text-red-600">{speciesError}</p>
              )}
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <Label htmlFor="animalSize">Size *</Label>
              <Select
                value={animalSize}
                onValueChange={value =>
                  onAnimalSizeChange(value as 'small' | 'medium' | 'large')
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
              {animalSizeError && (
                <p className="text-sm text-red-600">{animalSizeError}</p>
              )}
            </div>
          </>
        ) : (
          /* Stray Linkage */
          <div className="space-y-2">
            <Label htmlFor="strayId">Stray Animal ID</Label>
            <Input
              id="strayId"
              type="number"
              value={strayId || ''}
              onChange={e =>
                onStrayIdChange(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="Enter the ID of the stray animal you observed"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty if you're reporting a new animal not in the system.
              You can find the stray ID on the animal's profile page or from
              previous listings.
            </p>
            {strayIdError && (
              <p className="text-sm text-red-600">{strayIdError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
