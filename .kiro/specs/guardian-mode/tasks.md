# Guardian Mode - Implementation Tasks

## Phase 1: Database Setup

### 1.1 Create Database Schema
- [x] 1.1.1 Create `guardian_settings` table with all fields
- [x] 1.1.2 Create `emergency_contacts` table with encryption
- [x] 1.1.3 Create `crisis_events` table with event types
- [x] 1.1.4 Create `wellness_checkins` table with status enum
- [x] 1.1.5 Add all indexes for performance
- [x] 1.1.6 Add check constraints for data validation

### 1.2 Configure Row Level Security
- [x] 1.2.1 Enable RLS on all Guardian Mode tables
- [x] 1.2.2 Create policy: Users can view own guardian settings
- [x] 1.2.3 Create policy: Users can update own guardian settings
- [x] 1.2.4 Create policy: Users can manage own emergency contacts
- [x] 1.2.5 Create policy: Users can view own crisis events
- [x] 1.2.6 Create policy: System can insert crisis events (service role)
- [x] 1.2.7 Create policy: Users can view/update own checkins
- [ ] 1.2.8 Test RLS policies with different user roles

### 1.3 Set Up Encryption
- [x] 1.3.1 Configure encryption for emergency contact phone numbers
- [x] 1.3.2 Configure encryption for emergency contact emails
- [x] 1.3.3 Configure encryption for wellness notes
- [ ] 1.3.4 Test encryption/decryption functions
- [ ] 1.3.5 Verify encrypted data cannot be read without key

## Phase 2: Backend API Implementation

### 2.1 Guardian Settings API
- [x] 2.1.1 Create `/api/guardian/settings/enable` endpoint
- [x] 2.1.2 Implement consent validation logic
- [x] 2.1.3 Create `/api/guardian/settings/disable` endpoint
- [x] 2.1.4 Create `/api/guardian/settings` GET endpoint
- [x] 2.1.5 Create `/api/guardian/settings` PATCH endpoint
- [ ] 2.1.6 Add authentication middleware
- [ ] 2.1.7 Add input validation
- [ ] 2.1.8 Add error handling
- [ ] 2.1.9 Write unit tests for settings API

### 2.2 Emergency Contacts API
- [x] 2.2.1 Create `/api/guardian/contacts` POST endpoint
- [x] 2.2.2 Implement OTP generation function
- [x] 2.2.3 Implement OTP hashing function
- [x] 2.2.4 Create `/api/guardian/contacts/verify` endpoint
- [x] 2.2.5 Implement OTP verification logic
- [x] 2.2.6 Create `/api/guardian/contacts` GET endpoint
- [x] 2.2.7 Create `/api/guardian/contacts/:id` DELETE endpoint
- [x] 2.2.8 Implement 3-contact limit validation
- [ ] 2.2.9 Add SMS sending for OTP
- [ ] 2.2.10 Add email sending for OTP
- [ ] 2.2.11 Write unit tests for contacts API

### 2.3 Check-in API
- [x] 2.3.1 Create `/api/guardian/checkin/complete` endpoint
- [x] 2.3.2 Implement mood rating validation
- [x] 2.3.3 Implement notes encryption
- [x] 2.3.4 Update next check-in time logic
- [x] 2.3.5 Create `/api/guardian/checkin/status` endpoint
- [ ] 2.3.6 Create `/api/guardian/checkin/snooze` endpoint
- [ ] 2.3.7 Write unit tests for check-in API

### 2.4 Escalation API
- [ ] 2.4.1 Create `/api/guardian/escalate` endpoint (internal)
- [ ] 2.4.2 Implement escalation stage determination logic
- [ ] 2.4.3 Implement Stage 1 actions (in-app notification)
- [ ] 2.4.4 Implement Stage 2 actions (SMS/email to user)
- [ ] 2.4.5 Implement Stage 3 actions (confirmation prompt)
- [ ] 2.4.6 Implement Stage 4 actions (notify emergency contact)
- [ ] 2.4.7 Add escalation timeout logic
- [ ] 2.4.8 Write unit tests for escalation logic

### 2.5 Events API
- [x] 2.5.1 Create `/api/guardian/events` GET endpoint
- [x] 2.5.2 Implement pagination for events
- [x] 2.5.3 Implement event filtering by type
- [ ] 2.5.4 Create `/api/guardian/events/export` endpoint
- [ ] 2.5.5 Write unit tests for events API

## Phase 3: Risk Scoring System

