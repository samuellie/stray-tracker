import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

interface ObservationStepProps {
  description: string
  onDescriptionChange: (value: string) => void
  descriptionError?: string
  date: string
  onDateChange: (value: string) => void
  dateError?: string
}

export function ObservationStep({
  description,
  onDescriptionChange,
  descriptionError,
  date,
  onDateChange,
  dateError,
}: ObservationStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Observation Details</h2>
      <p className="text-sm text-muted-foreground">
        Describe what you observed and when it happened.
      </p>

      <div className="space-y-4">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Detailed Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="Describe what you observed: behavior, condition, any unusual markings, injuries, or other notable details..."
            rows={4}
          />
          <p className="text-sm text-muted-foreground">
            Helpful details include: animal behavior, health condition, specific
            markings, notable colors, or distinctive features.
          </p>
          {descriptionError && (
            <p className="text-sm text-red-600">{descriptionError}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="space-y-2">
          <Label htmlFor="date">When did you see the animal? *</Label>
          <Input
            id="date"
            type="datetime-local"
            value={date}
            onChange={e => onDateChange(e.target.value)}
          />
          {dateError && <p className="text-sm text-red-600">{dateError}</p>}
        </div>
      </div>
    </div>
  )
}
