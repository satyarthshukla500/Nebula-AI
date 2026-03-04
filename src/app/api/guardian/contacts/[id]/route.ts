import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE - Remove emergency contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const contactId = params.id;

    // Soft delete (set is_active to false)
    const { error: deleteError } = await (supabase as any)
      .from('emergency_contacts')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting emergency contact:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete emergency contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency contact removed',
    });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
