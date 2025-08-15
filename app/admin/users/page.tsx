"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Profile } from "@/lib/types"
import { toast } from "sonner"
import { Users, Shield, UserCheck, UserX } from "lucide-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const supabase = createSupabaseClient()

  useEffect(() => {
    getUsers()
  }, [supabase])

  const getUsers = async () => {
    try {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(usersData || [])
    } catch (error) {
      toast.error("Failed to get user list")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        toast.error("Role update failed: " + error.message)
      } else {
        toast.success("User role updated successfully!")
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole as any } : user
        ))
      }
    } catch (error) {
      toast.error("Update failed, please try again")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'staff':
        return <UserCheck className="h-4 w-4 text-blue-600" />
      case 'student':
        return <UserX className="h-4 w-4 text-green-600" />
      default:
        return <UserX className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'staff':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'student':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">用户管理</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-lg text-muted-foreground">Manage user roles and permissions</p>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User List ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff' : 'Student'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {user.full_name || 'Name not set'}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.id}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Registration Date: {new Date(user.created_at).toLocaleDateString('en-US')}
                  </span>
                  
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => handleRoleUpdate(user.id, newRole)}
                    disabled={updatingUserId === user.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Role Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm">Admin: Full access permissions</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Staff: Content management and homework grading</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-green-600" />
              <span className="text-sm">Student: View content and submit homework</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
