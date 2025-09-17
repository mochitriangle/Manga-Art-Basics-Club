import { createSupabaseServer } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { PosterUpload } from '@/components/poster-upload'
import { SimplePoster } from '@/components/simple-poster'
import { Suspense } from 'react'

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-white layout-stable">
      {/* Hero Section */}
      <div className="text-center py-16 space-y-4">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 text-stable">Manga & Art Basics Club</h1>
        <p className="text-xl text-gray-600 text-stable">Offline: RC Palmer Secondary School</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Side - Action Buttons */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Button asChild size="lg" className="h-20 text-lg font-semibold btn-stable">
                <Link href="/tutorials">Tutorials</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-20 text-lg font-semibold btn-stable">
                <Link href="/homework">Hand In Homework</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-20 text-lg font-semibold btn-stable">
                <Link href="/competitions">Competitions</Link>
              </Button>
            </div>
          </div>

          {/* Right Side - Upcoming Poster */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">WELCOME!</h3>
              
              {/* Async poster loading */}
              <Suspense fallback={<PosterSkeleton />}>
                <PosterSection />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton loading component
function PosterSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-full aspect-video rounded-lg bg-gray-200 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
      </div>
    </div>
  )
}

// Separate component for async poster loading
async function PosterSection() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile to check role
  let userRole = 'student'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role || 'student'
  }

  // Get active posters
  const { data: posters } = await supabase
    .from('posters')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <>
      {posters && posters.length > 0 ? (
        <div className="space-y-6">
          {posters.map((poster) => (
            <SimplePoster key={poster.id} poster={poster} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4 border border-gray-200">
            <div className="w-10 h-10 bg-gray-300 rounded"></div>
          </div>
          <p className="text-gray-600 font-medium text-stable">No posters available</p>
        </div>
      )}
      
      {/* Show upload button for admins/staff */}
      {(userRole === 'admin' || userRole === 'staff') && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <PosterUpload />
        </div>
      )}
    </>
  )
}