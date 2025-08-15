"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Save, X } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Profile } from "@/lib/types"
import { toast } from "sonner"

export default function AboutPage() {
  const [staffMembers, setStaffMembers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)

  const supabase = createSupabaseClient()

  useEffect(() => {
    const getData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setCurrentProfile(profile)
      }

      // Get staff members (admin + staff)
      const { data: staff } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'staff'])
        .order('role', { ascending: false })
        .order('full_name')

      setStaffMembers(staff || [])
      setIsLoading(false)
    }

    getData()
  }, [supabase])

  const handleEdit = (staff: Profile) => {
    setEditingId(staff.id)
    setEditingName(staff.full_name || "")
  }

  const handleSave = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editingName })
        .eq('id', staffId)

      if (error) {
        toast.error("Update failed: " + error.message)
      } else {
        setStaffMembers(staffMembers.map(staff => 
          staff.id === staffId 
            ? { ...staff, full_name: editingName }
            : staff
        ))
        setEditingId(null)
        toast.success("Name updated successfully!")
      }
    } catch (error) {
      toast.error("Update failed, please try again")
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingName("")
  }

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="h-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Our Staff</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
      </div>

      {/* Club Description */}
      <div className="max-w-3xl mx-auto">
        <p className="text-lg leading-relaxed text-muted-foreground">
          Your gateway to mastering art—beginner to pro. Learn, compete, and grow with recorded club sessions,
          competition schedules, and assignments.
        </p>
      </div>

      {/* Our Staff Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Our Staff</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffMembers.map((staff) => (
            <Card key={staff.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {editingId === staff.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <CardTitle className="text-lg">{staff.full_name || "Name not set"}</CardTitle>
                    )}
                    <p className="text-sm text-muted-foreground">{staff.id}</p>
                  </div>
                  {currentProfile?.role === 'admin' && (
                    <div className="flex space-x-1">
                      {editingId === staff.id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleSave(staff.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
