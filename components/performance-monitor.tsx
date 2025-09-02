'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Performance monitoring
    if (typeof window !== 'undefined') {
      // Track Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime, 'ms')
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime, 'ms')
          }
          if (entry.entryType === 'layout-shift') {
            console.log('CLS:', entry.value)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
      } catch (e) {
        // Fallback for older browsers
        console.log('PerformanceObserver not supported')
      }

      // Track page load performance
      window.addEventListener('load', () => {
        if ('performance' in window) {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          if (perfData) {
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart
            const domTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart
            
            if (loadTime > 0) {
              console.log('Page Load Time:', loadTime, 'ms')
            }
            if (domTime > 0) {
              console.log('DOM Content Loaded:', domTime, 'ms')
            }
            
            // Log performance issues
            if (loadTime > 3000) {
              console.warn('⚠️ Slow page load detected:', loadTime, 'ms')
            }
            if (domTime > 1500) {
              console.warn('⚠️ Slow DOM content loaded:', domTime, 'ms')
            }
          }
        }
      })

      // Track resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            if (resourceEntry.duration > 1000) {
              console.warn('⚠️ Slow resource load:', resourceEntry.name, resourceEntry.duration, 'ms')
            }
          }
        }
      })

      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
      } catch (e) {
        // Fallback
      }
    }
  }, [])

  return null // This component doesn't render anything
}
