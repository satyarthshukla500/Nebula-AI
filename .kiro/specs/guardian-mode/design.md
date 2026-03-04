# Guardian Mode - Design Document

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  - Guardian Mode Settings UI                                 │
│  - Consent Flow Components                                   │
│  - Check-in Interface                                        │
│  - Emergency Contact Management                              │
│  - Event History Viewer                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Routes (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  - /api/guardian/settings                                    │
│  - /api/guardian/contacts                                    │
│  - /api/guardian/checkin                                     │
│  - /api/guardian/escalate                                    │
│  - /api/guardian/events                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Background Services                         │
├─────────────────────────────────────────────────────────────┤
│  - Check-in Scheduler (Cron Job)                            │
│  - Escalation Engine                                         │
│  - Risk Score Calculator                                     │
│  - Notification Service                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (Supabase)                       │
├─────────────────────────────────────────────────────────────┤
│  - guardian_settings                                         │
│  - emergency_contacts                                        │
│  - crisis_events                                             │
│  - wellness_checkins                                         │
└─────────────────────────────────────────────────────────────┘
```

## 2. Database Design

### 2.1 Schema Definitions

#### guardian_settings
```sql
CREATE TABLE guardian_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  consent_version TEXT NOT NULL,
  consent_timestamp TIMESTAMPTZ NOT NULL,
  check_in_interval INTERVAL NOT NULL DEFAULT '12 hours',
  preferred_check_in_times TIME[] DEFAULT ARRAY['09:00:00', '21:00:00'],
  last_check_in TIMESTAMPTZ,
  next_check_in_due TIMESTAMPTZ,
  risk_threshold INTEGER DEFAULT 40 CHECK (risk_threshold BETWEEN 0 AND 100),
  current_risk_score INTEGER DEFAULT 0 CHECK (current_risk_score BETWEEN 0 AND 100),
  notification_preferences JSONB DEFAULT '{
    "in_app": true,
    "push": true,
    "email": true,
    "sms": false,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "08:00"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_guardian_settings_user_id ON guardian_settings(user_id);
CREATE INDEX idx_guardian_settings_next_checkin ON guardian_settings(next_check_in_due) WHERE is_enabled = true;
```

#### emergency_contacts
```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT, -- Encrypted
  contact_email TEXT, -- Encrypted
  relationship TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT, -- Hashed
  verification_sent_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  notification_level TEXT DEFAULT 'critical_only' CHECK (notification_level IN ('critical_only', 'all_escalations')),
  can_receive_sms BOOLEAN DEFAULT true,
  can_receive_email BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  opt_out_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT max_3_contacts_per_user CHECK (
    (SELECT COUNT(*) FROM emergency_contacts WHERE user_id = emergency_contacts.user_id AND is_active = true) <= 3
  )
);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_verified ON emergency_contacts(user_id, is_verified) WHERE is_active = true;
```

#### crisis_events
```sql
CREATE TABLE crisis_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'guardian_enabled',
    'guardian_disabled',
    'check_in_completed',
    'check_in_missed',
    'escalation_stage_1',
    'escalation_stage_2',
    'escalation_stage_3',
    'escalation_stage_4',
    'user_response',
    'contact_notified',
    'risk_score_updated'
  )),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  risk_score_at_event INTEGER CHECK (risk_score_at_event BETWEEN 0 AND 100),
  escalation_stage INTEGER CHECK (escalation_stage BETWEEN 0 AND 4),
  user_response TEXT,
  user_response_timestamp TIMESTAMPTZ,
  contact_notified BOOLEAN DEFAULT false,
  contact_id UUID REFERENCES emergency_contacts(id),
  notification_sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crisis_events_user_id ON crisis_events(user_id, event_timestamp DESC);
CREATE INDEX idx_crisis_events_type ON crisis_events(event_type, event_timestamp DESC);
CREATE INDEX idx_crisis_events_escalation ON crisis_events(user_id, escalation_stage) WHERE escalation_stage IS NOT NULL;
```

#### wellness_checkins
```sql
CREATE TABLE wellness_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'late')),
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
  notes TEXT, -- Encrypted
  risk_indicators JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wellness_checkins_user_id ON wellness_checkins(user_id, scheduled_time DESC);
CREATE INDEX idx_wellness_checkins_status ON wellness_checkins(user_id, status) WHERE status = 'pending';
```

### 2.2 Row Level Security (RLS)

```sql
-- guardian_settings
ALTER TABLE guardian_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guardian settings"
  ON guardian_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own guardian settings"
  ON guardian_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guardian settings"
  ON guardian_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- emergency_contacts
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts FOR ALL
  USING (auth.uid() = user_id);

