import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyCode } from '@/lib/utils/guardian-encryption';

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
    const { contactId, verificationCode } = body;

    // Validate required fields
    if (!contactId || !verificationCode) {
      return NextResponse.json(
        { error: 'Missing required fields: contactId, verificationCode' },
        { status: 400 }
      );
    }

    // Get contact
    const { data: contact, error: fetchError } = await (supabase as any)
      .from('emergency_contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const contactData = contact as any;

    // Check if already verified
    if (contactData.is_verified) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Contact already verified',
      });
    }

    // Check if verification code has expired (15 minutes)
    const sentAt = new Date(contactData.verification_sent_at);
    const now = new Date();
    const minutesElapsed = (now.getTime() - sentAt.getTime()) / (1000 * 60);

    if (minutesElapsed > 15) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify code
    const isValid = verifyCode(verificationCode, contactData.verification_code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update contact as verified
    const { error: updateError } = await (supabase as any)
      .from('emergency_contacts')
      .update({
        is_verified: true,
        verified_at: now.toISOString(),
        verification_code: null, // Clear verification code
      })
      .eq('id', contactId);

    if (updateError) {
      console.error('Error verifying contact:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Emergency contact verified successfully',
    });
  } catch (error) {
    console.error('Error verifying emergency contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
