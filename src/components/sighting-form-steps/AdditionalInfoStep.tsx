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
  contactInfo: string
  onContactInfoChange: (value: string) => void
}

export function AdditionalInfoStep({
  weatherCondition,
  onWeatherConditionChange,
  confidence,
  onConfidenceChange,
  notes,
  onNotesChange,
  contactInfo,
  onContactInfoChange,
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
          <Select
            value={weatherCondition}
            onValueChange={onWeatherConditionChange}
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
              <SelectItem value="1">Very Unsure</SelectItem>
              <SelectItem value="2">Unsure</SelectItem>
              <SelectItem value="3">Somewhat Sure</SelectItem>
              <SelectItem value="4">Confident</SelectItem>
              <SelectItem value="5">Very Confident</SelectItem>
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

        {/* Contact Info */}
        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Information (Optional)</Label>
          <Input
            id="contactInfo"
            value={contactInfo}
            onChange={e => onContactInfoChange(e.target.value)}
            placeholder="Phone number or preferred contact method for follow-up"
          />
          <p className="text-sm text-muted-foreground">
            Only provide if you're willing to be contacted about this sighting.
          </p>
        </div>
      </div>
    </div>
  )
}
