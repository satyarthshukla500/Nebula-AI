/**
 * Notification Service
 * 
 * Central service for sending notifications to users and emergency contacts.
 * Uses provider abstraction for flexible delivery methods.
 */

import {
  NotificationProvider,
  NotificationPayload,
  NotificationRequest,
  NotificationResult,
  NotificationServiceConfig,
  NotificationRecipient,
} from './types';

/**
 * NotificationService - Main service for sending notifications
 * 
 * Features:
 * - Provider abstraction (swap providers without changing code)
 * - Automatic fallback to secondary provider
 * - Retry logic with exponential backoff
 * - Error handling (never crashes system)
 * - Structured logging
 */
export class NotificationService {
  private provider: NotificationProvider;
  private fallbackProvider?: NotificationProvider;
  private retryAttempts: number;
  private retryDelayMs: number;

  constructor(config: NotificationServiceConfig) {
    this.provider = config.provider;
    this.fallbackProvider = config.fallbackProvider;
    this.retryAttempts = config.retryAttempts ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;

    console.log('✅ NotificationService initialized', {
      provider: this.provider.name,
      fallbackProvider: this.fallbackProvider?.name,
      retryAttempts: this.retryAttempts,
    });
  }

  /**
   * Send notification to user
   * @param userId - User ID
   * @param payload - Notification payload
   * @param userEmail - Optional user email
   * @param userPhone - Optional user phone
   */
  async notifyUser(
    userId: string,
    payload: NotificationPayload,
    userEmail?: string,
    userPhone?: string
  ): Promise<NotificationResult> {
    const recipient: NotificationRecipient = {
      type: 'USER',
      userId,
      email: userEmail,
      phone: userPhone,
    };

    const request: NotificationRequest = {
      recipient,
      payload,
    };

    return this.sendWithRetry(request);
  }

  /**
   * Send notification to emergency contact
   * @param contactId - Emergency contact ID
   * @param payload - Notification payload
   * @param contactEmail - Contact email
   * @param contactPhone - Contact phone
   * @param contactName - Contact name
   */
  async notifyEmergencyContact(
    contactId: string,
    payload: NotificationPayload,
    contactEmail?: string,
    contactPhone?: string,
    contactName?: string
  ): Promise<NotificationResult> {
    const recipient: NotificationRecipient = {
      type: 'EMERGENCY_CONTACT',
      contactId,
      email: contactEmail,
      phone: contactPhone,
      name: contactName,
    };

    const request: NotificationRequest = {
      recipient,
      payload,
    };

    return this.sendWithRetry(request);
  }

  /**
   * Send notification with retry logic
   * @param request - Complete notification request
   */
  private async sendWithRetry(request: NotificationRequest): Promise<NotificationResult> {
    let lastError: Error | undefined;

    // Try primary provider with retries
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`📤 Sending notification (attempt ${attempt}/${this.retryAttempts})`, {
          provider: this.provider.name,
          type: request.payload.type,
          recipientType: request.recipient.type,
        });

        const result = await this.provider.send(request);

        if (result.success) {
          console.log('✅ Notification sent successfully', {
            provider: result.provider,
            type: request.payload.type,
          });
          return result;
        }

        // If not successful, treat as error
        lastError = new Error(result.error || 'Unknown error');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        console.warn(`⚠️  Notification attempt ${attempt} failed`, {
          provider: this.provider.name,
          error: lastError.message,
          type: request.payload.type,
        });

        // Wait before retry (exponential backoff)
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    // Try fallback provider if available
    if (this.fallbackProvider && this.fallbackProvider.isAvailable()) {
      console.log('🔄 Trying fallback provider', {
        fallbackProvider: this.fallbackProvider.name,
      });

      try {
        const result = await this.fallbackProvider.send(request);
        
        if (result.success) {
          console.log('✅ Notification sent via fallback provider', {
            provider: result.provider,
          });
          return result;
        }
      } catch (error) {
        console.error('❌ Fallback provider also failed', {
          provider: this.fallbackProvider.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // All attempts failed - return failure result
    const timestamp = new Date().toISOString();
    const errorMessage = lastError?.message || 'All notification attempts failed';

    console.error('❌ Notification delivery failed', {
      provider: this.provider.name,
      type: request.payload.type,
      error: errorMessage,
      attempts: this.retryAttempts,
    });

    return {
      success: false,
      provider: this.provider.name,
      timestamp,
      error: errorMessage,
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(): boolean {
    return this.provider.isAvailable();
  }

  /**
   * Switch to different provider
   * @param provider - New provider to use
   */
  switchProvider(provider: NotificationProvider): void {
    console.log('🔄 Switching notification provider', {
      from: this.provider.name,
      to: provider.name,
    });
    this.provider = provider;
  }
}
