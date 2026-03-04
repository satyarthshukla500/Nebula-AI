/**
 * Email Notification Provider
 * 
 * Placeholder for email notification delivery.
 * To be implemented with SendGrid, AWS SES, or similar service.
 */

import {
  NotificationProvider,
  NotificationRequest,
  NotificationResult,
} from '../types';

/**
 * Email Provider - Placeholder for email delivery
 * 
 * TODO: Integrate with email service (SendGrid, AWS SES, etc.)
 * 
 * Configuration needed:
 * - SMTP credentials or API keys
 * - From email address
 * - Email templates
 * - Rate limiting
 */
export class EmailProvider implements NotificationProvider {
  readonly name = 'EmailProvider';

  /**
   * Send notification via email
   * Currently throws "Not Implemented" error
   */
  async send(request: NotificationRequest): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();

    // Log attempt (for debugging)
    console.warn('⚠️  EmailProvider called but not implemented', {
      timestamp,
      userId: request.payload.userId,
      type: request.payload.type,
      recipientType: request.recipient.type,
    });

    // Throw clear error
    throw new Error(
      'EmailProvider is not implemented. Please configure an email service (SendGrid, AWS SES, etc.) to enable email notifications.'
    );
  }

  /**
   * Check if email provider is configured
   * Currently always returns false
   */
  isAvailable(): boolean {
    // TODO: Check for email service configuration
    // Example: return !!process.env.SENDGRID_API_KEY;
    return false;
  }
}

/**
 * Email template structure (for future implementation)
 */
export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

/**
 * Email configuration (for future implementation)
 */
export interface EmailConfig {
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

/**
 * Future implementation notes:
 * 
 * 1. Install email service SDK:
 *    npm install @sendgrid/mail
 *    or
 *    npm install nodemailer
 * 
 * 2. Add environment variables:
 *    SENDGRID_API_KEY=your-api-key
 *    EMAIL_FROM=noreply@nebula-ai.com
 *    EMAIL_FROM_NAME=Nebula AI
 * 
 * 3. Create email templates for each notification type
 * 
 * 4. Implement send() method with:
 *    - Template selection based on notification type
 *    - Recipient validation
 *    - Rate limiting
 *    - Retry logic
 *    - Delivery tracking
 * 
 * 5. Update isAvailable() to check configuration
 */
