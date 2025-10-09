import { Popup } from 'react-map-gl/maplibre'
import type { Sighting, Stray } from 'db/schema'

interface SightingPopupProps {
  selectedSighting: (Sighting & { stray: Stray }) | null
  onClose: () => void
}

export function SightingPopup({
  selectedSighting,
  onClose,
}: SightingPopupProps) {
  if (!selectedSighting) return null

  return (
    <Popup
      longitude={selectedSighting.lng}
      latitude={selectedSighting.lat}
      onClose={onClose}
      closeOnClick={false}
      className="max-w-sm"
    >
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">
          {selectedSighting.stray.species.charAt(0).toUpperCase() +
            selectedSighting.stray.species.slice(1)}{' '}
          Details
        </h3>
        <div className="space-y-1 text-sm">
          {selectedSighting.stray.name && (
            <p>
              <strong>Name:</strong> {selectedSighting.stray.name}
            </p>
          )}
          <p>
            <strong>Breed:</strong> {selectedSighting.stray.breed || 'Unknown'}
          </p>
          <p>
            <strong>Age:</strong> {selectedSighting.stray.age || 'Unknown'}
          </p>
          <p>
            <strong>Size:</strong> {selectedSighting.stray.size}
          </p>
          <p>
            <strong>Colors:</strong>{' '}
            {selectedSighting.stray.colors || 'Unknown'}
          </p>
          <p>
            <strong>Markings:</strong>{' '}
            {selectedSighting.stray.markings || 'None'}
          </p>
          <p>
            <strong>Status:</strong> {selectedSighting.stray.status}
          </p>
          {selectedSighting.stray.description && (
            <p>
              <strong>Description:</strong> {selectedSighting.stray.description}
            </p>
          )}
          {selectedSighting.stray.healthNotes && (
            <p>
              <strong>Health Notes:</strong>{' '}
              {selectedSighting.stray.healthNotes}
            </p>
          )}
          {selectedSighting.stray.careRequirements && (
            <p>
              <strong>Care Requirements:</strong>{' '}
              {selectedSighting.stray.careRequirements}
            </p>
          )}
        </div>
        <hr className="my-3" />
        <h4 className="font-semibold mb-2">Sighting Details</h4>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Sighting Time:</strong>{' '}
            {new Date(
              Number(selectedSighting.sightingTime) * 1000
            ).toLocaleString()}
          </p>
          {selectedSighting.description && (
            <p>
              <strong>Description:</strong> {selectedSighting.description}
            </p>
          )}
          {selectedSighting.weatherCondition && (
            <p>
              <strong>Weather:</strong> {selectedSighting.weatherCondition}
            </p>
          )}
          {selectedSighting.confidence && (
            <p>
              <strong>Confidence:</strong> {selectedSighting.confidence}
              /10
            </p>
          )}
          {selectedSighting.notes && (
            <p>
              <strong>Notes:</strong> {selectedSighting.notes}
            </p>
          )}
          {selectedSighting.location && (
            <p>
              <strong>Location:</strong>{' '}
              {[
                selectedSighting.location.address1,
                selectedSighting.location.address2,
                selectedSighting.location.city,
                selectedSighting.location.postcode,
                selectedSighting.location.country,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
          <p>
            <strong>Reported:</strong>{' '}
            {new Date(
              Number(selectedSighting.createdAt) * 1000
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </Popup>
  )
}
