import { createSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get the current user from the request
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Only students can access this endpoint
    if (profile?.role !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Students only.' },
        { status: 403 }
      )
    }

    // Get comprehensive student statistics
    const [
      { count: totalLessons },
      { data: submissions },
      { data: competitions },
      { data: recentActivity }
    ] = await Promise.all([
      // Total available lessons
      supabase
        .from('tutorials')
        .select('*', { count: 'exact', head: true }),
      
      // User's submissions with scores
      supabase
        .from('submissions')
        .select(`
          id,
          created_at,
          tutorials!inner(title, category),
          reviews(score, feedback)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      
      // Upcoming competitions
      supabase
        .from('competitions')
        .select('id, title, end_at, awards')
        .eq('published', true)
        .gte('end_at', new Date().toISOString())
        .order('end_at', { ascending: true })
        .limit(5),
      
      // Recent activity (last 30 days)
      supabase
        .from('submissions')
        .select(`
          id,
          created_at,
          tutorials!inner(title)
        `)
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
    ])

    // Calculate statistics
    const completedLessons = submissions?.length || 0
    const totalLessonsCount = totalLessons || 0
    const progressPercentage = totalLessonsCount > 0 
      ? (completedLessons / totalLessonsCount) * 100 
      : 0

    // Calculate average score
    const scoredSubmissions = submissions?.filter(sub => sub.reviews?.[0]?.score) || []
    const averageScore = scoredSubmissions.length > 0 
      ? scoredSubmissions.reduce((acc, sub) => acc + (sub.reviews?.[0]?.score || 0), 0) / scoredSubmissions.length
      : 0

    // Get category breakdown
    const categoryStats = submissions?.reduce((acc, sub) => {
      const category = sub.tutorials.category
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Format response
    const stats = {
      overview: {
        totalLessons: totalLessonsCount,
        completedLessons,
        progressPercentage: Math.round(progressPercentage),
        averageScore: Math.round(averageScore),
        totalSubmissions: completedLessons,
        reviewedSubmissions: scoredSubmissions.length,
        pendingReviews: completedLessons - scoredSubmissions.length
      },
      categories: Object.entries(categoryStats).map(([category, count]) => ({
        category,
        completed: count,
        total: totalLessonsCount // This would ideally be per category
      })),
      recentActivity: {
        last30Days: recentActivity?.length || 0,
        submissions: recentActivity?.map(sub => ({
          id: sub.id,
          lesson: sub.tutorials.title,
          date: sub.created_at
        })) || []
      },
      upcomingDeadlines: competitions?.map(comp => ({
        id: comp.id,
        title: comp.title,
        dueDate: comp.end_at,
        type: 'competition',
        awards: comp.awards
      })) || [],
      achievements: {
        firstSubmission: submissions?.[submissions.length - 1]?.created_at || null,
        perfectScores: scoredSubmissions.filter(sub => (sub.reviews?.[0]?.score || 0) === 100).length,
        streakDays: calculateStreakDays(submissions || [])
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to calculate consecutive days of activity
function calculateStreakDays(submissions: any[]): number {
  if (submissions.length === 0) return 0
  
  const sortedDates = submissions
    .map(sub => new Date(sub.created_at).toDateString())
    .sort()
    .reverse()
  
  let streak = 1
  let currentDate = new Date(sortedDates[0])
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i])
    const diffTime = currentDate.getTime() - prevDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      streak++
      currentDate = prevDate
    } else {
      break
    }
  }
  
  return streak
}
