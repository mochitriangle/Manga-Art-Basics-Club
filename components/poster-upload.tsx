'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function PosterUpload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createSupabaseClient()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) {
      toast.error('Please fill in all fields and select a file')
      return
    }

    setUploading(true)
    try {
      // Upload image to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posters')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posters')
        .getPublicUrl(fileName)

      // Save poster to database
      const { error: dbError } = await supabase
        .from('posters')
        .insert({
          title: title.trim(),
          description: description.trim(),
          image_url: publicUrl
        })

      if (dbError) throw dbError

      toast.success('Poster uploaded successfully!')
      setTitle('')
      setDescription('')
      setFile(null)
      
      // Refresh the page to show new poster
      window.location.reload()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload poster')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4 mt-4 p-4 border rounded-lg">
      <h4 className="font-semibold">Upload New Poster</h4>
      
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Poster title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Poster description"
        />
      </div>

      <div>
        <Label htmlFor="file">Image File</Label>
        <Input
          id="file"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <Button type="submit" disabled={uploading} className="w-full">
        {uploading ? 'Uploading...' : 'Upload Poster'}
      </Button>
    </form>
  )
}