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
    const {
      consentVersion,
      checkInInterval,
      preferredTimes,
      riskThreshold = 40,
    } = body;

    // Validate required fields
    if (!consentVersion || !checkInInterval || !preferredTimes) {
      return NextResponse.json(
        { error: 'Missing required fields: consentVersion, checkInInterval, preferredTimes' },
        { status: 400 }
      );
    }

    // Validate check-in interval
    const validIntervals = ['6 hours', '12 hours', '24 hours'];
    if (!validIntervals.includes(checkInInterval)) {
      return NextResponse.json(
        { error: 'Invalid checkInInterval. Must be one of: 6 hours, 12 hours, 24 hours' },
        { status: 400 }
      );
    }

    // Validate preferred times
    if (!Array.isArray(preferredTimes) || preferredTimes.length === 0) {
      return NextResponse.json(
        { error: 'preferredTimes must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate risk threshold
    if (typeof riskThreshold !== 'number' || riskThreshold < 0 || riskThreshold > 100) {
      return NextResponse.json(
        { error: 'riskThreshold must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if user has at least one verified emergency contact
    const { data: contacts, error: contactsError } = await (supabase as any)
      .from('emergency_contacts')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_verified', true)
      .eq('is_active', true);

    if (contactsError) {
      console.error('Error checking emergency contacts:', contactsError);
      return NextResponse.json(
        { error: 'Failed to verify emergency contacts' },
        { status: 500 }
      );
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: 'At least one verified emergency contact is required' },
        { status: 400 }
      );
    }

    // Calculate next check-in time
    const now = new Date();
    const intervalHours = parseInt(checkInInterval.split(' ')[0]);
    const nextCheckInDue = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);

    // Check if settings already exist
    const { data: existingSettings } = await (supabase as any)
      .from('guardian_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let settingsData;

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await (supabase as any)
        .from('guardian_settings')
        .update({
          is_enabled: true,
          consent_version: consentVersion,
          consent_timestamp: now.toISOString(),
          check_in_interval: checkInInterval,
          preferred_check_in_times: preferredTimes,
          next_check_in_due: nextCheckInDue.toISOString(),
          risk_threshold: riskThreshold,
          updated_at: now.toISOString(),
        })
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

      settingsData = data;
    } else {
      // Create new settings
      const { data, error } = await (supabase as any)
        .from('guardian_settings')
        .insert({
          user_id: user.id,
          is_enabled: true,
          consent_version: consentVersion,
          consent_timestamp: now.toISOString(),
          check_in_interval: checkInInterval,
          preferred_check_in_times: preferredTimes,
          next_check_in_due: nextCheckInDue.toISOString(),
          risk_threshold: riskThreshold,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating guardian settings:', error);
        return NextResponse.json(
          { error: 'Failed to enable Guardian Mode' },
          { status: 500 }
        );
      }

      settingsData = data;
    }

    // Log event
    await (supabase as any).from('crisis_events').insert({
      user_id: user.id,
      event_type: 'guardian_enabled',
      event_timestamp: now.toISOString(),
      risk_score_at_event: 0,
      metadata: {
        consent_version: consentVersion,
        check_in_interval: checkInInterval,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        settingsId: (settingsData as any).id,
        nextCheckInDue: nextCheckInDue.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error enabling Guardian Mode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
