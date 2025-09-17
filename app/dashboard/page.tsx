'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, BookOpen, Trophy, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface StudentProgress {
  totalLessons: number
  completedLessons: number
  averageScore: number
  recentSubmissions: Array<{
    id: string
    lessonTitle: string
    score: number | null
    submittedAt: string
    status: 'pending' | 'reviewed'
  }>
  upcomingDeadlines: Array<{
    id: string
    title: string
    dueDate: string
    category: string
  }>
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to view your dashboard')
        return
      }
      setUser(user)

      // Get total lessons count
      const { count: totalLessons } = await supabase
        .from('tutorials')
        .select('*', { count: 'exact', head: true })

      // Get user's submissions
      const { data: submissions } = await supabase
        .from('submissions')
        .select(`
          id,
          created_at,
          tutorials!inner(title, category),
          reviews(score)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Get upcoming competitions as deadlines
      const { data: competitions } = await supabase
        .from('competitions')
        .select('id, title, end_at, awards')
        .eq('published', true)
        .gte('end_at', new Date().toISOString())
        .order('end_at', { ascending: true })
        .limit(5)

      // Calculate progress
      const completedLessons = submissions?.length || 0
      const totalLessonsCount = totalLessons || 0
      const averageScore = submissions?.length > 0 
        ? submissions.reduce((acc, sub) => {
            const score = sub.reviews?.[0]?.score || 0
            return acc + score
          }, 0) / submissions.length
        : 0

      // Format recent submissions
      const recentSubmissions = (submissions || []).slice(0, 5).map(sub => ({
        id: sub.id,
        lessonTitle: sub.tutorials.title,
        score: sub.reviews?.[0]?.score || null,
        submittedAt: new Date(sub.created_at).toLocaleDateString(),
        status: sub.reviews?.length > 0 ? 'reviewed' : 'pending'
      }))

      // Format upcoming deadlines
      const upcomingDeadlines = (competitions || []).map(comp => ({
        id: comp.id,
        title: comp.title,
        dueDate: new Date(comp.end_at).toLocaleDateString(),
        category: 'Competition'
      }))

      setProgress({
        totalLessons: totalLessonsCount,
        completedLessons,
        averageScore: Math.round(averageScore),
        recentSubmissions,
        upcomingDeadlines
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load dashboard data.</p>
        </div>
      </div>
    )
  }

  const progressPercentage = progress.totalLessons > 0 
    ? (progress.completedLessons / progress.totalLessons) * 100 
    : 0

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}!</h1>
        <p className="text-muted-foreground">Track your progress and stay on top of your art journey</p>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.completedLessons}/{progress.totalLessons}</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(progressPercentage)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Based on {progress.recentSubmissions.filter(s => s.status === 'reviewed').length} reviewed submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress.recentSubmissions.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting for teacher feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming Deadlines */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progress.recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {progress.recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{submission.lessonTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {submission.submittedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.status === 'reviewed' ? (
                        <Badge variant="secondary">
                          {submission.score}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No submissions yet. Start your first lesson!
              </p>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/tutorials">View All Tutorials</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progress.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {progress.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {deadline.dueDate}
                      </p>
                    </div>
                    <Badge variant="destructive">{deadline.category}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No upcoming deadlines. Great job staying on track!
              </p>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/competitions">View Competitions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-20 flex-col gap-2">
              <Link href="/tutorials">
                <BookOpen className="h-6 w-6" />
                Start Learning
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/homework">
                <Upload className="h-6 w-6" />
                Submit Work
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/competitions">
                <Trophy className="h-6 w-6" />
                Join Competition
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

