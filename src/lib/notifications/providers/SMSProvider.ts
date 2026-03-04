/**
 * SMS Notification Provider
 * 
 * Placeholder for SMS notification delivery.
 * To be implemented with Twilio, AWS SNS, or similar service.
 */

import {
  NotificationProvider,
  NotificationRequest,
  NotificationResult,
} from '../types';

/**
 * SMS Provider - Placeholder for SMS delivery
 * 
 * TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
 * 
 * Configuration needed:
 * - SMS service credentials
 * - From phone number
 * - Message templates
 * - Rate limiting
 * - Cost tracking
 */
export class SMSProvider implements NotificationProvider {
  readonly name = 'SMSProvider';

  /**
   * Send notification via SMS
   * Currently throws "Not Implemented" error
   */
  async send(request: NotificationRequest): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();

    // Log attempt (for debugging)
    console.warn('⚠️  SMSProvider called but not implemented', {
      timestamp,
      userId: request.payload.userId,
      type: request.payload.type,
      recipientType: request.recipient.type,
    });

    // Throw clear error
    throw new Error(
      'SMSProvider is not implemented. Please configure an SMS service (Twilio, AWS SNS, etc.) to enable SMS notifications.'
    );
  }

  /**
   * Check if SMS provider is configured
   * Currently always returns false
   */
  isAvailable(): boolean {
    // TODO: Check for SMS service configuration
    // Example: return !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN;
    return false;
  }
}

/**
 * SMS configuration (for future implementation)
 */
export interface SMSConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber: string;
  maxLength?: number;
}

/**
 * SMS template structure (for future implementation)
 */
export interface SMSTemplate {
  message: string;
  maxLength: number;
}

/**
 * Future implementation notes:
 * 
 * 1. Install SMS service SDK:
 *    npm install twilio
 *    or
 *    npm install @aws-sdk/client-sns
 * 
 * 2. Add environment variables:
 *    TWILIO_ACCOUNT_SID=your-account-sid
 *    TWILIO_AUTH_TOKEN=your-auth-token
 *    TWILIO_FROM_NUMBER=+1234567890
 * 
 * 3. Create SMS templates for each notification type
 *    - Keep messages under 160 characters
 *    - Include opt-out instructions
 *    - Add unsubscribe link
 * 
 * 4. Implement send() method with:
 *    - Phone number validation (E.164 format)
 *    - Message length validation
 *    - Rate limiting (avoid spam)
 *    - Cost tracking
 *    - Delivery status tracking
 *    - Retry logic for failures
 * 
 * 5. Update isAvailable() to check configuration
 * 
 * 6. Handle opt-out requests:
 *    - Check emergency_contacts.can_receive_sms
 *    - Respect quiet hours
 *    - Log all SMS attempts
 * 
 * 7. Security considerations:
 *    - Never log full phone numbers in production
 *    - Mask phone numbers in logs
 *    - Encrypt phone numbers at rest
 *    - Comply with TCPA regulations
 */
