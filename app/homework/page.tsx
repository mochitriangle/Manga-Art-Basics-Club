import { createSupabaseServer } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { HomeworkUpload } from '@/components/homework-upload'
import { Suspense } from 'react'

export default async function HomeworkPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Homework Submission</h1>
          <p className="text-muted-foreground">Please sign in to access homework submission.</p>
        </div>
      </div>
    )
  }

  // Get all data in parallel for better performance
  const [profileResult, submissionsResult, tutorialsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tutorials')
      .select('*')
      .order('created_at', { ascending: false })
  ])

  const { data: profile } = profileResult
  const { data: submissions } = submissionsResult
  const { data: tutorials } = tutorialsResult

  // Get tutorial details for submissions
  let submissionsWithTutorials: any[] = []
  if (submissions && tutorials) {
    const tutorialsMap = new Map(tutorials.map(t => [t.id, t]))
    
    submissionsWithTutorials = submissions.map(submission => ({
      ...submission,
      tutorial: tutorialsMap.get(submission.lesson_id)
    }))
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Homework Submission</h1>
          <p className="text-muted-foreground">
            Submit your homework assignments and track your progress
          </p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm text-muted-foreground">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <Label>Role</Label>
                <p className="text-sm text-muted-foreground capitalize">{profile?.role || 'student'}</p>
              </div>
              <div>
                <Label>Member Since</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit New Homework */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Homework</CardTitle>
          </CardHeader>
          <CardContent>
            <HomeworkUpload tutorials={tutorials || []} />
          </CardContent>
        </Card>

        {/* Homework History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Homework History</CardTitle>
          </CardHeader>
          <CardContent>
                        {submissionsWithTutorials && submissionsWithTutorials.length > 0 ? (
              <div className="space-y-4">
                {submissionsWithTutorials.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {submission.tutorial?.title || 'Unknown Tutorial'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Review
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={submission.file_path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View Submission
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-muted-foreground rounded"></div>
                </div>
                <p className="text-muted-foreground">No homework submissions yet</p>
                <p className="text-sm text-muted-foreground">Submit your first assignment above!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
