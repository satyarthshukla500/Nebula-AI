'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import heavy components to reduce bundle size
const QuizSetup = dynamic(() => import('@/components/interactive-quiz/QuizSetup').then(mod => ({ default: mod.QuizSetup })), { ssr: false })
const QuizGame = dynamic(() => import('@/components/interactive-quiz/QuizGame').then(mod => ({ default: mod.QuizGame })), { ssr: false })
const QuizResults = dynamic(() => import('@/components/interactive-quiz/QuizResults').then(mod => ({ default: mod.QuizResults })), { ssr: false })

type QuizScreen = 'setup' | 'game' | 'results'

export interface QuizSettings {
  topic: string
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
  numberOfQuestions: number
  mode: 'classic' | 'survival' | 'time-attack' | 'streak-challenge'
  timer: number // 0 = off, otherwise seconds
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

export interface QuizAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number
  pointsEarned: number
  streak: number
}

export interface QuizResultsData {
  score: number
  totalQuestions: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  avgTimePerQuestion: number
  maxStreak: number
  badges: string[]
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
}

export default function InteractiveQuizPage() {
  const [screen, setScreen] = useState<QuizScreen>('setup')
  const [settings, setSettings] = useState<QuizSettings | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [results, setResults] = useState<QuizResultsData | null>(null)

  const handleStartQuiz = (quizSettings: QuizSettings, generatedQuestions: QuizQuestion[]) => {
    setSettings(quizSettings)
    setQuestions(generatedQuestions)
    setScreen('game')
  }

  const handleQuizComplete = (quizResults: QuizResultsData) => {
    setResults(quizResults)
    setScreen('results')
  }

  const handleTryAgain = () => {
    if (settings && questions.length > 0) {
      setScreen('game')
    }
  }

  const handleNewTopic = () => {
    setSettings(null)
    setQuestions([])
    setResults(null)
    setScreen('setup')
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
      {screen === 'setup' && (
        <div className="h-full">
          <QuizSetup onStartQuiz={handleStartQuiz} />
        </div>
      )}

      {screen === 'game' && settings && questions.length > 0 && (
        <div className="h-full">
          <QuizGame
            settings={settings}
            questions={questions}
            onComplete={handleQuizComplete}
          />
        </div>
      )}

      {screen === 'results' && results && (
        <div className="h-full">
          <QuizResults
            results={results}
            onTryAgain={handleTryAgain}
            onNewTopic={handleNewTopic}
          />
        </div>
      )}
    </div>
  )
}
