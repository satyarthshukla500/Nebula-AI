import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Retrieve Guardian Mode settings
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

    // Get settings
    const { data: settings, error } = await (supabase as any)
      .from('guardian_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching guardian settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Guardian Mode settings' },
        { status: 500 }
      );
    }

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching Guardian Mode settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update Guardian Mode settings
export async function PATCH(request: NextRequest) {
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
    const {
      checkInInterval,
      preferredTimes,
      riskThreshold,
      notificationPreferences,
    } = body;

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (checkInInterval) {
      const validIntervals = ['6 hours', '12 hours', '24 hours'];
      if (!validIntervals.includes(checkInInterval)) {
        return NextResponse.json(
          { error: 'Invalid checkInInterval' },
          { status: 400 }
        );
      }
      updates.check_in_interval = checkInInterval;
    }

    if (preferredTimes) {
      if (!Array.isArray(preferredTimes) || preferredTimes.length === 0) {
        return NextResponse.json(
          { error: 'preferredTimes must be a non-empty array' },
          { status: 400 }
        );
      }
      updates.preferred_check_in_times = preferredTimes;
    }

    if (riskThreshold !== undefined) {
      if (typeof riskThreshold !== 'number' || riskThreshold < 0 || riskThreshold > 100) {
        return NextResponse.json(
          { error: 'riskThreshold must be a number between 0 and 100' },
          { status: 400 }
        );
      }
      updates.risk_threshold = riskThreshold;
    }

    if (notificationPreferences) {
      updates.notification_preferences = notificationPreferences;
    }

    // Update settings
    const { data, error } = await (supabase as any)
      .from('guardian_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating guardian settings:', error);
      return NextResponse.json(
        { error: 'Failed to update Guardian Mode settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error updating Guardian Mode settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
