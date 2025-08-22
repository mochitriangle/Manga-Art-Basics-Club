"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Submission, Review, Profile, Tutorial } from "@/lib/types"
import { toast } from "sonner"
import { Download, Star, FileText, User, Calendar, MessageSquare } from "lucide-react"

interface SubmissionWithDetails extends Submission {
  user: Profile
  lesson: Tutorial
  review?: Review
}

export default function HomeworkListPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewData, setReviewData] = useState({
    score: 0,
    feedback: ""
  })

  const supabase = createSupabaseClient()

  useEffect(() => {
    getSubmissions()
  }, [supabase])

  const getSubmissions = async () => {
    try {
      // Get all submissions with user and lesson details
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select(`
          *,
          user:profiles!submissions_user_id_fkey(*),
          lesson:tutorials!submissions_lesson_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (submissionsData) {
        // Get reviews for each submission
        const submissionsWithReviews = await Promise.all(
          submissionsData.map(async (submission: any) => {
            const { data: review } = await supabase
              .from('reviews')
              .select('*')
              .eq('submission_id', submission.id)
              .single()

            return {
              ...submission,
              review: review || undefined
            }
          })
        )

        setSubmissions(submissionsWithReviews)
      }
    } catch (error) {
      toast.error("Failed to get homework list")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('homework')
        .createSignedUrl(filePath, 600)

      if (error) {
        toast.error("Failed to generate download link: " + error.message)
        return
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = data.signedUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

              toast.success("Starting homework file download")
    } catch (error) {
              toast.error("Download failed, please try again")
    }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return

    try {
      const { error } = await supabase
        .from('reviews')
        .upsert({
          submission_id: selectedSubmission.id,
          reviewer: (await supabase.auth.getUser()).data.user?.id,
          score: reviewData.score,
          feedback: reviewData.feedback
        })

      if (error) {
        toast.error("Grading failed: " + error.message)
      } else {
        toast.success("Homework graded successfully!")
        setIsReviewDialogOpen(false)
        setReviewData({ score: 0, feedback: "" })
        setSelectedSubmission(null)
        
        // Refresh submissions
        getSubmissions()
      }
    } catch (error) {
              toast.error("Grading failed, please try again")
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Homework Management</h1>
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
        <h1 className="text-3xl font-bold">Homework Management</h1>
        <p className="text-lg text-muted-foreground">View and grade student homework submissions</p>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Homework List ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {submission.user.full_name || '未设置姓名'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-medium">课程：{submission.lesson.title}</div>
                        <div className="text-sm text-muted-foreground">
                          文件：{submission.file_path.split('/').pop()}
                        </div>
                      </div>

                      {submission.review && (
                        <div className="flex items-center gap-2">
                          <Star className={`h-4 w-4 ${getScoreColor(submission.review.score)}`} />
                          <span className={`font-medium ${getScoreColor(submission.review.score)}`}>
                            Score: {submission.review.score}/100
                          </span>
                          {submission.review.feedback && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {submission.review.feedback}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(submission.file_path, submission.file_path.split('/').pop() || 'homework')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      
                      {!submission.review && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setIsReviewDialogOpen(true)
                          }}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Grade
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No homework submissions yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Homework</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <div><strong>Student:</strong> {selectedSubmission.user.full_name || 'Name not set'}</div>
                  <div><strong>Lesson:</strong> {selectedSubmission.lesson.title}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedSubmission.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              <form onSubmit={handleReview} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score (0-100)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={reviewData.score}
                    onChange={(e) => setReviewData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={reviewData.feedback}
                    onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                    rows={4}
                    placeholder="Enter your evaluation and suggestions for the homework..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsReviewDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Grade
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
