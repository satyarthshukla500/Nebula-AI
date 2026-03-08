# Quiz Features Implementation Plan

## ✅ COMPLETED

### Bug Fixes
1. **BUG 1: File Upload Error** ✅
   - Removed S3 dependency
   - Implemented base64 encoding in frontend
   - Updated chat API to handle base64 file data
   - User-friendly error messages
   - Files: `src/store/chat-store.ts`, `src/app/api/workspaces/chat/route.ts`

2. **BUG 2: Chat History Not Saved** ✅
   - Auto-save after every AI response
   - Session ID properly returned
   - MongoDB stores all required fields
   - Chat history sidebar loads sessions correctly
   - Files: `src/app/api/workspaces/chat/route.ts`

### Quiz Foundation
3. **Quiz Types** ✅
   - Created comprehensive TypeScript types
   - File: `src/types/quiz.ts`

4. **Quiz Generation API** ✅
   - Endpoint: `POST /api/quiz/generate`
   - Generates questions from topic or document using AI
   - File: `src/app/api/quiz/generate/route.ts`

5. **Quiz Creation API** ✅
   - Endpoint: `POST /api/quiz/create`
   - Creates quiz with 6-character code
   - File: `src/app/api/quiz/create/route.ts`

---

## 🚧 REMAINING IMPLEMENTATION

### API Endpoints Needed

#### Quiz Arena (Teacher-Student)

**Quiz Management:**
- `GET /api/quiz/list` - List all quizzes for teacher
- `GET /api/quiz/[id]` - Get quiz details
- `PUT /api/quiz/[id]` - Update quiz
- `DELETE /api/quiz/[id]` - Delete quiz
- `POST /api/quiz/[id]/publish` - Publish quiz
- `POST /api/quiz/[id]/close` - Close quiz

**Student Management:**
- `POST /api/quiz/[id]/enroll` - Enroll student via code
- `GET /api/quiz/[id]/students` - List enrolled students
- `DELETE /api/quiz/[id]/students/[studentId]` - Remove student

**Quiz Taking:**
- `POST /api/quiz/[id]/start` - Start quiz attempt
- `POST /api/quiz/[id]/submit` - Submit quiz answers
- `GET /api/quiz/[id]/attempts` - Get student attempts
- `POST /api/quiz/[id]/track` - Track tab switches (anti-cheat)

**Analytics:**
- `GET /api/quiz/[id]/analytics` - Get quiz analytics
- `GET /api/quiz/[id]/results` - Get all student results
- `GET /api/quiz/[id]/export` - Export results as CSV

#### Interactive Quiz (Personal Gamified)

**Quiz Management:**
- `POST /api/interactive-quiz/start` - Start interactive quiz
- `POST /api/interactive-quiz/submit` - Submit answer
- `POST /api/interactive-quiz/complete` - Complete quiz

**User Profile:**
- `GET /api/user/profile` - Get user profile (level, XP, badges)
- `GET /api/user/quiz-history` - Get quiz history
- `GET /api/user/leaderboard` - Get leaderboard

**Badges:**
- `GET /api/badges` - List all available badges

---

### Frontend Components Needed

#### Quiz Arena Components

**Teacher Dashboard:**
- `src/app/dashboard/quiz-arena/teacher/page.tsx` - Main teacher dashboard
- `src/components/quiz/TeacherDashboard.tsx` - Dashboard layout
- `src/components/quiz/QuizCreator.tsx` - Quiz creation wizard
- `src/components/quiz/QuestionEditor.tsx` - Edit individual questions
- `src/components/quiz/QuestionList.tsx` - Drag-and-drop question list
- `src/components/quiz/QuizSettings.tsx` - Quiz settings form
- `src/components/quiz/StudentManagement.tsx` - Student list and invites
- `src/components/quiz/LiveMonitoring.tsx` - Real-time quiz monitoring
- `src/components/quiz/QuizAnalytics.tsx` - Analytics dashboard
- `src/components/quiz/ResultsTable.tsx` - Student results table

**Student Experience:**
- `src/app/dashboard/quiz-arena/student/page.tsx` - Student dashboard
- `src/components/quiz/StudentDashboard.tsx` - Dashboard layout
- `src/components/quiz/QuizEnroll.tsx` - Enter quiz code
- `src/components/quiz/QuizInfo.tsx` - Quiz info before starting
- `src/components/quiz/QuizTaking.tsx` - Quiz taking interface
- `src/components/quiz/QuizTimer.tsx` - Countdown timer
- `src/components/quiz/QuizResult.tsx` - Result display
- `src/components/quiz/ScoreHistory.tsx` - Student score history

#### Interactive Quiz Components

**Setup & Game:**
- `src/app/dashboard/interactive-quiz/page.tsx` - Main page
- `src/components/interactive-quiz/SetupScreen.tsx` - Quiz configuration
- `src/components/interactive-quiz/GameScreen.tsx` - Main game interface
- `src/components/interactive-quiz/QuestionCard.tsx` - Animated question card
- `src/components/interactive-quiz/AnswerOptions.tsx` - Answer buttons
- `src/components/interactive-quiz/ProgressBar.tsx` - Progress indicator
- `src/components/interactive-quiz/ScoreDisplay.tsx` - Live score
- `src/components/interactive-quiz/StreakCounter.tsx` - Streak display with fire emoji
- `src/components/interactive-quiz/TimerBar.tsx` - Visual timer
- `src/components/interactive-quiz/FeedbackAnimation.tsx` - Correct/wrong animations
- `src/components/interactive-quiz/Confetti.tsx` - Confetti effect
- `src/components/interactive-quiz/EndScreen.tsx` - Final results
- `src/components/interactive-quiz/BadgeDisplay.tsx` - Earned badges
- `src/components/interactive-quiz/UserProfile.tsx` - Profile with level/XP
- `src/components/interactive-quiz/Leaderboard.tsx` - Leaderboard

