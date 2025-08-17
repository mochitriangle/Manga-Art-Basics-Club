import { createSupabaseServer } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { PosterUpload } from '@/components/poster-upload'

export default async function HomePage() {
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
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight">Manga & Art Basics Club</h1>
        <p className="text-xl text-muted-foreground">Offline: RC Palmer Secondary School</p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Side - Action Buttons */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Button asChild size="lg" className="h-16 text-base font-medium">
              <Link href="/tutorials">Tutorials</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-16 bg-transparent text-base font-medium">
              <Link href="/competitions">Competitions</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-16 bg-transparent text-base font-medium">
              <Link href="/homework">Hand In Homework</Link>
            </Button>
          </div>
        </div>

        {/* Right Side - Upcoming Poster */}
        <div className="lg:col-span-1 lg:sticky lg:top-8">
          <Card className="aspect-video h-full shadow-sm border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Upcoming Posters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 p-4">
              {posters && posters.length > 0 ? (
                <div className="space-y-4">
                  {posters.map((poster) => (
                    <div key={poster.id} className="text-center space-y-2">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border">
                        <img 
                          src={poster.image_url} 
                          alt={poster.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="px-2">
                        <h4 className="font-semibold text-sm">{poster.title}</h4>
                        {poster.description && (
                          <p className="text-xs text-muted-foreground mt-1">{poster.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center mb-3 border">
                    <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
                  </div>
                  <p className="text-sm font-medium">No posters available</p>
                </div>
              )}
              
              {/* Show upload button for admins/staff */}
              {(userRole === 'admin' || userRole === 'staff') && (
                <div className="mt-4 pt-4 border-t">
                  <PosterUpload />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}