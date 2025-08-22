'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Tutorial {
  id: string
  title: string
  description?: string
}

interface HomeworkUploadProps {
  tutorials: Tutorial[]
}

export function HomeworkUpload({ tutorials }: HomeworkUploadProps) {
  const [selectedTutorial, setSelectedTutorial] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [comments, setComments] = useState('')
  const [uploading, setUploading] = useState(false)
  const supabase = createSupabaseClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTutorial) {
      toast.error('Please select a tutorial')
      return
    }
    
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be signed in to submit homework')
        return
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('homework')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the file path
      const { data: { publicUrl } } = supabase.storage
        .from('homework')
        .getPublicUrl(fileName)

      // Create homework record in database
      const { error: dbError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          lesson_id: selectedTutorial,
          file_path: publicUrl
        })

      if (dbError) {
        // If database insert fails, remove the uploaded file
        await supabase.storage.from('homework').remove([fileName])
        throw dbError
      }

      toast.success('Homework submitted successfully!')
      
      // Reset form
      setSelectedTutorial('')
      setFile(null)
      setComments('')
      
      // Refresh the page to show new submission
      window.location.reload()
      
    } catch (error: any) {
      console.error('Homework submission error:', error)
      toast.error('Failed to submit homework: ' + (error.message || 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  if (tutorials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tutorials available for homework submission</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tutorial">Select Tutorial</Label>
        <Select value={selectedTutorial} onValueChange={setSelectedTutorial}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a tutorial for your homework" />
          </SelectTrigger>
          <SelectContent>
            {tutorials.map((tutorial) => (
              <SelectItem key={tutorial.id} value={tutorial.id}>
                {tutorial.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Homework File</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip,.rar"
          onChange={handleFileChange}
          required
        />
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, ZIP, RAR. Max size: 5MB
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments (Optional)</Label>
        <Textarea
          id="comments"
          placeholder="Add any comments about your homework submission..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={uploading || !selectedTutorial || !file}
      >
        {uploading ? 'Submitting...' : 'Submit Homework'}
      </Button>
    </form>
  )
}