### 3.1 Risk Calculation
- [x] 3.1.1 Create risk scoring utility function
- [x] 3.1.2 Implement consecutive missed check-ins factor
- [x] 3.1.3 Implement distress language frequency factor
- [x] 3.1.4 Implement declining mood trend detection
- [x] 3.1.5 Implement explicit crisis keywords detection
- [x] 3.1.6 Implement positive check-ins score reduction
- [x] 3.1.7 Add 7-day rolling window for pattern detection
- [x] 3.1.8 Ensure single message never triggers escalation
- [ ] 3.1.9 Write comprehensive unit tests for risk scoring
- [ ] 3.1.10 Test edge cases (all zeros, all max values)

### 3.2 Risk Assessment Integration
- [x] 3.2.1 Integrate risk scoring with check-in completion
- [ ] 3.2.2 Update risk score on missed check-ins
- [ ] 3.2.3 Store risk score history in crisis_events
- [ ] 3.2.4 Create API endpoint to view risk score breakdown
- [ ] 3.2.5 Test risk score updates in real scenarios

## Phase 4: Background Services

### 4.1 Check-in Scheduler
- [ ] 4.1.1 Create cron job for check-in scheduler (runs every 5 min)
- [ ] 4.1.2 Implement logic to find due check-ins
- [ ] 4.1.3 Create wellness_checkins records for due check-ins
- [ ] 4.1.4 Send check-in reminders (in-app)
- [ ] 4.1.5 Update next_check_in_due timestamp
- [ ] 4.1.6 Handle quiet hours logic
- [ ] 4.1.7 Add error handling and retry logic
- [ ] 4.1.8 Add logging for scheduler runs
- [ ] 4.1.9 Test scheduler with various intervals

### 4.2 Escalation Engine
- [ ] 4.2.1 Create cron job for escalation engine (runs every 10 min)
- [ ] 4.2.2 Implement logic to find missed check-ins
- [ ] 4.2.3 Determine appropriate escalation stage
- [ ] 4.2.4 Execute escalation actions
- [ ] 4.2.5 Track escalation state per user
- [ ] 4.2.6 Implement escalation timeout logic
- [ ] 4.2.7 Add error handling and retry logic
- [ ] 4.2.8 Add logging for escalation runs
- [ ] 4.2.9 Test escalation progression through all stages

### 4.3 Notification Service
- [ ] 4.3.1 Create notification service utility
- [ ] 4.3.2 Implement in-app notification delivery
- [ ] 4.3.3 Implement push notification delivery
- [ ] 4.3.4 Implement email notification delivery
- [ ] 4.3.5 Implement SMS notification delivery
- [ ] 4.3.6 Add retry logic (3 attempts with backoff)
- [ ] 4.3.7 Add fallback logic (SMS fails → email)
- [ ] 4.3.8 Log all notification attempts
- [ ] 4.3.9 Test notification delivery for all types

## Phase 5: Frontend Implementation

### 5.1 Consent Flow UI
- [ ] 5.1.1 Create Guardian Mode settings page
- [ ] 5.1.2 Create disclaimer modal component
- [ ] 5.1.3 Implement scrollable disclaimer content
- [ ] 5.1.4 Create consent checkboxes (all required)
- [ ] 5.1.5 Disable "Enable" button until all checked
- [ ] 5.1.6 Create emergency contact form
- [ ] 5.1.7 Implement contact verification UI
- [ ] 5.1.8 Create check-in schedule selector
- [ ] 5.1.9 Show confirmation after successful activation
- [ ] 5.1.10 Test complete consent flow end-to-end

### 5.2 Emergency Contact Management
- [ ] 5.2.1 Create emergency contacts list component
- [ ] 5.2.2 Create add contact form
- [ ] 5.2.3 Create OTP verification input
- [ ] 5.2.4 Show verification status (pending/verified)
- [ ] 5.2.5 Implement contact removal with confirmation
- [ ] 5.2.6 Show 3-contact limit warning
- [ ] 5.2.7 Test contact management flows

### 5.3 Check-in Interface
- [ ] 5.3.1 Create check-in reminder notification component
- [ ] 5.3.2 Create check-in completion modal
- [ ] 5.3.3 Implement mood rating slider (1-10)
- [ ] 5.3.4 Create optional notes textarea
- [ ] 5.3.5 Show next check-in time after completion
- [ ] 5.3.6 Implement snooze functionality
- [ ] 5.3.7 Test check-in completion flow

### 5.4 Guardian Mode Dashboard
- [ ] 5.4.1 Create Guardian Mode status card
- [ ] 5.4.2 Show current risk score (if enabled)
- [ ] 5.4.3 Show next check-in time
- [ ] 5.4.4 Show last check-in time
- [ ] 5.4.5 Show emergency contacts count
- [ ] 5.4.6 Create "Disable Guardian Mode" button
- [ ] 5.4.7 Test dashboard displays correct data

