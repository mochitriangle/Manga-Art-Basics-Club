"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Competition, Profile } from "@/lib/types"
import { toast } from "sonner"
import { Edit, Plus } from "lucide-react"

export function CompetitionClient() {
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
      
      // Refresh page to show new competitions
      window.location.reload()
    } catch (error) {
      toast.error("Operation failed, please try again")
    }
  }

  // Only show admin controls if user has permission
  if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'staff')) {
    return null
  }

  return (
    <div className="text-center">
      <Button onClick={() => handleOpenDialog()} className="gap-2">
        <Plus className="h-4 w-4" />
        Create New Competition
      </Button>

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
