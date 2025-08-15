import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Manga & Art Basics Club</h1>
        <p className="text-xl text-muted-foreground">Offline: RC Palmer Secondary School</p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side - Action Buttons */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Button asChild size="lg" className="h-16">
              <Link href="/tutorials">Tutorials</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-16 bg-transparent">
              <Link href="/competitions">Competitions</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-16 bg-transparent">
              <Link href="/homework">Hand In Homework</Link>
            </Button>
          </div>
        </div>

        {/* Right Side - Upcoming Poster */}
        <div className="lg:col-span-1">
          <Card className="aspect-video">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Upcoming Poster</div>
                <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
