/**
 * Notification System Types
 * 
 * Defines strict TypeScript interfaces for the notification abstraction layer.
 */

/**
 * Notification types for Guardian Mode
 */
export type NotificationType =
  | 'CHECKIN_REMINDER'
  | 'ESCALATION_WARNING'
  | 'EMERGENCY_ALERT'
  | 'CONTACT_VERIFICATION'
  | 'GUARDIAN_ENABLED'
  | 'GUARDIAN_DISABLED';

/**
 * Notification recipient types
 */
export type RecipientType = 'USER' | 'EMERGENCY_CONTACT';

/**
 * Notification payload structure
 */
export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Recipient information for notifications
 */
export interface NotificationRecipient {
  type: RecipientType;
  userId?: string;
  contactId?: string;
  email?: string;
  phone?: string;
  name?: string;
}

/**
 * Complete notification request
 */
export interface NotificationRequest {
  recipient: NotificationRecipient;
  payload: NotificationPayload;
}

/**
 * Notification result
 */
export interface NotificationResult {
  success: boolean;
  provider: string;
  timestamp: string;
  error?: string;
}

/**
 * Abstract notification provider interface
 * All providers must implement this interface
 */
export interface NotificationProvider {
  /**
   * Provider name for logging and debugging
   */
  readonly name: string;

  /**
   * Send notification to recipient
   * @param request - Complete notification request with recipient and payload
   * @returns Promise resolving to notification result
   */
  send(request: NotificationRequest): Promise<NotificationResult>;

  /**
   * Check if provider is available/configured
   * @returns True if provider can send notifications
   */
  isAvailable(): boolean;
}

/**
 * Notification service configuration
 */
export interface NotificationServiceConfig {
  provider: NotificationProvider;
  fallbackProvider?: NotificationProvider;
  retryAttempts?: number;
  retryDelayMs?: number;
}

/**
 * Masked data for logging (security)
 */
export interface MaskedRecipient {
  type: RecipientType;
  userId?: string;
  contactId?: string;
  email?: string; // Will be masked
  phone?: string; // Will be masked
  name?: string;
}