-- crisis_events
ALTER TABLE crisis_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crisis events"
  ON crisis_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert crisis events"
  ON crisis_events FOR INSERT
  WITH CHECK (true); -- Service role only

-- wellness_checkins
ALTER TABLE wellness_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON wellness_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can complete own checkins"
  ON wellness_checkins FOR UPDATE
  USING (auth.uid() = user_id);
```

## 3. API Design

### 3.1 Guardian Settings API

#### POST /api/guardian/settings/enable
**Purpose**: Enable Guardian Mode with consent

**Request**:
```typescript
{
  consentVersion: string;
  checkInInterval: string; // '6 hours', '12 hours', '24 hours'
  preferredTimes: string[]; // ['09:00', '21:00']
  riskThreshold: number; // 0-100
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    settingsId: string;
    nextCheckInDue: string;
  }
}
```

#### POST /api/guardian/settings/disable
**Purpose**: Disable Guardian Mode

**Request**:
```typescript
{
  reason?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

### 3.2 Emergency Contacts API

#### POST /api/guardian/contacts
**Purpose**: Add emergency contact

**Request**:
```typescript
{
  name: string;
  phone?: string;
  email?: string;
  relationship: string;
  notificationLevel: 'critical_only' | 'all_escalations';
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    contactId: string;
    verificationSent: boolean;
  }
}
```

#### POST /api/guardian/contacts/verify
**Purpose**: Verify emergency contact

**Request**:
```typescript
{
  contactId: string;
  verificationCode: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  verified: boolean;
}
```

### 3.3 Check-in API

#### POST /api/guardian/checkin/complete
**Purpose**: Complete a wellness check-in

**Request**:
```typescript
{
  moodRating: number; // 1-10
  notes?: string;
  riskIndicators?: {
    distressLevel?: number;
    needsSupport?: boolean;
  }
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    checkinId: string;
    nextCheckInDue: string;
    riskScore: number;
  }
}
```

#### GET /api/guardian/checkin/status
**Purpose**: Get current check-in status

**Response**:
```typescript
{
  success: boolean;
  data: {
    isEnabled: boolean;
    nextCheckInDue: string | null;
    lastCheckIn: string | null;
    currentRiskScore: number;
    missedCheckIns: number;
  }
}
```

### 3.4 Escalation API

#### POST /api/guardian/escalate
**Purpose**: Trigger escalation (internal use)

**Request**:
```typescript
{
  userId: string;
  stage: number; // 1-4
  reason: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    eventId: string;
    notificationsSent: number;
  }
}
```

## 4. Risk Scoring Algorithm

### 4.1 Risk Factors

```typescript
interface RiskFactors {
  consecutiveMissedCheckins: number; // Weight: 15 per miss
  distressLanguageFrequency: number; // Weight: 10 per occurrence (7-day window)
  decliningMoodTrend: boolean; // Weight: 20 if true
  explicitCrisisKeywords: number; // Weight: 25 per occurrence (requires confirmation)
  positiveCheckins: number; // Weight: -10 per positive checkin
}

function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;
  
  // Consecutive missed check-ins
  score += factors.consecutiveMissedCheckins * 15;
  
  // Distress language (only if 3+ in 7 days)
  if (factors.distressLanguageFrequency >= 3) {
    score += factors.distressLanguageFrequency * 10;
  }
  
  // Declining mood trend
  if (factors.decliningMoodTrend) {
    score += 20;
  }
  
  // Explicit crisis keywords (requires user confirmation)
  score += factors.explicitCrisisKeywords * 25;
  
  // Positive check-ins reduce score
  score -= factors.positiveCheckins * 10;
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, score));
}
```

### 4.2 Risk Assessment Rules

1. **Never trigger from single message**: Require 3+ occurrences in 7-day window
2. **Conservative thresholds**: Err on side of not escalating
3. **User confirmation required**: For explicit crisis keywords
4. **Decay over time**: Positive check-ins reduce score
5. **Transparent calculation**: User can see factors contributing to score

## 5. Escalation Logic

### 5.1 Stage Definitions

```typescript
enum EscalationStage {
  NONE = 0,
  MISSED_CHECKIN = 1,
  NO_RESPONSE = 2,
  HIGH_RISK_CONFIRMATION = 3,
  EMERGENCY_CONTACT = 4
}

interface EscalationConfig {
  stage: EscalationStage;
  triggerConditions: () => boolean;
  actions: () => Promise<void>;
  timeoutMinutes: number;
}
```

### 5.2 Stage 1: Missed Check-in

**Trigger**: Check-in not completed within 1 hour of scheduled time

**Actions**:
- Send in-app notification
- Log event in crisis_events
- Set next escalation timer (2 hours)

**User can**:
- Complete check-in (stops escalation)
- Snooze (delays 1 hour)
- Disable Guardian Mode

### 5.3 Stage 2: No Response

**Trigger**: No response to Stage 1 after 2 hours

**Actions**:
- Send SMS to user (if enabled)
- Send email to user
- Log event
- Set next escalation timer (4 hours)

**User can**:
- Respond via SMS link
- Complete check-in via email link
- Disable via link

### 5.4 Stage 3: High Risk Confirmation

**Trigger**: 
- Risk score > 40 AND
- 3+ consecutive missed check-ins

**Actions**:
- Display prominent in-app modal
- Send SMS with confirmation link
- Send email with confirmation link
- Log event
- Set next escalation timer (4 hours)

**User must**:
- Explicitly confirm they're okay
- Complete check-in
- Or disable Guardian Mode

### 5.5 Stage 4: Emergency Contact Notification

**Trigger**:
- No response to Stage 3 after 4 hours AND
- Risk score > 60

**Actions**:
- Send notification to verified emergency contacts
- Include: User's name, that they've missed check-ins
- Exclude: Specific messages, diagnosis, medical info
- Log event with contact notified
- Do NOT escalate further

**Contact receives**:
```
"Your emergency contact [User Name] has missed several wellness check-ins on Nebula AI. 
Please reach out to them to ensure they're okay. 

This is not a medical emergency alert. If you believe they are in immediate danger, 
please contact local emergency services directly.

To opt out of future notifications: [link]"
```

## 6. Notification System

### 6.1 Notification Types

```typescript
interface Notification {
  type: 'in_app' | 'push' | 'email' | 'sms';
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipient: 'user' | 'emergency_contact';
  template: string;
  data: Record<string, any>;
}
```

### 6.2 Delivery Rules

1. **In-app**: Always attempt first
2. **Push**: If user has enabled and app installed
3. **Email**: Fallback for all stages
4. **SMS**: Only for Stage 2+ and emergency contacts

### 6.3 Retry Logic

- Retry 3 times with exponential backoff
- If SMS fails, fallback to email
- Log all delivery attempts
- Alert admin if all methods fail

## 7. Consent Flow

### 7.1 Disclaimer Modal

```typescript
interface DisclaimerContent {
  version: string; // '1.0'
  sections: {
    title: string;
    content: string;
    mustAcknowledge: boolean;
  }[];
}

const DISCLAIMER_V1: DisclaimerContent = {
  version: '1.0',
  sections: [
    {
      title: 'Not a Medical Service',
      content: 'Guardian Mode is NOT a medical diagnosis system, NOT a therapy service, and NOT a replacement for professional mental health care.',
      mustAcknowledge: true
    },
    {
      title: 'Not an Emergency Service',
      content: 'Guardian Mode does NOT contact emergency services. If you are in immediate danger, call 911 or your local emergency number.',
      mustAcknowledge: true
    },
    {
      title: 'How It Works',
      content: 'Guardian Mode sends you scheduled check-in reminders. If you miss multiple check-ins and meet certain criteria, your emergency contact may be notified.',
      mustAcknowledge: false
    },
    {
      title: 'Your Control',
      content: 'You can disable Guardian Mode at any time. You control who your emergency contacts are and what they can see.',
      mustAcknowledge: true
    },
    {
      title: 'Limitations',
      content: 'Guardian Mode cannot prevent crises and may not detect all situations. It is a supplementary tool only.',
      mustAcknowledge: true
    }
  ]
};
```

### 7.2 Consent Checklist

User must check all boxes:
- [ ] I understand this is not a medical service
- [ ] I understand this is not an emergency service  
- [ ] I understand I can disable this at any time
- [ ] I have read and understand the full terms
- [ ] I consent to my emergency contact being notified under the conditions described

### 7.3 Emergency Contact Verification

```typescript
async function verifyEmergencyContact(contactId: string): Promise<void> {
  // 1. Generate 6-digit OTP
  const otp = generateOTP();
  
  // 2. Hash and store
  const hashedOTP = await hashOTP(otp);
  await storeVerificationCode(contactId, hashedOTP);
  
  // 3. Send via SMS and email
  await sendVerificationSMS(contact.phone, otp);
  await sendVerificationEmail(contact.email, otp);
  
  // 4. Set expiration (15 minutes)
  await setVerificationExpiration(contactId, 15);
}
```

## 8. Background Services

### 8.1 Check-in Scheduler

```typescript
// Runs every 5 minutes
async function checkInScheduler() {
  const now = new Date();
  
  // Find all users with check-ins due
  const dueCheckIns = await supabase
    .from('guardian_settings')
    .select('*')
    .eq('is_enabled', true)
    .lte('next_check_in_due', now.toISOString());
  
  for (const setting of dueCheckIns) {
    // Create check-in record
    await createCheckIn(setting.user_id, now);
    
    // Send reminder
    await sendCheckInReminder(setting.user_id);
    
    // Update next check-in time
    await updateNextCheckIn(setting.user_id, setting.check_in_interval);
  }
}
```

### 8.2 Escalation Engine

```typescript
// Runs every 10 minutes
async function escalationEngine() {
  const now = new Date();
  
  // Find missed check-ins
  const missedCheckIns = await supabase
    .from('wellness_checkins')
    .select('*, guardian_settings(*)')
    .eq('status', 'pending')
    .lt('scheduled_time', new Date(now.getTime() - 60 * 60 * 1000)); // 1 hour ago
  
  for (const checkIn of missedCheckIns) {
    // Determine escalation stage
    const stage = await determineEscalationStage(checkIn.user_id);
    
    // Execute escalation
    await executeEscalation(checkIn.user_id, stage);
  }
}
```

## 9. Security Considerations

### 9.1 Data Encryption

- Emergency contact phone/email: AES-256 encryption
- Wellness notes: AES-256 encryption
- Verification codes: bcrypt hashing
- Opt-out tokens: Cryptographically secure random

### 9.2 Access Control

- Users can only access their own Guardian Mode data
- Emergency contacts can only be added by user
- Contacts can opt-out at any time
- Admin cannot view encrypted wellness notes

### 9.3 Audit Logging

All actions logged in crisis_events:
- Guardian Mode enabled/disabled
- Emergency contact added/removed/verified
- Check-ins completed/missed
- Escalations triggered
- Notifications sent
- User responses

## 10. Testing Strategy

### 10.1 Unit Tests

- Risk score calculation
- Escalation stage determination
- Notification delivery
- Encryption/decryption
- OTP generation/verification

### 10.2 Integration Tests

- Complete consent flow
- Emergency contact verification
- Check-in completion
- Escalation progression
- Notification delivery

### 10.3 End-to-End Tests

- User enables Guardian Mode
- User completes check-ins
- User misses check-ins → escalation
- Emergency contact receives notification
- User disables Guardian Mode

### 10.4 Load Tests

- 1000 concurrent check-ins
- 100 simultaneous escalations
- Notification delivery under load

## 11. Monitoring and Alerts

### 11.1 Metrics to Track

- Guardian Mode activation rate
- Check-in completion rate
- Escalation frequency by stage
- False positive rate
- Notification delivery success rate
- Emergency contact verification rate

### 11.2 Alerts

- Failed notification delivery (critical)
- Escalation to Stage 4 (high)
- Multiple users in Stage 3+ (medium)
- Check-in scheduler failure (critical)

## 12. Deployment Plan

### Phase 1: Database Setup
- Create tables
- Set up RLS policies
- Configure encryption

### Phase 2: Backend APIs
- Implement all API routes
- Set up background services
- Configure notification system

### Phase 3: Frontend UI
- Consent flow
- Settings management
- Check-in interface
- Event history

### Phase 4: Testing
- Unit tests
- Integration tests
- User acceptance testing

### Phase 5: Soft Launch
- Enable for beta users
- Monitor metrics
- Gather feedback

### Phase 6: Full Launch
- Enable for all users
- Documentation
- Support training

## 13. Success Criteria

- [ ] All database tables created and tested
- [ ] RLS policies prevent unauthorized access
- [ ] Consent flow requires all acknowledgments
- [ ] Emergency contact verification works
- [ ] Check-in reminders sent on schedule
- [ ] All 4 escalation stages tested
- [ ] Risk scoring never triggers from single message
- [ ] Notifications delivered reliably
- [ ] User can disable at any time
- [ ] All events logged in crisis_events
- [ ] No placeholder logic remains
- [ ] Documentation complete
