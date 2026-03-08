'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QuizSettings, QuizQuestion } from '@/app/dashboard/workspaces/interactive-quiz/page'

interface QuizSetupProps {
  onStartQuiz: (settings: QuizSettings, questions: QuizQuestion[]) => void
}

export function QuizSetup({ onStartQuiz }: QuizSetupProps) {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('medium')
  const [numberOfQuestions, setNumberOfQuestions] = useState(10)
  const [mode, setMode] = useState<'classic' | 'survival' | 'time-attack' | 'streak-challenge'>('classic')
  const [timer, setTimer] = useState(30)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // Call API to generate quiz questions
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          numberOfQuestions,
          difficulty,
          questionTypes: ['mcq'], // Interactive quiz uses MCQ only
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate quiz')
      }

      // Transform questions to include 4 options
      const questions: QuizQuestion[] = data.data.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))

      const settings: QuizSettings = {
        topic: topic.trim(),
        difficulty,
        numberOfQuestions,
        mode,
        timer,
      }

      onStartQuiz(settings, questions)
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please try again.')
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎮 Interactive Quiz
          </h1>
          <p className="text-gray-600">
            Test your knowledge with a gamified quiz experience
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter a Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., World War 2, Python basics, Solar System"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              disabled={isGenerating}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              disabled={isGenerating}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="adaptive">Adaptive</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Questions
            </label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              disabled={isGenerating}
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Game Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              disabled={isGenerating}
            >
              <option value="classic">Classic (standard quiz)</option>
              <option value="survival">Survival (3 wrong = game over)</option>
              <option value="time-attack">Time Attack (speed bonus)</option>
              <option value="streak-challenge">Streak Challenge (multipliers)</option>
            </select>
          </div>

          {/* Timer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timer per Question
            </label>
            <select
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              disabled={isGenerating}
            >
              <option value={0}>Off (no timer)</option>
              <option value={10}>10 seconds</option>
              <option value={20}>20 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Quiz...
              </>
            ) : (
              <>
                🚀 Generate Quiz
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
