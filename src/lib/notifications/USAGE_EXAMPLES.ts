/**
 * Notification System - Usage Examples
 * 
 * This file demonstrates how to use the Notification Abstraction Layer
 * in various Guardian Mode scenarios.
 */

import { getNotificationService } from './index';

// ============================================================================
// EXAMPLE 1: Send Check-in Reminder to User
// ============================================================================

export async function sendCheckInReminder(
  userId: string,
  userEmail: string,
  nextCheckInDue: string
) {
  const notificationService = getNotificationService();

  const result = await notificationService.notifyUser(
    userId,
    {
      userId,
      type: 'CHECKIN_REMINDER',
      message: 'Time for your wellness check-in! How are you feeling today?',
      metadata: {
        nextCheckInDue,
        checkInInterval: '12 hours',
      },
    },
    userEmail
  );

  if (!result.success) {
    console.error('Failed to send check-in reminder:', result.error);
  }

  return result;
}

// ============================================================================
// EXAMPLE 2: Send Escalation Warning to User
// ============================================================================

export async function sendEscalationWarning(
  userId: string,
  userEmail: string,
  userPhone: string,
  missedCheckIns: number,
  escalationStage: number
) {
  const notificationService = getNotificationService();

  const result = await notificationService.notifyUser(
    userId,
    {
      userId,
      type: 'ESCALATION_WARNING',
      message: `You have missed ${missedCheckIns} check-ins. Please complete your check-in to avoid further escalation.`,
      metadata: {
        missedCheckIns,
        escalationStage,
        urgency: 'high',
      },
    },
    userEmail,
    userPhone
  );

  return result;
}

// ============================================================================
// EXAMPLE 3: Send Emergency Alert to Emergency Contact
// ============================================================================

export async function sendEmergencyAlert(
  contactId: string,
  contactEmail: string,
  contactPhone: string,
  contactName: string,
  userName: string,
  missedCheckIns: number
) {
  const notificationService = getNotificationService();

  const result = await notificationService.notifyEmergencyContact(
    contactId,
    {
      userId: 'user-id', // The user who needs help
      type: 'EMERGENCY_ALERT',
      message: `Your emergency contact ${userName} has missed ${missedCheckIns} wellness check-ins on Nebula AI. Please reach out to them to ensure they're okay.

This is not a medical emergency alert. If you believe they are in immediate danger, please contact local emergency services directly.`,
      metadata: {
        userName,
        missedCheckIns,
        escalationStage: 4,
      },
    },
    contactEmail,
    contactPhone,
    contactName
  );

  return result;
}

// ============================================================================
// EXAMPLE 4: Send Contact Verification OTP
// ============================================================================

export async function sendContactVerificationOTP(
  contactId: string,
  contactEmail: string,
  contactPhone: string,
  contactName: string,
  otp: string
) {
  const notificationService = getNotificationService();

  const result = await notificationService.notifyEmergencyContact(
    contactId,
    {
      userId: 'system',
      type: 'CONTACT_VERIFICATION',
      message: `Your verification code for Nebula AI Guardian Mode is: ${otp}

This code will expire in 15 minutes.

If you did not request this code, please ignore this message.`,
      metadata: {
        otp, // NOTE: In production, don't include OTP in metadata for logging
        expiresIn: '15 minutes',
      },
    },
    contactEmail,
    contactPhone,
    contactName
  );

  return result;
}

// ============================================================================
// EXAMPLE 5: Send Guardian Mode Enabled Confirmation
// ============================================================================

export async function sendGuardianEnabledConfirmation(
  userId: string,
  userEmail: string,
  checkInInterval: string,
  nextCheckInDue: string
) {
  const notificationService = getNotificationService();

  const result = await notificationService.notifyUser(
    userId,
    {
      userId,
      type: 'GUARDIAN_ENABLED',
      message: `Guardian Mode has been successfully enabled for your account.

Check-in Interval: ${checkInInterval}
Next Check-in: ${new Date(nextCheckInDue).toLocaleString()}

You can disable Guardian Mode at any time from your Mental Wellness settings.`,
      metadata: {
        checkInInterval,
        nextCheckInDue,
      },
    },
    userEmail
  );

  return result;
}

