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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const eventType = searchParams.get('type');

    const offset = (page - 1) * limit;

    // Build query
    let query = (supabase as any)
      .from('crisis_events')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('event_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by event type if provided
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching crisis events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching crisis events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
