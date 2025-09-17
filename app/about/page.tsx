'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { UserRole } from '@/lib/types'

interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  is_teacher: boolean
  email: string
}

export default function AboutPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>('student')
  const [newTeacherEmail, setNewTeacherEmail] = useState('')
  const [assigning, setAssigning] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchProfiles()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(profile?.role || 'student')
    }
  }

  const fetchProfiles = async () => {
    try {
      // Get all teacher profiles with basic info
      const { data: teacherProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, is_teacher')
        .eq('is_teacher', true)
        .order('role', { ascending: false }) // Admins first
        .order('full_name')

      if (profilesError) throw profilesError

      // For now, just use the profiles without emails to avoid the admin API issue
      const profilesWithEmails: Profile[] = (teacherProfiles || []).map((profile: any) => ({
        ...profile,
        email: profile.full_name || 'Unknown User' // Use name as placeholder for email
      }))

      setProfiles(profilesWithEmails)
    } catch (error) {
      console.error('Error fetching profiles:', error)
      toast.error('Failed to load teacher profiles')
    } finally {
      setLoading(false)
    }
  }

  const assignTeacher = async (email: string) => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setAssigning(true)
    try {
      // Call the server-side API route for teacher assignment
      const response = await fetch('/api/assign-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign teacher')
      }

      toast.success(result.message || 'Teacher assigned successfully!')
      setNewTeacherEmail('')
      fetchProfiles() // Refresh the list
    } catch (error) {
      console.error('Error assigning teacher:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to assign teacher role')
    } finally {
      setAssigning(false)
    }
  }

  const removeTeacher = async (profileId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_teacher: false,
          role: 'student' // Reset to student role
        })
        .eq('id', profileId)

      if (error) throw error

      toast.success(`${email} is no longer a teacher`)
      fetchProfiles() // Refresh the list
    } catch (error) {
      console.error('Error removing teacher:', error)
      toast.error('Failed to remove teacher role')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading teacher profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">About Our Club</h1>
        <p className="text-lg text-muted-foreground">
          Meet the dedicated teachers and staff who make our Manga & Art Basics Club possible.
        </p>
      </div>

      {/* Promotional Block */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center justify-center gap-2">
              🎨 Draw your dream, start from the basics!
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  🎨 Every Tuesday – Professional Art Classes
                </h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Stickman & Blockman frameworks</li>
                  <li>• Proportion & dynamic poses</li>
                  <li>• Shape simplification & perspective</li>
                  <li>• Light, shadow & tonal layering</li>
                  <li>• Quick sketching methods that actually work</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                  🎮 Every Thursday – Social Activities
                </h3>
                <p className="text-sm text-gray-700">
                  Anime & manga sharing · Music · Games · Meet like-minded friends!
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">📍 Room 203</span>
              <span className="flex items-center gap-1">🌐 manga-art-basics-club.vercel.app</span>
            </div>
            
            <blockquote className="text-lg font-semibold text-orange-600 italic">
              🔥 "Stop copying—start creating! Build your art from the ground up."
            </blockquote>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Assignment (Admin Only) */}
      {userRole === 'admin' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assign New Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="teacher-email">Teacher Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => assignTeacher(newTeacherEmail)}
                disabled={assigning}
                className="mt-6"
              >
                {assigning ? 'Assigning...' : 'Assign Teacher'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teacher Profiles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="text-center">
            <CardContent className="pt-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>
                  {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="font-semibold text-lg mb-1">
                {profile.full_name || 'Unnamed Teacher'}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-2">
                {profile.email}
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {profile.role === 'admin' ? 'Administrator' : 'Teacher'}
                </span>
              </div>

              {/* Remove Teacher Button (Admin Only) */}
              {userRole === 'admin' && profile.role !== 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTeacher(profile.id, profile.email)}
                  className="w-full"
                >
                  Remove Teacher
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <p>No teachers assigned yet.</p>
          {userRole === 'admin' && (
            <p className="text-sm mt-2">Use the form above to assign teachers.</p>
          )}
        </div>
      )}
    </div>
  )
}