// ============================================================================
// EXAMPLE 6: Send Guardian Mode Disabled Confirmation
// ============================================================================

export async function sendGuardianDisabledConfirmation(
  userId: string,
  userEmail: string,
  reason?: string
) {
  const notificationService = getNotificationService();

  const result = await notificationService.notifyUser(
    userId,
    {
      userId,
      type: 'GUARDIAN_DISABLED',
      message: `Guardian Mode has been disabled for your account.

${reason ? `Reason: ${reason}` : ''}

You can re-enable Guardian Mode at any time from your Mental Wellness settings.`,
      metadata: {
        reason,
        disabledAt: new Date().toISOString(),
      },
    },
    userEmail
  );

  return result;
}

// ============================================================================
// EXAMPLE 7: Batch Notifications (Multiple Users)
// ============================================================================

export async function sendBatchCheckInReminders(
  users: Array<{
    userId: string;
    email: string;
    nextCheckInDue: string;
  }>
) {
  const notificationService = getNotificationService();
  const results = [];

  for (const user of users) {
    const result = await sendCheckInReminder(
      user.userId,
      user.email,
      user.nextCheckInDue
    );
    results.push(result);
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  console.log(`Batch notifications sent: ${successCount} success, ${failureCount} failed`);

  return results;
}

// ============================================================================
// EXAMPLE 8: Custom Provider for Testing
// ============================================================================

import { createNotificationService, ConsoleProvider } from './index';

export function createTestNotificationService() {
  // Create a custom service with ConsoleProvider for testing
  return createNotificationService(new ConsoleProvider());
}

// Usage in tests:
// const testService = createTestNotificationService();
// await testService.notifyUser(...);

// ============================================================================
// EXAMPLE 9: Error Handling Pattern
// ============================================================================

export async function sendNotificationWithErrorHandling(
  userId: string,
  userEmail: string
) {
  const notificationService = getNotificationService();

  try {
    const result = await notificationService.notifyUser(
      userId,
      {
        userId,
        type: 'CHECKIN_REMINDER',
        message: 'Test message',
      },
      userEmail
    );

    if (result.success) {
      console.log('✅ Notification sent successfully');
      return { success: true };
    } else {
      console.error('❌ Notification failed:', result.error);
      // Log to error tracking service (Sentry, etc.)
      // Don't crash - system continues to function
      return { success: false, error: result.error };
    }
  } catch (error) {
    // This should rarely happen due to internal error handling
    console.error('❌ Unexpected notification error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

// ============================================================================
// EXAMPLE 10: Integration with Guardian Mode Escalation
// ============================================================================

export async function executeEscalationStage(
  stage: number,
  userId: string,
  userEmail: string,
  userPhone: string,
  emergencyContact?: {
    id: string;
    email: string;
    phone: string;
    name: string;
  }
) {
  const notificationService = getNotificationService();

  switch (stage) {
    case 1:
      // Stage 1: In-app reminder (handled by UI)
      console.log('Stage 1: In-app notification triggered');
      break;

    case 2:
      // Stage 2: SMS/Email to user
      return await notificationService.notifyUser(
        userId,
        {
          userId,
          type: 'ESCALATION_WARNING',
          message: 'You missed your check-in. Please respond.',
          metadata: { escalationStage: 2 },
        },
        userEmail,
        userPhone
      );

    case 3:
      // Stage 3: Confirmation prompt
      return await notificationService.notifyUser(
        userId,
        {
          userId,
          type: 'ESCALATION_WARNING',
          message: 'URGENT: Multiple missed check-ins detected. Please confirm you are okay.',
          metadata: { escalationStage: 3, urgency: 'high' },
        },
        userEmail,
        userPhone
      );

    case 4:
      // Stage 4: Notify emergency contact
      if (!emergencyContact) {
        throw new Error('Emergency contact required for Stage 4');
      }

      return await notificationService.notifyEmergencyContact(
        emergencyContact.id,
        {
          userId,
          type: 'EMERGENCY_ALERT',
          message: `Your contact has missed wellness check-ins. Please reach out.`,
          metadata: { escalationStage: 4 },
        },
        emergencyContact.email,
        emergencyContact.phone,
        emergencyContact.name
      );

    default:
      throw new Error(`Invalid escalation stage: ${stage}`);
  }
}
