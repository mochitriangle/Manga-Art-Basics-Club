import { createSupabaseServer } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Trophy } from "lucide-react"
import { CompetitionClient } from './competition-client'

export default async function CompetitionsPage() {
  const supabase = await createSupabaseServer()
  
  // Get published competitions
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .eq('published', true)
    .order('start_at', { ascending: false })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Competitions</h1>
        <p className="text-lg text-muted-foreground">Showcase your skills and win amazing prizes</p>
      </div>

      {/* Competitions List */}
      <div className="space-y-6">
        {competitions && competitions.length > 0 ? (
          competitions.map((competition) => (
            <Card key={competition.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{competition.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(competition.start_at).toLocaleDateString('en-US')} - {new Date(competition.end_at).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </div>
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

      {/* Client-side interactive features */}
      <Suspense fallback={<div className="h-32 animate-pulse rounded bg-muted" />}>
        <CompetitionClient />
      </Suspense>
    </div>
  )
}