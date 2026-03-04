# Notification Abstraction Layer - Documentation

## Overview

The Notification Abstraction Layer provides a modular, provider-agnostic system for sending notifications to users and emergency contacts in Nebula AI's Guardian Mode.

## Architecture

### Design Principles

1. **Provider Abstraction** - Swap notification providers without changing business logic
2. **Reliability** - Automatic retries, fallback providers, error handling
3. **Security** - Mask sensitive data in logs, never expose PII
4. **Modularity** - Easy to add new providers
5. **Environment-Aware** - Different providers for dev/prod

### Folder Structure

```
src/lib/notifications/
├── NotificationService.ts       # Main service with retry logic
├── types.ts                     # TypeScript interfaces
├── index.ts                     # Singleton instance & exports
└── providers/
    ├── ConsoleProvider.ts       # Development provider (logs to console)
    ├── EmailProvider.ts         # Placeholder for email delivery
    └── SMSProvider.ts           # Placeholder for SMS delivery
```

## Core Components

### 1. NotificationService

Main service for sending notifications. Handles:
- Provider abstraction
- Retry logic (3 attempts with exponential backoff)
- Fallback to secondary provider
- Error handling (never crashes)
- Structured logging

**Methods:**
```typescript
// Send to user
notifyUser(
  userId: string,
  payload: NotificationPayload,
  userEmail?: string,
  userPhone?: string
): Promise<NotificationResult>

// Send to emergency contact
notifyEmergencyContact(
  contactId: string,
  payload: NotificationPayload,
  contactEmail?: string,
  contactPhone?: string,
  contactName?: string
): Promise<NotificationResult>
```

### 2. NotificationProvider Interface

All providers must implement:
```typescript
interface NotificationProvider {
  readonly name: string;
  send(request: NotificationRequest): Promise<NotificationResult>;
  isAvailable(): boolean;
}
```

### 3. Providers

#### ConsoleProvider ✅ (Implemented)
- Logs notifications to console
- Used in development/test environments
- Masks sensitive data (email, phone)
- Structured JSON output
- Always available

#### EmailProvider ⏳ (Placeholder)
- Throws "Not Implemented" error
- Ready for SendGrid/AWS SES integration
- Includes implementation notes

#### SMSProvider ⏳ (Placeholder)
- Throws "Not Implemented" error
- Ready for Twilio/AWS SNS integration
- Includes implementation notes

## Usage

### Basic Usage

```typescript
import { getNotificationService } from '@/lib/notifications';

// Get singleton instance
const notificationService = getNotificationService();

// Send check-in reminder to user
await notificationService.notifyUser(
  'user-123',
  {
    userId: 'user-123',
    type: 'CHECKIN_REMINDER',
    message: 'Time for your wellness check-in!',
    metadata: { nextCheckInDue: '2024-01-15T09:00:00Z' }
  },
  'user@example.com',
  '+1234567890'
);

// Send alert to emergency contact
await notificationService.notifyEmergencyContact(
  'contact-456',
  {
    userId: 'user-123',
    type: 'EMERGENCY_ALERT',
    message: 'Your contact has missed check-ins.',
    metadata: { missedCheckIns: 4 }
  },
  'emergency@example.com',
  '+9876543210',
  'Jane Doe'
);
```

### Custom Provider

```typescript
import { createNotificationService, ConsoleProvider } from '@/lib/notifications';

// Create service with custom provider
const customService = createNotificationService(
  new ConsoleProvider(),
  new EmailProvider() // fallback
);
```

## Notification Types

```typescript
type NotificationType =
  | 'CHECKIN_REMINDER'        // Scheduled check-in reminder
  | 'ESCALATION_WARNING'      // User missed check-ins
  | 'EMERGENCY_ALERT'         // Emergency contact notification
  | 'CONTACT_VERIFICATION'    // OTP verification
  | 'GUARDIAN_ENABLED'        // Guardian Mode activated
  | 'GUARDIAN_DISABLED';      // Guardian Mode deactivated
```

## Environment-Based Provider Selection

### Development Mode
```
NODE_ENV=development → ConsoleProvider
```
- Logs to console
- No external services needed
- Safe for testing

### Production Mode
```
NODE_ENV=production → EmailProvider (if configured) → ConsoleProvider (fallback)
```
- Attempts EmailProvider first
- Falls back to ConsoleProvider if not configured
- Logs warnings for missing configuration

## Security Features

### Data Masking

Sensitive data is automatically masked in logs:

```typescript
// Email masking
user@example.com → us***@example.com

// Phone masking
+1234567890 → ***7890
```

### Security Rules

1. ✅ Never log full phone numbers in production
2. ✅ Never log full email addresses in production
3. ✅ Never log OTP codes
4. ✅ Mask all PII in console output
5. ✅ Use structured logging for audit trails

## Error Handling

### Retry Logic

1. Primary provider: 3 attempts with exponential backoff
   - Attempt 1: Immediate
   - Attempt 2: 1 second delay
   - Attempt 3: 2 second delay

2. Fallback provider: 1 attempt

3. If all fail: Return error result (does NOT crash)

