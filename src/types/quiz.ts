// Quiz Arena Types

export type QuestionType = 'mcq' | 'true-false' | 'short-answer'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed'
export type QuizStatus = 'draft' | 'published' | 'active' | 'closed'

export interface QuizQuestion {
  id: string
  question: string
  type: QuestionType
  options?: string[] // For MCQ and True-False
  correctAnswer: string
  explanation?: string
  points: number
  timeLimit?: number // seconds
  order: number
}

export interface QuizSettings {
  numberOfQuestions: number
  difficulty: Difficulty
  questionTypes: QuestionType[]
  timeLimitPerQuestion?: number // seconds
  totalTimeLimit?: number // minutes
  passingScore: number // percentage
  allowRetakes: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
  showCorrectAnswers: boolean
  antiCheat: boolean
}

export interface Quiz {
  id: string
  teacherId: string
  title: string
  description?: string
  topic: string
  questions: QuizQuestion[]
  settings: QuizSettings
  status: QuizStatus
  quizCode: string // 6-character alphanumeric
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  closedAt?: Date
}

export interface StudentEnrollment {
  id: string
  quizId: string
  studentId: string
  studentEmail: string
  enrolledAt: Date
  status: 'enrolled' | 'started' | 'completed'
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  startedAt: Date
  submittedAt?: Date
  answers: {
    questionId: string
    answer: string
    isCorrect: boolean
    timeSpent: number // seconds
  }[]
  score: number // percentage
  passed: boolean
  tabSwitches: number // anti-cheat
  timeSpent: number // total seconds
}

export interface QuizAnalytics {
  quizId: string
  totalAttempts: number
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number // percentage
  questionAccuracy: {
    questionId: string
    correctCount: number
    totalAttempts: number
    accuracy: number // percentage
  }[]
}

// Interactive Quiz (Personal Gamified Mode) Types

export type GameMode = 'classic' | 'survival' | 'time-attack' | 'streak-challenge'

export interface InteractiveQuizSettings {
  topic: string
  difficulty: Difficulty
  numberOfQuestions: number
  questionTypes: QuestionType[]
  timerPerQuestion?: number // seconds (0 = off)
  gameMode: GameMode
}

export interface InteractiveQuizAttempt {
  id: string
  userId: string
  settings: InteractiveQuizSettings
  questions: QuizQuestion[]
  answers: {
    questionId: string
    answer: string
    isCorrect: boolean
    timeSpent: number
    pointsEarned: number
    streak: number
  }[]
  finalScore: number
  xpEarned: number
  badgesEarned: string[]
  completedAt: Date
}

export interface UserProfile {
  userId: string
  level: number
  totalXP: number
  badges: string[]
  quizHistory: {
    quizId: string
    topic: string
    score: number
    completedAt: Date
  }[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
}
