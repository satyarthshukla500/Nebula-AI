import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { reason } = body;

    // Update settings to disable
    const { error: updateError } = await (supabase as any)
      .from('guardian_settings')
      .update({
        is_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error disabling Guardian Mode:', updateError);
      return NextResponse.json(
        { error: 'Failed to disable Guardian Mode' },
        { status: 500 }
      );
    }

    // Log event
    await (supabase as any).from('crisis_events').insert({
      user_id: user.id,
      event_type: 'guardian_disabled',
      event_timestamp: new Date().toISOString(),
      metadata: {
        reason: reason || 'User disabled',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Guardian Mode has been disabled',
    });
  } catch (error) {
    console.error('Error disabling Guardian Mode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
