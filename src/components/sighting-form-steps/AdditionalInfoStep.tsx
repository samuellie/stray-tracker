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

interface AdditionalInfoStepProps {
  weatherCondition?: string
  onWeatherConditionChange: (value: string) => void
  confidence?: number
  onConfidenceChange: (value: number) => void
  notes: string
  onNotesChange: (value: string) => void
}

export function AdditionalInfoStep({
  weatherCondition,
  onWeatherConditionChange,
  confidence,
  onConfidenceChange,
  notes,
  onNotesChange,
}: AdditionalInfoStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Additional Information</h2>
      <p className="text-sm text-muted-foreground">
        Provide any additional details that might help with animal
        identification or care.
      </p>

      <div className="space-y-4">
        {/* Weather Conditions */}
        <div className="space-y-2">
          <Label htmlFor="weatherCondition">Weather Conditions</Label>
          <Input
            id="weatherCondition"
            value={weatherCondition || ''}
            onChange={e => onWeatherConditionChange(e.target.value)}
            placeholder="e.g. sunny, cloudy, rainy"
          />
        </div>

        {/* Confidence Level */}
        <div className="space-y-2">
          <Label htmlFor="confidence">Confidence Level</Label>
          <Select
            value={confidence?.toString()}
            onValueChange={value => onConfidenceChange(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="How sure are you about the identification?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Very Unsure</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="10">10 - Very Confident</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Any additional information that might be helpful for animal care or identification..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
