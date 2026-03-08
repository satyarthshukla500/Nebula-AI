'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { QuizResultsData } from '@/app/dashboard/workspaces/interactive-quiz/page'

interface QuizResultsProps {
  results: QuizResultsData
  onTryAgain: () => void
  onNewTopic: () => void
}

export function QuizResults({ results, onTryAgain, onNewTopic }: QuizResultsProps) {
  useEffect(() => {
    // Celebration confetti
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  const percentage = results.totalQuestions > 0 
    ? Math.round((results.correctCount / results.totalQuestions) * 100) 
    : 0

  const gradeColors = {
    S: 'from-yellow-400 to-orange-500',
    A: 'from-green-400 to-emerald-500',
    B: 'from-blue-400 to-cyan-500',
    C: 'from-purple-400 to-pink-500',
    D: 'from-gray-400 to-gray-500',
  }

  const gradeEmojis = {
    S: '🏆',
    A: '🌟',
    B: '👍',
    C: '📚',
    D: '💪',
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full"
      >
        {/* Grade Display */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={`inline-block bg-gradient-to-br ${gradeColors[results.grade]} text-white rounded-full w-32 h-32 flex items-center justify-center mb-4`}
          >
            <div>
              <div className="text-6xl font-bold">{results.grade}</div>
              <div className="text-2xl">{gradeEmojis[results.grade]}</div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Quiz Complete!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-semibold text-purple-600"
          >
            Final Score: {results.score} points
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{results.correctCount}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{results.wrongCount}</div>
            <div className="text-sm text-gray-600">Wrong</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-600">{results.skippedCount}</div>
            <div className="text-sm text-gray-600">Skipped</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {results.avgTimePerQuestion.toFixed(1)}s
            </div>
            <div className="text-sm text-gray-600">Avg Speed</div>
          </div>
        </motion.div>

        {/* Percentage Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Accuracy</span>
            <span className="font-bold">{percentage.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${gradeColors[results.grade]}`}
            />
          </div>
        </motion.div>

        {/* Badges */}
        {results.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
              Badges Earned
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {results.badges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.6 + index * 0.1, type: 'spring' }}
                  className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg"
                >
                  {badge}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Max Streak */}
        {results.maxStreak > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-orange-50 px-6 py-3 rounded-full">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-orange-600">
                Max Streak: {results.maxStreak}
              </span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="flex gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTryAgain}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            🔄 Try Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewTopic}
            className="flex-1 bg-white border-2 border-purple-600 text-purple-600 font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            🏠 New Topic
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