### 5.5 Event History Viewer
- [ ] 5.5.1 Create events list component
- [ ] 5.5.2 Implement pagination
- [ ] 5.5.3 Implement event type filtering
- [ ] 5.5.4 Show event details (timestamp, type, metadata)
- [ ] 5.5.5 Create export functionality
- [ ] 5.5.6 Test event history display

### 5.6 Escalation UI
- [ ] 5.6.1 Create Stage 1 in-app notification
- [ ] 5.6.2 Create Stage 2 SMS/email templates
- [ ] 5.6.3 Create Stage 3 confirmation modal
- [ ] 5.6.4 Create Stage 4 emergency contact notification template
- [ ] 5.6.5 Implement "I'm okay" quick response button
- [ ] 5.6.6 Test all escalation UI components

## Phase 6: Testing

### 6.1 Unit Tests
- [ ] 6.1.1 Test risk scoring algorithm with various inputs
- [ ] 6.1.2 Test escalation stage determination logic
- [ ] 6.1.3 Test OTP generation and verification
- [ ] 6.1.4 Test encryption/decryption functions
- [ ] 6.1.5 Test notification delivery logic
- [ ] 6.1.6 Achieve >80% code coverage

### 6.2 Integration Tests
- [ ] 6.2.1 Test complete consent flow
- [ ] 6.2.2 Test emergency contact verification flow
- [ ] 6.2.3 Test check-in completion flow
- [ ] 6.2.4 Test escalation progression (Stage 1 → 4)
- [ ] 6.2.5 Test Guardian Mode disable flow
- [ ] 6.2.6 Test notification delivery across all channels

### 6.3 End-to-End Tests
- [ ] 6.3.1 Test: User enables Guardian Mode
- [ ] 6.3.2 Test: User adds and verifies emergency contact
- [ ] 6.3.3 Test: User completes scheduled check-ins
- [ ] 6.3.4 Test: User misses check-in → Stage 1 escalation
- [ ] 6.3.5 Test: No response → Stage 2 escalation
- [ ] 6.3.6 Test: High risk + misses → Stage 3 escalation
- [ ] 6.3.7 Test: No response → Stage 4 (contact notified)
- [ ] 6.3.8 Test: User responds at Stage 3 (stops escalation)
- [ ] 6.3.9 Test: User disables Guardian Mode
- [ ] 6.3.10 Test: Emergency contact opts out

### 6.4 Security Tests
- [ ] 6.4.1 Test RLS policies prevent unauthorized access
- [ ] 6.4.2 Test encrypted data cannot be read without key
- [ ] 6.4.3 Test OTP codes are properly hashed
- [ ] 6.4.4 Test API endpoints require authentication
- [ ] 6.4.5 Test rate limiting on sensitive endpoints

### 6.5 Performance Tests
- [ ] 6.5.1 Test check-in scheduler with 1000 users
- [ ] 6.5.2 Test escalation engine with 100 simultaneous escalations
- [ ] 6.5.3 Test notification delivery under load
- [ ] 6.5.4 Test risk score calculation performance
- [ ] 6.5.5 Verify all operations complete within SLA

## Phase 7: Documentation

### 7.1 User Documentation
- [ ] 7.1.1 Write Guardian Mode overview guide
- [ ] 7.1.2 Write consent flow guide
- [ ] 7.1.3 Write emergency contact setup guide
- [ ] 7.1.4 Write check-in guide
- [ ] 7.1.5 Write escalation explanation
- [ ] 7.1.6 Write FAQ document
- [ ] 7.1.7 Create video tutorial (optional)

### 7.2 Technical Documentation
- [ ] 7.2.1 Document database schema
- [ ] 7.2.2 Document API endpoints
- [ ] 7.2.3 Document risk scoring algorithm
- [ ] 7.2.4 Document escalation logic
- [ ] 7.2.5 Document background services
- [ ] 7.2.6 Create deployment guide

### 7.3 Legal Documentation
- [ ] 7.3.1 Finalize disclaimer text
- [ ] 7.3.2 Create terms of service addendum
- [ ] 7.3.3 Create privacy policy addendum
- [ ] 7.3.4 Review with legal counsel (if available)

## Phase 8: Deployment

### 8.1 Pre-Deployment
- [ ] 8.1.1 Run all tests and verify passing
- [ ] 8.1.2 Review code for placeholder logic
- [ ] 8.1.3 Verify no hardcoded credentials
- [ ] 8.1.4 Set up monitoring and alerts
- [ ] 8.1.5 Prepare rollback plan

