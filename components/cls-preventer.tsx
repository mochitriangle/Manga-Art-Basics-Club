'use client'

import { useEffect } from 'react'

export function CLSPreventer() {
  useEffect(() => {
    // Immediate CLS prevention
    const preventCLS = () => {
      // Force stable dimensions for all elements
      const allElements = document.querySelectorAll('*')
      
      allElements.forEach(el => {
        const element = el as HTMLElement
        
        // Set minimum dimensions for elements that might shift
        if (element.offsetHeight > 0 && !element.style.minHeight) {
          element.style.minHeight = element.offsetHeight + 'px'
        }
        
        // Prevent font loading shifts
        if (element.tagName.match(/^H[1-6]$|^P$/)) {
          element.style.contain = 'layout style'
          element.style.minHeight = '1.2em'
        }
        
        // Stabilize images
        if (element.tagName === 'IMG') {
          const img = element as HTMLImageElement
          if (img.naturalWidth && img.naturalHeight) {
            const aspectRatio = img.naturalWidth / img.naturalHeight
            img.style.aspectRatio = aspectRatio.toString()
            img.style.minHeight = '100px'
          }
        }
        
        // Stabilize containers
        if (element.classList.contains('container') || 
            element.classList.contains('max-w-4xl') || 
            element.classList.contains('max-w-6xl')) {
          element.style.minHeight = Math.max(element.offsetHeight, 100) + 'px'
        }
      })
    }

    // Run immediately
    preventCLS()
    
    // Run on load and resize
    window.addEventListener('load', preventCLS)
    window.addEventListener('resize', preventCLS)
    
    // Run periodically to catch dynamic content
    const interval = setInterval(preventCLS, 1000)
    
    return () => {
      window.removeEventListener('load', preventCLS)
      window.removeEventListener('resize', preventCLS)
      clearInterval(interval)
    }
  }, [])

  return null
}