### Error Response

```typescript
{
  success: false,
  provider: 'ConsoleProvider',
  timestamp: '2024-01-15T10:30:00Z',
  error: 'Connection timeout'
}
```

## Testing

### Test API Route

```bash
# Run all tests
GET http://localhost:3000/api/test-notification

# Custom notification
POST http://localhost:3000/api/test-notification
{
  "userId": "test-123",
  "type": "CHECKIN_REMINDER",
  "message": "Test message",
  "recipientEmail": "test@example.com"
}
```

### Expected Console Output

```
================================================================================
📬 NOTIFICATION (Console Provider)
================================================================================
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "provider": "ConsoleProvider",
  "recipient": {
    "type": "USER",
    "userId": "test-user-123",
    "email": "us***@example.com",
    "phone": "***7890"
  },
  "notification": {
    "userId": "test-user-123",
    "type": "CHECKIN_REMINDER",
    "message": "Time for your wellness check-in!",
    "metadata": {
      "nextCheckInDue": "2024-01-15T21:00:00Z"
    }
  }
}
================================================================================
```

## Future Implementation

### EmailProvider Integration

1. Install email service:
```bash
npm install @sendgrid/mail
# or
npm install nodemailer
```

2. Add environment variables:
```env
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@nebula-ai.com
EMAIL_FROM_NAME=Nebula AI
```

3. Update `EmailProvider.ts`:
```typescript
import sgMail from '@sendgrid/mail';

export class EmailProvider implements NotificationProvider {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async send(request: NotificationRequest): Promise<NotificationResult> {
    const msg = {
      to: request.recipient.email,
      from: process.env.EMAIL_FROM!,
      subject: this.getSubject(request.payload.type),
      text: request.payload.message,
      html: this.getHtmlTemplate(request),
    };

    await sgMail.send(msg);
    
    return {
      success: true,
      provider: this.name,
      timestamp: new Date().toISOString(),
    };
  }

  isAvailable(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }
}
```

### SMSProvider Integration

1. Install SMS service:
```bash
npm install twilio
```

2. Add environment variables:
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1234567890
```

3. Update `SMSProvider.ts`:
```typescript
import twilio from 'twilio';

export class SMSProvider implements NotificationProvider {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async send(request: NotificationRequest): Promise<NotificationResult> {
    await this.client.messages.create({
      body: request.payload.message,
      from: process.env.TWILIO_FROM_NUMBER,
      to: request.recipient.phone!,
    });

    return {
      success: true,
      provider: this.name,
      timestamp: new Date().toISOString(),
    };
  }

  isAvailable(): boolean {
    return !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER
    );
  }
}
```

## Integration with Guardian Mode

### Check-in Reminders

```typescript
import { getNotificationService } from '@/lib/notifications';

async function sendCheckInReminder(userId: string, userEmail: string) {
  const service = getNotificationService();
  
  await service.notifyUser(userId, {
    userId,
    type: 'CHECKIN_REMINDER',
    message: 'Time for your wellness check-in! How are you feeling?',
    metadata: {
      nextCheckInDue: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    },
  }, userEmail);
}
```

### Escalation Warnings

```typescript
async function sendEscalationWarning(
  userId: string,
  stage: number,
  missedCheckIns: number
) {
  const service = getNotificationService();
  
  await service.notifyUser(userId, {
    userId,
    type: 'ESCALATION_WARNING',
    message: `You have missed ${missedCheckIns} check-ins. Please respond.`,
    metadata: { escalationStage: stage, missedCheckIns },
  });
}
```

### Emergency Contact Alerts

```typescript
async function notifyEmergencyContact(
  contactId: string,
  contactEmail: string,
  userName: string
) {
  const service = getNotificationService();
  
  await service.notifyEmergencyContact(contactId, {
    userId: 'user-id',
    type: 'EMERGENCY_ALERT',
    message: `Your contact ${userName} has missed wellness check-ins. Please reach out.`,
    metadata: { userName },
  }, contactEmail);
}
```

## Verification Checklist

- [x] Folder structure created
- [x] TypeScript types defined
- [x] ConsoleProvider implemented
- [x] EmailProvider placeholder created
- [x] SMSProvider placeholder created
- [x] NotificationService implemented
- [x] Singleton pattern implemented
- [x] Environment-based provider selection
- [x] Retry logic with exponential backoff
- [x] Fallback provider support
- [x] Error handling (never crashes)
- [x] Data masking for security
- [x] Test API route created
- [x] Documentation complete

## Status

✅ **COMPLETE** - Notification Abstraction Layer is fully implemented and ready for use.

**What's Working:**
- Complete provider abstraction
- ConsoleProvider for development
- Retry logic and fallback
- Error handling
- Security (data masking)
- Test API route

**What's Pending:**
- EmailProvider integration (placeholder ready)
- SMSProvider integration (placeholder ready)
- Email templates
- SMS templates

**Next Steps:**
1. Test the system: `GET http://localhost:3000/api/test-notification`
2. Integrate with Guardian Mode escalation logic
3. Configure email service when ready
4. Configure SMS service when ready
