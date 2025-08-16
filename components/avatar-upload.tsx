'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

interface AvatarUploadProps {
  user: User
  currentAvatarUrl?: string | null
  onAvatarUpdate: (newUrl: string) => void
}

export function AvatarUpload({ user, currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setFile(selectedFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    try {
      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldFileName = currentAvatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldFileName}`])
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast.success('Avatar updated successfully!')
      onAvatarUpdate(publicUrl)
      setFile(null)
      setPreview(null)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const removeAvatar = async () => {
    try {
      // Delete from storage
      if (currentAvatarUrl) {
        const fileName = currentAvatarUrl.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${fileName}`])
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Avatar removed successfully!')
      onAvatarUpdate('')
      setPreview(null)
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Failed to remove avatar')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={preview || currentAvatarUrl || ''} />
          <AvatarFallback>
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <Label htmlFor="avatar-upload">Profile Picture</Label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Max size: 5MB. Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </div>

      {file && (
        <div className="flex gap-2">
          <Button 
            onClick={handleUpload}
            disabled={uploading}
            size="sm"
          >
            {uploading ? 'Uploading...' : 'Upload Avatar'}
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null)
              setPreview(null)
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {currentAvatarUrl && !file && (
        <Button 
          variant="outline"
          size="sm"
          onClick={removeAvatar}
        >
          Remove Avatar
        </Button>
      )}
    </div>
  )
}