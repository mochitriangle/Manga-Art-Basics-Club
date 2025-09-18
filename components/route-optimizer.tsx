'use client'

import { useEffect } from 'react'

export function RouteOptimizer() {
  useEffect(() => {
    // Preload critical routes on hover
    const preloadRoute = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      link.as = 'document'
      document.head.appendChild(link)
    }

    // Add hover listeners for navigation links
    const navLinks = document.querySelectorAll('a[href^="/"]')
    navLinks.forEach(link => {
      const href = link.getAttribute('href')
      if (href && !href.includes('#') && !href.includes('?')) {
        link.addEventListener('mouseenter', () => {
          preloadRoute(href)
        }, { once: true })
      }
    })

    // Preload critical routes immediately
    const criticalRoutes = ['/about', '/homework', '/tutorials', '/competitions']
    criticalRoutes.forEach(route => {
      preloadRoute(route)
    })

    return () => {
      // Cleanup if needed
    }
  }, [])

  return null
}
