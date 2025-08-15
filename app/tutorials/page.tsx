"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Tutorial, Profile, Submission } from "@/lib/types"
import { toast } from "sonner"
import { Plus, Upload, Play, FileText } from "lucide-react"

const categories = ['Digital Art', 'Quick Sketch', 'Sketching', 'Color'] as const

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadCategory, setUploadCategory] = useState<string>("")
  const [uploadVideo, setUploadVideo] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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

        // Get user's submissions
        const { data: userSubmissions } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id)
        setSubmissions(userSubmissions || [])
      }

      // Get all tutorials
      const { data: tutorialsData } = await supabase
        .from('tutorials')
        .select('*')
        .order('order_index')
        .order('created_at')

      setTutorials(tutorialsData || [])
      setIsLoading(false)
    }

    getData()
  }, [supabase])

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadTitle || !uploadCategory || !uploadVideo || !currentUser) return

    setIsUploading(true)
    try {
      // Upload video to storage
      const fileName = `${Date.now()}-${uploadVideo.name}`
      const { error: uploadError } = await supabase.storage
        .from('tutorials')
        .upload(fileName, uploadVideo)

      if (uploadError) {
        toast.error("Video upload failed: " + uploadError.message)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tutorials')
        .getPublicUrl(fileName)

      // Create tutorial record
      const { error: dbError } = await supabase
        .from('tutorials')
        .insert({
          title: uploadTitle,
          category: uploadCategory,
          video_url: publicUrl,
          order_index: tutorials.filter(t => t.category === uploadCategory).length
        })

      if (dbError) {
        toast.error("Failed to create tutorial: " + dbError.message)
        // Delete uploaded file if DB insert fails
        await supabase.storage.from('tutorials').remove([fileName])
        return
      }

              toast.success("Tutorial uploaded successfully!")
      setIsUploadDialogOpen(false)
      setUploadTitle("")
      setUploadCategory("")
      setUploadVideo(null)
      
      // Refresh tutorials
      const { data: newTutorials } = await supabase
        .from('tutorials')
        .select('*')
        .order('order_index')
        .order('created_at')
      setTutorials(newTutorials || [])
    } catch (error) {
      toast.error("Upload failed, please try again")
    } finally {
      setIsUploading(false)
    }
  }

  const handleHomeworkSubmit = async (tutorialId: string, file: File) => {
    if (!currentUser) return

    try {
      const fileName = `${currentUser.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('homework')
        .upload(fileName, file)

      if (uploadError) {
        toast.error("Homework upload failed: " + uploadError.message)
        return
      }

      // Create submission record
      const { error: dbError } = await supabase
        .from('submissions')
        .insert({
          user_id: currentUser.id,
          lesson_id: tutorialId,
          file_path: fileName
        })

      if (dbError) {
        toast.error("Failed to create submission record: " + dbError.message)
        await supabase.storage.from('homework').remove([fileName])
        return
      }

              toast.success("Homework submitted successfully!")
      
      // Refresh submissions
      const { data: newSubmissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', currentUser.id)
      setSubmissions(newSubmissions || [])
    } catch (error) {
      toast.error("Submission failed, please try again")
    }
  }

  const getTutorialsByCategory = (category: string) => {
    return tutorials.filter(t => t.category === category)
  }

  const hasSubmitted = (tutorialId: string) => {
    return submissions.some(s => s.lesson_id === tutorialId)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Tutorials</h1>
          <p className="text-lg text-muted-foreground">Master the fundamentals with our comprehensive tutorial library</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-semibold">{category}</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Tutorials</h1>
        <p className="text-lg text-muted-foreground">Master the fundamentals with our comprehensive tutorial library</p>
        
        {/* Upload Button for Staff/Admin */}
        {(currentProfile?.role === 'admin' || currentProfile?.role === 'staff') && (
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
                        <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Upload New Tutorial
          </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Tutorial</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleVideoUpload} className="space-y-4">
                                  <div className="space-y-2">
                    <Label htmlFor="title">Tutorial Title</Label>
                    <Input
                      id="title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={uploadCategory} onValueChange={setUploadCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video">Video File</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setUploadVideo(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isUploading} className="w-full">
                    {isUploading ? "Uploading..." : "Upload Tutorial"}
                  </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tutorial Categories Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-semibold">{category}</h2>

            <div className="space-y-3">
              {getTutorialsByCategory(category).length > 0 ? (
                getTutorialsByCategory(category).map((tutorial) => (
                  <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-3">
                        <CardTitle className="text-base leading-tight">{tutorial.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="shrink-0">
                            <Play className="h-3 w-3 mr-1" />
                            Watch
                          </Badge>
                          {hasSubmitted(tutorial.id) && (
                            <Badge variant="secondary" className="shrink-0">
                              <FileText className="h-3 w-3 mr-1" />
                              Submitted
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(tutorial.video_url, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Watch Video
                        </Button>
                        
                        {/* Homework submission for students */}
                        {currentProfile?.role === 'student' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-1" />
                                {hasSubmitted(tutorial.id) ? "Resubmit" : "Submit Homework"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submit Homework</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                                  <p className="text-sm text-muted-foreground">
                    Please upload your homework file
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="homework">Homework File</Label>
                                  <Input
                                    id="homework"
                                    type="file"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleHomeworkSubmit(tutorial.id, file)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  No tutorials available
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
