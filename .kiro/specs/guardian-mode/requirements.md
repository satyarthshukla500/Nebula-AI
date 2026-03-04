# Guardian Mode - Requirements

## Overview
Guardian Mode is a consent-based wellness check-in system for Nebula AI's Mental Wellness workspace. It provides scheduled check-ins and escalation protocols while maintaining user autonomy and privacy.

## Critical Disclaimers
- **NOT a medical diagnosis system**
- **NOT an emergency service**
- **NOT a replacement for professional mental health care**
- User maintains full control and can disable at any time
- No automatic police/emergency service integration
- No hidden monitoring or surveillance

## 1. User Stories

### 1.1 Consent and Activation
**As a user**, I want to voluntarily enable Guardian Mode so that I have an additional safety net during difficult times.

**Acceptance Criteria:**
- User must manually opt-in (no default activation)
- User must read and acknowledge disclaimer
- User must add at least one emergency contact
- Emergency contact must verify via OTP
- System stores consent version and timestamp
- User can disable feature at any time

### 1.2 Check-in Scheduling
**As a user**, I want to set my own check-in schedule so that it fits my routine and needs.

**Acceptance Criteria:**
- User can set check-in interval (daily, every 12 hours, every 6 hours)
- User can set preferred check-in times
- System sends reminder notifications
- User can respond to check-ins easily
- Missed check-ins are logged

### 1.3 Emergency Contact Management
**As a user**, I want to add trusted emergency contacts who will only be notified in specific circumstances.

**Acceptance Criteria:**
- User can add up to 3 emergency contacts
- Each contact must verify via OTP
- User can specify what information contacts receive
- User can remove contacts at any time
- Contacts can opt-out of notifications

### 1.4 Escalation Protocol
**As a user**, I want a gradual escalation process that respects my autonomy while providing safety.

**Acceptance Criteria:**
- Stage 1: Missed check-in → in-app reminder
- Stage 2: No response after 2 hours → SMS/email to user
- Stage 3: High risk score + repeated missed check-ins → confirmation prompt
- Stage 4: No response + criteria met → notify emergency contact
- User can respond at any stage to stop escalation
- All escalations are logged

### 1.5 Risk Assessment
**As a system**, I need to conservatively assess risk based on patterns, not single messages.

**Acceptance Criteria:**
- Risk score based on repeated distress language over time
- Never trigger from single message
- Conservative thresholds (err on side of caution)
- User can view their risk assessment
- Risk factors are transparent and explainable

### 1.6 Transparency and Control
**As a user**, I want full visibility into how Guardian Mode works and what data is collected.

**Acceptance Criteria:**
- User can view all logged events
- User can see current risk score and factors
- User can export their data
- User can delete Guardian Mode data
- Clear documentation of how system works

## 2. Functional Requirements

### 2.1 Database Schema

