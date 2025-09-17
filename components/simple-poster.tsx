'use client'

import { memo } from 'react'

interface SimplePosterProps {
  poster: {
    id: string
    title: string
    description?: string
    image_url: string
  }
}

export const SimplePoster = memo(function SimplePoster({ poster }: SimplePosterProps) {
  return (
    <div className="text-center space-y-3">
      <div className="poster-container border border-gray-200">
        <img 
          src={poster.image_url} 
          alt={poster.title}
          className="w-full h-full object-contain"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          loading="eager"
          fetchPriority="high"
          onError={(e) => {
            console.warn('Fallback image also failed to load:', poster.image_url);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-stable">{poster.title}</h4>
        {poster.description && (
          <p className="text-sm text-gray-600 mt-1 text-stable">{poster.description}</p>
        )}
      </div>
    </div>
  )
})
