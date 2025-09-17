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
      <div className="poster-container border border-gray-200">
        <Image 
          src={poster.image_url} 
          alt={poster.title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true}
          loading="eager"
          fetchPriority="high"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          onError={(e) => {
            console.warn('Image failed to load, using fallback');
            // Fallback to regular img tag if Next.js Image fails
            e.currentTarget.style.display = 'none';
            const fallbackImg = document.createElement('img');
            fallbackImg.src = poster.image_url;
            fallbackImg.alt = poster.title;
            fallbackImg.className = 'w-full h-full object-contain';
            fallbackImg.style.position = 'absolute';
            fallbackImg.style.top = '0';
            fallbackImg.style.left = '0';
            fallbackImg.style.width = '100%';
            fallbackImg.style.height = '100%';
            e.currentTarget.parentNode?.appendChild(fallbackImg);
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
