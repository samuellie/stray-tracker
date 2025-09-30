import React from 'react'

interface MapProps {
  className?: string
  height?: string
}

export function Map({ className = '', height = 'h-96' }: MapProps) {
  return (
    <div
      className={`relative ${height} bg-gray-100 rounded-lg overflow-hidden ${className}`}
    >
      {/* Dummy map visualization */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-green-100 to-blue-300">
        {/* Map border */}
        <div className="absolute inset-2 border-2 border-blue-500 rounded-md">
          {/* City grid pattern */}
          <div className="absolute inset-4 grid grid-cols-8 grid-rows-6 gap-1">
            {/* Street intersections */}
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full ${
                  i % 3 === 0 ? 'bg-yellow-400 w-2 h-2' : 'bg-gray-400 w-1 h-1'
                }`}
              />
            ))}
          </div>

          {/* Sighting markers */}
          <div className="absolute top-8 left-12">
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse" />
          </div>
          <div className="absolute top-16 right-8">
            <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-md" />
          </div>
          <div className="absolute bottom-12 left-16">
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md" />
          </div>
          <div className="absolute bottom-8 right-20">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse" />
          </div>

          {/* Legend */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Recent</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>1-2 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Older</span>
            </div>
          </div>
        </div>

        {/* Map labels */}
        <div className="absolute bottom-4 left-4 text-sm font-semibold text-gray-700">
          Downtown Area
        </div>
        <div className="absolute top-4 left-8 text-sm font-semibold text-gray-700">
          Central Park
        </div>
      </div>

      {/* Dummy controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 flex gap-1">
        <button className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold">
          +
        </button>
        <button className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold">
          −
        </button>
      </div>

      {/* Loading overlay (optional, can be toggled) */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm hidden">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    </div>
  )
}
