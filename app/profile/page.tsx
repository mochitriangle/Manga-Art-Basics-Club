"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Profile } from "@/lib/types"
import { toast } from "sonner"

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")

  const supabase = createSupabaseClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
        setFullName(profileData?.full_name || "")
      }
      setIsLoading(false)
    }

    getProfile()
  }, [supabase])

  const handleUpdateProfile = async () => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id)

      if (error) {
        toast.error("Update failed: " + error.message)
      } else {
        setProfile({ ...profile, full_name: fullName })
        setIsEditing(false)
        toast.success("Profile updated successfully!")
      }
    } catch (error) {
      toast.error("Update failed, please try again")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">个人资料</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold">个人资料</h1>
        <p className="text-muted-foreground mt-4">Unable to load profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.id} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={profile.role} disabled />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            {isEditing ? (
              <div className="flex space-x-2">
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Button onClick={handleUpdateProfile}>Save</Button>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  setFullName(profile.full_name || "")
                }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Input id="fullName" value={profile.full_name || "Not set"} disabled />
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
            )}
          </div>

                      <div className="space-y-2">
              <Label htmlFor="createdAt">Registration Date</Label>
              <Input 
                id="createdAt" 
                value={new Date(profile.created_at).toLocaleDateString('en-US')} 
                disabled 
              />
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