---

### Database Schema (Supabase)

**Tables to Create:**

```sql
-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  questions JSONB NOT NULL,
  settings JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'active', 'closed')),
  quiz_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Student enrollments
CREATE TABLE quiz_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  student_email TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('enrolled', 'started', 'completed')),
  UNIQUE(quiz_id, student_id)
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  answers JSONB NOT NULL,
  score NUMERIC NOT NULL,
  passed BOOLEAN NOT NULL,
  tab_switches INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER NOT NULL
);

-- Interactive quiz attempts
CREATE TABLE interactive_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  settings JSONB NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  final_score INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  badges_earned TEXT[],
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  badges TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX idx_quizzes_code ON quizzes(quiz_code);
CREATE INDEX idx_enrollments_quiz ON quiz_enrollments(quiz_id);
CREATE INDEX idx_enrollments_student ON quiz_enrollments(student_id);
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_interactive_attempts_user ON interactive_quiz_attempts(user_id);
```

---

### CSS Animations Required

**Framer Motion Animations:**
- Slide-in for question cards
- Shake animation for wrong answers
- Green flash for correct answers
- Confetti burst effect
- Progress bar fill animation
- Timer color transition (green → yellow → red)
- Streak counter pulse
- Badge unlock animation
- Level up animation

**CSS Keyframes:**
```css
@keyframes correctFlash {
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(34, 197, 94, 0.2); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes streakPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

---

### Navigation Updates

**Add to Sidebar:**
```typescript
// src/components/layout/Sidebar.tsx
{
  name: 'Quiz Arena',
  href: '/dashboard/quiz-arena',
  icon: TrophyIcon,
  description: 'Teacher-Student Quiz Platform'
},
{
  name: 'Interactive Quiz',
  href: '/dashboard/interactive-quiz',
  icon: GamepadIcon,
  description: 'Gamified Personal Quiz'
}
```

---

### Environment Variables

No additional environment variables needed - uses existing AI and database configuration.

---

## Implementation Priority

1. **Phase 1: Core APIs** (2-3 hours)
   - Complete all Quiz Arena API endpoints
   - Complete all Interactive Quiz API endpoints
   - Create database tables

2. **Phase 2: Teacher Dashboard** (3-4 hours)
   - Quiz creation wizard
   - Question editor with drag-and-drop
   - Student management
   - Live monitoring
   - Analytics dashboard

3. **Phase 3: Student Experience** (2-3 hours)
   - Quiz enrollment
   - Quiz taking interface
   - Results display
   - Score history

4. **Phase 4: Interactive Quiz** (4-5 hours)
   - Setup screen
   - Game interface with animations
   - Feedback animations (confetti, shake, flash)
   - End screen with stats
   - Profile and leaderboard

5. **Phase 5: Polish** (1-2 hours)
   - Anti-cheat tab detection
   - CSV export
   - Badge system
   - XP and leveling

---

## Next Steps

To continue implementation, run:
```bash
# Create database tables
# (Run SQL from Database Schema section in Supabase SQL Editor)

# Then implement Phase 1 APIs
# Then implement Phase 2 Teacher Dashboard
# Then implement Phase 3 Student Experience
# Then implement Phase 4 Interactive Quiz
# Then implement Phase 5 Polish
```

---

## Files Created So Far

1. ✅ `src/types/quiz.ts` - All TypeScript types
2. ✅ `src/app/api/quiz/generate/route.ts` - AI question generation
3. ✅ `src/app/api/quiz/create/route.ts` - Quiz creation
4. ✅ `src/store/chat-store.ts` - Fixed file upload (base64)
5. ✅ `src/app/api/workspaces/chat/route.ts` - Fixed chat history saving

---

## Testing Checklist

### Bug Fixes
- [ ] Upload image in General Chat - should work without S3 errors
- [ ] Send message - check chat history sidebar shows conversation
- [ ] Click history item - should load conversation without errors

### Quiz Arena
- [ ] Teacher creates quiz from topic
- [ ] Teacher edits questions (drag-and-drop reorder)
- [ ] Teacher publishes quiz and gets code
- [ ] Student enrolls with code
- [ ] Student takes quiz with timer
- [ ] Teacher sees live monitoring
- [ ] Teacher views analytics after quiz closes
- [ ] Export results as CSV

### Interactive Quiz
- [ ] User configures quiz settings
- [ ] Quiz starts with slide-in animation
- [ ] Correct answer shows green flash + confetti
- [ ] Wrong answer shows red shake + correct answer
- [ ] Streak counter increases with fire emoji
- [ ] Timer bar changes color (green → yellow → red)
- [ ] End screen shows stats and badges
- [ ] XP added to profile
- [ ] Leaderboard updates

