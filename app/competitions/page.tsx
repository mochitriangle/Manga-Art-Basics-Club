"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Competition, Profile } from "@/lib/types"
import { toast } from "sonner"
import { Edit, Plus, Calendar, Trophy } from "lucide-react"

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    start_at: "",
    end_at: "",
    awards: [""],
    published: false
  })

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

      // Get published competitions
      const { data: competitionsData } = await supabase
        .from('competitions')
        .select('*')
        .eq('published', true)
        .order('start_at', { ascending: false })

      setCompetitions(competitionsData || [])
      setIsLoading(false)
    }

    getData()
  }, [supabase])

  const resetForm = () => {
    setFormData({
      title: "",
      body: "",
      start_at: "",
      end_at: "",
      awards: [""],
      published: false
    })
    setEditingCompetition(null)
  }

  const handleOpenDialog = (competition?: Competition) => {
    if (competition) {
      setEditingCompetition(competition)
      setFormData({
        title: competition.title,
        body: competition.body,
        start_at: competition.start_at.split('T')[0],
        end_at: competition.end_at.split('T')[0],
        awards: competition.awards.length > 0 ? competition.awards : [""],
        published: competition.published
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleAddAward = () => {
    setFormData(prev => ({
      ...prev,
      awards: [...prev.awards, ""]
    }))
  }

  const handleRemoveAward = (index: number) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }))
  }

  const handleAwardChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.map((award, i) => i === index ? value : award)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      const competitionData = {
        title: formData.title,
        body: formData.body,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        awards: formData.awards.filter(award => award.trim() !== ""),
        published: formData.published,
        created_by: currentUser.id
      }

      if (editingCompetition) {
        // Update existing competition
        const { error } = await supabase
          .from('competitions')
          .update(competitionData)
          .eq('id', editingCompetition.id)

        if (error) {
          toast.error("Update failed: " + error.message)
          return
        }

        toast.success("Competition updated successfully!")
      } else {
        // Create new competition
        const { error } = await supabase
          .from('competitions')
          .insert(competitionData)

        if (error) {
          toast.error("Creation failed: " + error.message)
          return
        }

        toast.success("Competition created successfully!")
      }

      setIsDialogOpen(false)
      resetForm()
      
      // Refresh competitions
      const { data: newCompetitions } = await supabase
        .from('competitions')
        .select('*')
        .eq('published', true)
        .order('start_at', { ascending: false })
      setCompetitions(newCompetitions || [])
    } catch (error) {
      toast.error("Operation failed, please try again")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US')
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Competitions</h1>
          <p className="text-lg text-muted-foreground">Showcase your skills and win amazing prizes</p>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Competitions</h1>
        <p className="text-lg text-muted-foreground">Showcase your skills and win amazing prizes</p>
        
        {/* Create Button for Staff/Admin */}
        {(currentProfile?.role === 'admin' || currentProfile?.role === 'staff') && (
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Competition
          </Button>
        )}
      </div>

      {/* Competitions List */}
      <div className="space-y-6">
        {competitions.length > 0 ? (
          competitions.map((competition) => (
            <Card key={competition.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{competition.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(competition.start_at)} - {formatDate(competition.end_at)}
                      </span>
                    </div>
                  </div>
                  {(currentProfile?.role === 'admin' || currentProfile?.role === 'staff') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenDialog(competition)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">{competition.body}</p>
                  </div>
                  
                  {competition.awards.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        First Place Prizes:
                      </h4>
                      <ul className="space-y-1">
                        {competition.awards.map((award, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-1.5">•</span>
                            <span>{award}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No Competitions</h3>
                <p className="text-muted-foreground">There are no ongoing competitions at the moment</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCompetition ? "Edit Competition" : "Create New Competition"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                  <Label htmlFor="title">Competition Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="published">Publish Status</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="published" className="text-sm">Publish Now</Label>
                  </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_at">Start Date</Label>
                <Input
                  id="start_at"
                  type="date"
                  value={formData.start_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_at">End Date</Label>
                <Input
                  id="end_at"
                  type="date"
                      value={formData.end_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
                      required
                    />
                  </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Competition Description</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                rows={4}
                required
              />
            </div>

                          <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prizes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAward}
                  >
                    Add Prize
                  </Button>
                </div>
              <div className="space-y-2">
                {formData.awards.map((award, index) => (
                  <div key={index} className="flex gap-2">
                                          <Input
                        value={award}
                        onChange={(e) => handleAwardChange(index, e.target.value)}
                        placeholder="Prize description"
                      />
                      {formData.awards.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAward(index)}
                        >
                          Remove
                        </Button>
                      )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCompetition ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