#### guardian_settings
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- is_enabled (boolean)
- consent_version (text)
- consent_timestamp (timestamp)
- check_in_interval (interval) -- e.g., '12 hours'
- preferred_check_in_times (time[])
- last_check_in (timestamp)
- next_check_in_due (timestamp)
- risk_threshold (integer) -- 0-100
- notification_preferences (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### emergency_contacts
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- contact_name (text)
- contact_phone (text, encrypted)
- contact_email (text, encrypted)
- relationship (text)
- is_verified (boolean)
- verification_code (text, hashed)
- verification_sent_at (timestamp)
- verified_at (timestamp)
- notification_level (text) -- 'critical_only', 'all_escalations'
- can_receive_sms (boolean)
- can_receive_email (boolean)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### crisis_events
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- event_type (text) -- 'check_in_missed', 'escalation_stage_1', etc.
- event_timestamp (timestamp)
- risk_score_at_event (integer)
- escalation_stage (integer)
- user_response (text)
- user_response_timestamp (timestamp)
- contact_notified (boolean)
- contact_id (uuid, foreign key to emergency_contacts)
- notification_sent_at (timestamp)
- metadata (jsonb)
- created_at (timestamp)
```

#### wellness_checkins
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- scheduled_time (timestamp)
- completed_at (timestamp)
- status (text) -- 'completed', 'missed', 'late'
- mood_rating (integer) -- 1-10
- notes (text, encrypted)
- risk_indicators (jsonb)
- created_at (timestamp)
```

### 2.2 Risk Scoring Algorithm

**Conservative Approach:**
- Base score: 0
- Increment only on repeated patterns (3+ occurrences in 7 days)
- Decrement on positive check-ins
- Never exceed threshold from single message

**Risk Factors (each +10 points if repeated):**
- Distress language patterns
- Missed check-ins (consecutive)
- Declining mood ratings over time
- Explicit crisis keywords (but require confirmation)

**Risk Levels:**
- 0-20: Low (normal monitoring)
- 21-40: Moderate (increased check-in frequency suggested)
- 41-60: Elevated (Stage 3 escalation if check-ins missed)
- 61+: High (Stage 4 escalation if check-ins missed)

### 2.3 Escalation Stages

**Stage 1: Missed Check-in**
- Trigger: Check-in not completed within 1 hour of scheduled time
- Action: In-app notification reminder
- User can: Complete check-in, snooze, or disable

**Stage 2: No Response**
- Trigger: No response to Stage 1 after 2 hours
- Action: SMS and email to user
- User can: Respond via link, complete check-in

**Stage 3: High Risk + Repeated Misses**
- Trigger: Risk score >40 AND 3+ consecutive missed check-ins
- Action: Prominent confirmation prompt
- User must: Explicitly confirm they're okay or complete check-in

**Stage 4: Emergency Contact Notification**
- Trigger: No response to Stage 3 after 4 hours AND risk score >60
- Action: Notify emergency contact with limited information
- Contact receives: "Your contact [Name] has missed wellness check-ins. Please reach out to them."
- Does NOT include: Specific messages, diagnosis, or medical information

### 2.4 Consent Flow

1. User clicks "Enable Guardian Mode" in Mental Wellness settings
2. System displays disclaimer modal (must scroll to bottom)
3. User must check boxes:
   - [ ] I understand this is not a medical service
   - [ ] I understand this is not an emergency service
   - [ ] I understand I can disable this at any time
   - [ ] I have read the full terms
4. User adds emergency contact
5. System sends OTP to contact
6. Contact verifies (via SMS link or email)
7. User sets check-in schedule
8. Guardian Mode activated
9. Confirmation email sent to user with deactivation link

### 2.5 Notification System

**Check-in Reminders:**
- In-app notification (primary)
- Push notification (if enabled)
- Email (as backup)

**Escalation Notifications:**
- Stage 1: In-app only
- Stage 2: SMS + Email to user
- Stage 3: In-app modal + SMS + Email
- Stage 4: SMS + Email to emergency contact

**User Control:**
- Can disable any notification type
- Can set quiet hours
- Can snooze reminders

## 3. Non-Functional Requirements

### 3.1 Security
- All emergency contact info encrypted at rest
- All wellness notes encrypted
- Audit log of all access to Guardian Mode data
- No data sharing with third parties
- Compliance with HIPAA-like privacy standards

### 3.2 Performance
- Check-in reminders sent within 1 minute of scheduled time
- Escalation stages execute within defined timeframes
- Risk score calculation completes in <100ms

### 3.3 Reliability
- 99.9% uptime for check-in scheduler
- Redundant notification delivery (retry 3 times)
- Fallback to email if SMS fails

### 3.4 Usability
- Disclaimer in plain language (8th grade reading level)
- One-click check-in completion
- Clear visual indicators of Guardian Mode status
- Easy deactivation process

## 4. Constraints

### 4.1 Legal Constraints
- Must not claim to provide medical services
- Must not claim to prevent suicide or self-harm
- Must include liability disclaimers
- Must comply with local emergency service laws

### 4.2 Ethical Constraints
- No hidden monitoring
- No automatic police/emergency service calls
- User autonomy is paramount
- Transparent about all data collection

### 4.3 Technical Constraints
- Must work with existing Supabase infrastructure
- Must integrate with existing encryption system
- Must not impact performance of other features

## 5. Acceptance Criteria Summary

### Database
- [ ] All 4 tables created with correct schema
- [ ] RLS policies implemented
- [ ] Encryption configured for sensitive fields
- [ ] Indexes created for performance

### Consent Flow
- [ ] Disclaimer modal displays correctly
- [ ] All checkboxes must be checked to proceed
- [ ] Emergency contact verification works
- [ ] Consent timestamp stored
- [ ] User can disable at any time

### Check-in System
- [ ] User can set schedule
- [ ] Reminders sent on time
- [ ] Check-ins can be completed
- [ ] Missed check-ins logged

### Escalation
- [ ] Stage 1 triggers correctly
- [ ] Stage 2 sends SMS/email
- [ ] Stage 3 requires high risk + misses
- [ ] Stage 4 notifies contact appropriately
- [ ] User can stop escalation at any stage

### Risk Scoring
- [ ] Never triggers from single message
- [ ] Requires repeated patterns
- [ ] Conservative thresholds
- [ ] User can view score

### Transparency
- [ ] All events logged in crisis_events
- [ ] User can view event history
- [ ] User can export data
- [ ] Clear documentation provided

## 6. Out of Scope

- Automatic emergency service calls
- Medical diagnosis or assessment
- Therapy or counseling services
- Integration with healthcare providers
- Predictive suicide prevention
- Real-time monitoring of all messages
- Location tracking
- Contact with user's family without consent

## 7. Success Metrics

- User activation rate (target: 10% of Mental Wellness users)
- False positive rate (target: <5%)
- User retention after activation (target: >80% after 30 days)
- Emergency contact verification rate (target: >90%)
- User satisfaction with feature (target: >4/5 stars)

## 8. Risks and Mitigations

### Risk: False positives causing unnecessary worry
**Mitigation**: Conservative risk scoring, multiple escalation stages

### Risk: User disables after false positive
**Mitigation**: Clear explanation of why escalation occurred, adjustable thresholds

### Risk: Emergency contact doesn't respond
**Mitigation**: Allow multiple contacts, clear instructions to contacts

### Risk: Legal liability
**Mitigation**: Strong disclaimers, clear terms of service, no medical claims

### Risk: User in actual crisis doesn't respond
**Mitigation**: Multiple notification methods, escalation to emergency contact, but acknowledge system limitations in disclaimer
