/**
 * Console Notification Provider
 * 
 * Development provider that logs notifications to console.
 * Used for testing and development environments.
 */

import {
  NotificationProvider,
  NotificationRequest,
  NotificationResult,
} from '../types';

/**
 * Mask sensitive data for logging
 */
function maskEmail(email: string): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone) return '';
  if (phone.length < 4) return '***';
  return `***${phone.slice(-4)}`;
}

/**
 * Console Provider - Logs notifications to console
 * Safe for development, includes structured logging
 */
export class ConsoleProvider implements NotificationProvider {
  readonly name = 'ConsoleProvider';

  /**
   * Send notification by logging to console
   */
  async send(request: NotificationRequest): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();

    try {
      // Mask sensitive data
      const maskedRecipient = {
        type: request.recipient.type,
        userId: request.recipient.userId,
        contactId: request.recipient.contactId,
        email: request.recipient.email ? maskEmail(request.recipient.email) : undefined,
        phone: request.recipient.phone ? maskPhone(request.recipient.phone) : undefined,
        name: request.recipient.name,
      };

      // Structured log output
      const logData = {
        timestamp,
        provider: this.name,
        recipient: maskedRecipient,
        notification: {
          userId: request.payload.userId,
          type: request.payload.type,
          message: request.payload.message,
          metadata: request.payload.metadata,
        },
      };

      // Log to console with formatting
      console.log('\n' + '='.repeat(80));
      console.log('📬 NOTIFICATION (Console Provider)');
      console.log('='.repeat(80));
      console.log(JSON.stringify(logData, null, 2));
      console.log('='.repeat(80) + '\n');

      return {
        success: true,
        provider: this.name,
        timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ ConsoleProvider Error:', {
        timestamp,
        error: errorMessage,
        userId: request.payload.userId,
        type: request.payload.type,
      });

      return {
        success: false,
        provider: this.name,
        timestamp,
        error: errorMessage,
      };
    }
  }

  /**
   * Console provider is always available
   */
  isAvailable(): boolean {
    return true;
  }
}
