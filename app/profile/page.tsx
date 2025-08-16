'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AvatarUpload } from '@/components/avatar-upload'
import { UserRole } from '@/lib/types'

interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to view your profile')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(profileData)
      setFullName(profileData.full_name || '')
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() || null })
        .eq('id', profile.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, full_name: fullName.trim() || null } : null)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpdate = (newUrl: string) => {
    setProfile(prev => prev ? { ...prev, avatar_url: newUrl } : null)
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>
                  {profile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {profile.full_name || 'Unnamed User'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {profile.id}
                </p>
              </div>
            </div>

            {/* Avatar Upload */}
            <AvatarUpload
              user={{ id: profile.id } as any}
              currentAvatarUrl={profile.avatar_url}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              {editing ? (
                <div className="flex gap-2">
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      setFullName(profile.full_name || '')
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {profile.full_name || 'No name set'}
                  </span>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2">
                <Badge variant={profile.role === 'admin' ? 'destructive' : 'secondary'}>
                  {profile.role === 'admin' ? 'Administrator' : 
                   profile.role === 'staff' ? 'Staff' : 'Student'}
                </Badge>
                {profile.role === 'admin' && (
                  <span className="text-xs text-muted-foreground">
                    Full access to all features
                  </span>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/tutorials">Browse Tutorials</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/competitions">View Competitions</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/homework">Submit Homework</a>
            </Button>
            {profile.role === 'admin' && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin">Admin Panel</a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}