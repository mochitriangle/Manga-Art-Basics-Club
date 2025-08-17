import { createSupabaseServer } from '@/lib/supabase/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const supabaseAdmin = createSupabaseAdmin()
    
    // Check if the current user is an admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's profile to check their role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get the email from the request body
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Use admin client to find the user (this works with service role key)
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    if (userError) {
      console.error('Admin listUsers error:', userError)
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
    }

    const targetUser = users.users.find(u => u.email === email.trim())
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update the user's profile to be a teacher
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_teacher: true,
        role: 'staff'
      })
      .eq('id', targetUser.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${email} is now a teacher!` 
    })

  } catch (error) {
    console.error('Error in assign-teacher API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
