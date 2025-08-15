export type UserRole = 'admin' | 'staff' | 'student'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Competition {
  id: string
  title: string
  body: string
  start_at: string
  end_at: string
  awards: string[]
  published: boolean
  created_by: string
  created_at: string
}

export interface Tutorial {
  id: string
  title: string
  category: 'Digital Art' | 'Quick Sketch' | 'Sketching' | 'Color'
  video_url: string
  order_index: number
  created_at: string
}

export interface Submission {
  id: string
  user_id: string
  lesson_id: string
  file_path: string
  created_at: string
}

export interface Review {
  id: string
  submission_id: string
  reviewer: string
  score: number
  feedback: string
  created_at: string
}

export interface AuthError {
  message: string
  code?: string
}
