'use client'

import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface OptimizedAvatarProps {
  profile: {
    id: string
    full_name: string | null
    role: string
    email: string
    avatar_url: string | null
  }
  userRole: string
  onRemoveTeacher: (profileId: string, email: string) => void
}

export const OptimizedAvatar = memo(function OptimizedAvatar({ 
  profile, 
  userRole, 
  onRemoveTeacher 
}: OptimizedAvatarProps) {
  return (
    <div className="text-center">
      <Avatar className="w-20 h-20 mx-auto mb-4">
        <AvatarImage 
          src={profile.avatar_url || ''} 
          alt={profile.full_name || 'User'}
          loading="lazy"
        />
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
          onClick={() => onRemoveTeacher(profile.id, profile.email)}
          className="w-full"
        >
          Remove Teacher
        </Button>
      )}
    </div>
  )
})
