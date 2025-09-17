'use client'

import { memo } from 'react'
import Image from 'next/image'

interface OptimizedPosterProps {
  poster: {
    id: string
    title: string
    description?: string
    image_url: string
  }
}

export const OptimizedPoster = memo(function OptimizedPoster({ poster }: OptimizedPosterProps) {
  return (
    <div className="text-center space-y-3">
      <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200" style={{aspectRatio: '1650/2562'}}>
        <Image 
          src={poster.image_url} 
          alt={poster.title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