### 8.2 Database Migration
- [ ] 8.2.1 Backup production database
- [ ] 8.2.2 Run migration scripts
- [ ] 8.2.3 Verify tables created correctly
- [ ] 8.2.4 Verify RLS policies active
- [ ] 8.2.5 Test database with sample data

### 8.3 Backend Deployment
- [ ] 8.3.1 Deploy API routes
- [ ] 8.3.2 Deploy background services
- [ ] 8.3.3 Configure cron jobs
- [ ] 8.3.4 Verify API endpoints responding
- [ ] 8.3.5 Verify background services running

### 8.4 Frontend Deployment
- [ ] 8.4.1 Deploy UI components
- [ ] 8.4.2 Verify consent flow works
- [ ] 8.4.3 Verify check-in interface works
- [ ] 8.4.4 Test on multiple browsers
- [ ] 8.4.5 Test on mobile devices

### 8.5 Post-Deployment
- [ ] 8.5.1 Monitor error logs for 24 hours
- [ ] 8.5.2 Monitor notification delivery rates
- [ ] 8.5.3 Monitor escalation triggers
- [ ] 8.5.4 Gather initial user feedback
- [ ] 8.5.5 Address any critical issues

## Phase 9: Validation

### 9.1 Feature Validation
- [ ] 9.1.1 Verify: User can enable Guardian Mode with consent
- [ ] 9.1.2 Verify: Emergency contact verification works
- [ ] 9.1.3 Verify: Check-in reminders sent on schedule
- [ ] 9.1.4 Verify: Missed check-ins trigger Stage 1
- [ ] 9.1.5 Verify: Stage 2 sends SMS/email to user
- [ ] 9.1.6 Verify: Stage 3 requires high risk + misses
- [ ] 9.1.7 Verify: Stage 4 notifies emergency contact
- [ ] 9.1.8 Verify: User can stop escalation at any stage
- [ ] 9.1.9 Verify: User can disable Guardian Mode
- [ ] 9.1.10 Verify: All events logged in crisis_events

### 9.2 Risk Scoring Validation
- [ ] 9.2.1 Verify: Single message never triggers escalation
- [ ] 9.2.2 Verify: Requires 3+ occurrences in 7 days
- [ ] 9.2.3 Verify: Conservative thresholds applied
- [ ] 9.2.4 Verify: Positive check-ins reduce score
- [ ] 9.2.5 Verify: User can view risk score breakdown

### 9.3 Security Validation
- [ ] 9.3.1 Verify: RLS prevents unauthorized access
- [ ] 9.3.2 Verify: Encrypted data unreadable without key
- [ ] 9.3.3 Verify: OTP codes properly hashed
- [ ] 9.3.4 Verify: All actions logged in audit trail
- [ ] 9.3.5 Verify: No sensitive data in logs

### 9.4 Compliance Validation
- [ ] 9.4.1 Verify: Disclaimer clearly states not medical service
- [ ] 9.4.2 Verify: Disclaimer clearly states not emergency service
- [ ] 9.4.3 Verify: User consent properly recorded
- [ ] 9.4.4 Verify: User can disable at any time
- [ ] 9.4.5 Verify: Emergency contact can opt out
- [ ] 9.4.6 Verify: No automatic police integration
- [ ] 9.4.7 Verify: No diagnosis claims made
- [ ] 9.4.8 Verify: No hidden monitoring

## Completion Criteria

**DO NOT mark this spec as complete unless ALL of the following are verified:**

- [ ] All database tables created and tested
- [ ] All RLS policies implemented and tested
- [ ] All API endpoints implemented and tested
- [ ] Risk scoring algorithm implemented and tested (never triggers from single message)
- [ ] All 4 escalation stages implemented and tested
- [ ] Consent flow requires all acknowledgments
- [ ] Emergency contact verification works end-to-end
- [ ] Check-in scheduler runs reliably
- [ ] Escalation engine runs reliably
- [ ] Notifications delivered across all channels
- [ ] User can disable Guardian Mode at any time
- [ ] All events logged in crisis_events table
- [ ] No placeholder logic remains
- [ ] All tests passing (unit, integration, e2e)
- [ ] Documentation complete
- [ ] Security review passed
- [ ] Legal review passed (if required)
- [ ] Deployed to production
- [ ] Monitoring and alerts configured
- [ ] No critical bugs in first 48 hours

**Estimated Time**: 80-120 hours
**Priority**: High
**Risk Level**: High (involves user safety)
