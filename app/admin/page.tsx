import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Trophy, FileText, Settings } from "lucide-react"

const adminFeatures = [
  {
    title: "User Management",
    description: "Manage user roles and permissions",
    icon: Users,
    href: "/admin/users",
    color: "text-blue-600"
  },
  {
    title: "Tutorial Management",
    description: "Upload and manage tutorial content",
    icon: BookOpen,
    href: "/admin/tutorials/new",
    color: "text-green-600"
  },
  {
    title: "Competition Management",
    description: "Create and edit competitions",
    icon: Trophy,
    href: "/admin/competitions/new",
    color: "text-purple-600"
  },
  {
    title: "Homework Management",
    description: "View and grade student homework",
    icon: FileText,
    href: "/admin/homework/list",
    color: "text-orange-600"
  },
  {
    title: "System Settings",
    description: "Configure system parameters",
    icon: Settings,
    href: "/admin/settings",
    color: "text-gray-600"
  }
]

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-lg text-muted-foreground">Manage all content for Manga & Art Basics Club</p>
      </div>

      {/* Admin Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
                              <Button asChild className="w-full">
                  <Link href={feature.href}>Manage</Link>
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-muted-foreground">Tutorials</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-muted-foreground">Active Competitions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-muted-foreground">Pending Homework</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
