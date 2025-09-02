'use client'

import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyLoaderProps {
  page: 'tutorials' | 'competitions' | 'about' | 'homework'
  fallback?: React.ReactNode
}

const LazyTutorials = lazy(() => import('@/app/tutorials/page'))
const LazyCompetitions = lazy(() => import('@/app/competitions/page'))
const LazyAbout = lazy(() => import('@/app/about/page'))
const LazyHomework = lazy(() => import('@/app/homework/page'))

const DefaultFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
)

export function LazyLoader({ page, fallback = <DefaultFallback /> }: LazyLoaderProps) {
  const renderPage = () => {
    switch (page) {
      case 'tutorials':
        return <LazyTutorials />
      case 'competitions':
        return <LazyCompetitions />
      case 'about':
        return <LazyAbout />
      case 'homework':
        return <LazyHomework />
      default:
        return <div>Page not found</div>
    }
  }

  return (
    <Suspense fallback={fallback}>
      {renderPage()}
    </Suspense>
  )
}
