export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Get Guardian Mode settings
    const { data: settings, error: settingsError } = await (supabase as any)
      .from('guardian_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching guardian settings:', settingsError);
      return NextResponse.json(
        { error: 'Failed to fetch Guardian Mode status' },
        { status: 500 }
      );
    }

    const settingsData = settings as any;

    if (!settingsData) {
      return NextResponse.json({
        success: true,
        data: {
          isEnabled: false,
          nextCheckInDue: null,
          lastCheckIn: null,
          currentRiskScore: 0,
          missedCheckIns: 0,
        },
      });
    }

    // Count missed check-ins (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: missedCheckins, error: missedError } = await (supabase as any)
      .from('wellness_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'missed')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (missedError) {
      console.error('Error counting missed check-ins:', missedError);
    }

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: settingsData.is_enabled,
        nextCheckInDue: settingsData.next_check_in_due,
        lastCheckIn: settingsData.last_check_in,
        currentRiskScore: settingsData.current_risk_score || 0,
        missedCheckIns: missedCheckins?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching check-in status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
