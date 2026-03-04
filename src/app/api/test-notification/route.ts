/**
 * Test Notification API Route
 * 
 * Tests the notification system by sending a sample notification.
 * Used to verify provider abstraction and notification delivery.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNotificationService } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    console.log('\n' + '🧪 Testing Notification System'.padEnd(80, '='));

    // Get notification service
    const notificationService = getNotificationService();

    console.log('Provider:', notificationService.getProviderName());
    console.log('Available:', notificationService.isProviderAvailable());

    // Test 1: Send CHECKIN_REMINDER to user
    console.log('\n📋 Test 1: Sending CHECKIN_REMINDER to user...');
    const userResult = await notificationService.notifyUser(
      'test-user-123',
      {
        userId: 'test-user-123',
        type: 'CHECKIN_REMINDER',
        message: 'Time for your wellness check-in! How are you feeling today?',
        metadata: {
          nextCheckInDue: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          checkInInterval: '12 hours',
        },
      },
      'user@example.com',
      '+1234567890'
    );

    // Test 2: Send ESCALATION_WARNING to user
    console.log('\n📋 Test 2: Sending ESCALATION_WARNING to user...');
    const warningResult = await notificationService.notifyUser(
      'test-user-123',
      {
        userId: 'test-user-123',
        type: 'ESCALATION_WARNING',
        message: 'You have missed 2 check-ins. Please complete your check-in to avoid escalation.',
        metadata: {
          missedCheckIns: 2,
          escalationStage: 2,
        },
      },
      'user@example.com'
    );

    // Test 3: Send EMERGENCY_ALERT to emergency contact
    console.log('\n📋 Test 3: Sending EMERGENCY_ALERT to emergency contact...');
    const emergencyResult = await notificationService.notifyEmergencyContact(
      'contact-456',
      {
        userId: 'test-user-123',
        type: 'EMERGENCY_ALERT',
        message: 'Your emergency contact John Doe has missed several wellness check-ins. Please reach out to them.',
        metadata: {
          userName: 'John Doe',
          missedCheckIns: 4,
          escalationStage: 4,
        },
      },
      'emergency@example.com',
      '+9876543210',
      'Jane Smith'
    );

    console.log('\n' + '✅ All Tests Complete'.padEnd(80, '=') + '\n');

    // Return results
    return NextResponse.json({
      success: true,
      message: 'Notification system test completed',
      provider: notificationService.getProviderName(),
      results: {
        checkinReminder: {
          success: userResult.success,
          provider: userResult.provider,
          timestamp: userResult.timestamp,
          error: userResult.error,
        },
        escalationWarning: {
          success: warningResult.success,
          provider: warningResult.provider,
          timestamp: warningResult.timestamp,
          error: warningResult.error,
        },
        emergencyAlert: {
          success: emergencyResult.success,
          provider: emergencyResult.provider,
          timestamp: emergencyResult.timestamp,
          error: emergencyResult.error,
        },
      },
    });
  } catch (error) {
    console.error('❌ Test notification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for custom notification testing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, message, metadata, recipientEmail, recipientPhone } = body;

    // Validate required fields
    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, message' },
        { status: 400 }
      );
    }

    // Get notification service
    const notificationService = getNotificationService();

    // Send notification
    const result = await notificationService.notifyUser(
      userId,
      {
        userId,
        type,
        message,
        metadata,
      },
      recipientEmail,
      recipientPhone
    );

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      timestamp: result.timestamp,
      error: result.error,
    });
  } catch (error) {
    console.error('❌ Custom notification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
