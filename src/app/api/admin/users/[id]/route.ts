// Admin - Update/Delete user
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { AuthUser } from '@/lib/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const PUT = withAuth(async (
  request: NextRequest,
  user: AuthUser,
  context: { params: { id: string } }
) => {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()

    // Check if user is admin
    const profileResult = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const profile = profileResult.data as any

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, role } = body
    const userId = context.params.id

    // Update user profile using service client - bypass Supabase typing issues
    const result: any = await (serviceClient as any)
      .from('profiles')
      .update({ status, role })
      .eq('id', userId)
      .select()
      .single()
    
    const { data, error } = result

    if (error) throw error

    // Log activity
    await (supabase as any).from('activity_logs').insert({
      user_id: user.id,
      action: 'update_user',
      resource_type: 'profile',
      resource_id: userId,
      metadata: { status, role } as any,
    } as any)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (
  request: NextRequest,
  user: AuthUser,
  context: { params: { id: string } }
) => {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()

    // Check if user is admin
    const profileResult = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const profile = profileResult.data as any

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const userId = context.params.id

    // Soft delete - bypass Supabase typing issues
    const updateResult: any = await (serviceClient as any)
      .from('profiles')
      .update({ status: 'deleted' })
      .eq('id', userId)
    
    const { error: updateError } = updateResult

    if (updateError) throw updateError

    // Hard delete auth user
    const { error: deleteError } =
      await serviceClient.auth.admin.deleteUser(userId)

    if (deleteError) throw deleteError

    // Log activity
    await (supabase as any).from('activity_logs').insert({
      user_id: user.id,
      action: 'delete_user',
      resource_type: 'profile',
      resource_id: userId,
    } as any)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
})
