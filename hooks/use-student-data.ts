import { useState, useEffect, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface StudentStats {
  overview: {
    totalLessons: number
    completedLessons: number
    progressPercentage: number
    averageScore: number
    totalSubmissions: number
    reviewedSubmissions: number
    pendingReviews: number
  }
  categories: Array<{
    category: string
    completed: number
    total: number
  }>
  recentActivity: {
    last30Days: number
    submissions: Array<{
      id: string
      lesson: string
      date: string
    }>
  }
  upcomingDeadlines: Array<{
    id: string
    title: string
    dueDate: string
    type: string
    awards: string[]
  }>
  achievements: {
    firstSubmission: string | null
    perfectScores: number
    streakDays: number
  }
}

interface UseStudentDataReturn {
  stats: StudentStats | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
  updateProgress: (lessonId: string, completed: boolean) => Promise<void>
}

export function useStudentData(): UseStudentDataReturn {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Fetch stats from our API
      const response = await fetch('/api/student-stats')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(`Failed to load stats: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const refreshStats = useCallback(async () => {
    await fetchStats()
  }, [fetchStats])

  const updateProgress = useCallback(async (lessonId: string, completed: boolean) => {
    try {
      // This would typically update the database
      // For now, we'll just refresh the stats
      await refreshStats()
      toast.success(completed ? 'Lesson marked as completed!' : 'Lesson marked as incomplete')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error(`Failed to update progress: ${errorMessage}`)
    }
  }, [refreshStats])

  // Fetch stats on mount
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Set up real-time subscription for live updates
  useEffect(() => {
    if (!stats) return

    const channel = supabase
      .channel('student-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
        },
        () => {
          // Refresh stats when submissions change
          refreshStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, stats, refreshStats])

  return {
    stats,
    loading,
    error,
    refreshStats,
    updateProgress
  }
}

// Additional utility hooks for specific data needs
export function useStudentProgress() {
  const { stats, loading, error } = useStudentData()
  
  return {
    progress: stats?.overview.progressPercentage || 0,
    completedLessons: stats?.overview.completedLessons || 0,
    totalLessons: stats?.overview.totalLessons || 0,
    averageScore: stats?.overview.averageScore || 0,
    loading,
    error
  }
}

export function useStudentAchievements() {
  const { stats, loading, error } = useStudentData()
  
  return {
    perfectScores: stats?.achievements.perfectScores || 0,
    streakDays: stats?.achievements.streakDays || 0,
    firstSubmission: stats?.achievements.firstSubmission,
    loading,
    error
  }
}

export function useUpcomingDeadlines() {
  const { stats, loading, error } = useStudentData()
  
  return {
    deadlines: stats?.upcomingDeadlines || [],
    loading,
    error
  }
}

