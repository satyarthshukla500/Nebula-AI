'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { QuizSettings, QuizQuestion, QuizAnswer, QuizResultsData } from '@/app/dashboard/workspaces/interactive-quiz/page'

interface QuizGameProps {
  settings: QuizSettings
  questions: QuizQuestion[]
  onComplete: (results: QuizResultsData) => void
}

export function QuizGame({ settings, questions, onComplete }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(settings.timer)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // Timer countdown
  useEffect(() => {
    if (settings.timer === 0 || showFeedback) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentQuestionIndex, showFeedback, settings.timer])

  const handleTimeout = () => {
    if (showFeedback) return
    
    const timeSpent = (Date.now() - questionStartTime) / 1000
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer: '',
      isCorrect: false,
      timeSpent,
      pointsEarned: 0,
      streak: 0,
    }
    
    setAnswers([...answers, answer])
    setStreak(0)
    setWrongCount(wrongCount + 1)
    
    // Check survival mode
    if (settings.mode === 'survival' && wrongCount + 1 >= 3) {
      finishQuiz([...answers, answer])
      return
    }
    
    if (isLastQuestion) {
      finishQuiz([...answers, answer])
    } else {
      setTimeout(() => {
        nextQuestion()
      }, 1500)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return
    
    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)

    const timeSpent = (Date.now() - questionStartTime) / 1000
    const halfTime = settings.timer > 0 ? settings.timer / 2 : 999
    const speedBonus = timeSpent < halfTime ? 50 : 0
    
    let points = 0
    let newStreak = streak
    
    if (correct) {
      points = 100 + speedBonus
      newStreak = streak + 1
      setStreak(newStreak)
      setMaxStreak(Math.max(maxStreak, newStreak))
      
      // Apply streak multiplier
      if (settings.mode === 'streak-challenge') {
        if (newStreak >= 10) points *= 3
        else if (newStreak >= 5) points *= 2
        else if (newStreak >= 3) points *= 1.5
      }
      
      points = Math.floor(points)
      setScore(score + points)
      
      // Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } else {
      points = -25
      setScore(Math.max(0, score - 25))
      setStreak(0)
      newStreak = 0
      setWrongCount(wrongCount + 1)
    }

    const answerData: QuizAnswer = {
      questionId: currentQuestion.id,
      answer,
      isCorrect: correct,
      timeSpent,
      pointsEarned: points,
      streak: newStreak,
    }

    setAnswers([...answers, answerData])

    // Check survival mode
    if (settings.mode === 'survival' && !correct && wrongCount + 1 >= 3) {
      setTimeout(() => {
        finishQuiz([...answers, answerData])
      }, 2000)
      return
    }

    // Move to next question or finish
    setTimeout(() => {
      if (isLastQuestion) {
        finishQuiz([...answers, answerData])
      } else {
        nextQuestion()
      }
    }, 2000)
  }

  const nextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setTimeLeft(settings.timer)
    setQuestionStartTime(Date.now())
  }

  const finishQuiz = (finalAnswers: QuizAnswer[]) => {
    const correctCount = finalAnswers.filter(a => a.isCorrect).length
    const wrongCount = finalAnswers.filter(a => !a.isCorrect && a.answer !== '').length
    const skippedCount = finalAnswers.filter(a => a.answer === '').length
    const totalTime = finalAnswers.reduce((sum, a) => sum + a.timeSpent, 0)
    const avgTime = finalAnswers.length > 0 ? totalTime / finalAnswers.length : 0

    const percentage = (correctCount / questions.length) * 100
    let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'D'
    if (percentage >= 95) grade = 'S'
    else if (percentage >= 85) grade = 'A'
    else if (percentage >= 70) grade = 'B'
    else if (percentage >= 50) grade = 'C'

    const badges: string[] = []
    if (percentage === 100) badges.push('Perfect Score 🏆')
    if (avgTime < 5) badges.push('Speed Demon ⚡')
    if (maxStreak >= 5) badges.push('Streak Master 🔥')
    if (settings.mode === 'survival' && correctCount === questions.length) badges.push('Survivor 💪')

    const results: QuizResultsData = {
      score,
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      skippedCount,
      avgTimePerQuestion: avgTime,
      maxStreak,
      badges,
      grade,
    }

    onComplete(results)
  }

  const timerPercentage = settings.timer > 0 ? (timeLeft / settings.timer) * 100 : 100
  const timerColor = timerPercentage > 50 ? 'bg-green-500' : timerPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Score */}
          <motion.div
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-purple-600"
          >
            {score} pts
          </motion.div>

          {/* Question Progress */}
          <div className="text-lg font-semibold text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>

          {/* Streak */}
          <motion.div
            key={streak}
            animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-orange-500 flex items-center gap-1"
          >
            {streak > 0 && (
              <>
                <span>🔥</span>
                <span>{streak}</span>
              </>
            )}
            {streak === 0 && <span className="text-gray-400">No Streak</span>}
          </motion.div>
        </div>

        {/* Timer Bar */}
        {settings.timer > 0 && (
          <div className="max-w-4xl mx-auto mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${timerColor} transition-colors duration-300`}
                initial={{ width: '100%' }}
                animate={{ width: `${timerPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              {/* Question Text */}
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {currentQuestion.question}
              </h2>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option
                  const isCorrectAnswer = option === currentQuestion.correctAnswer
                  const showCorrect = showFeedback && isCorrectAnswer
                  const showWrong = showFeedback && isSelected && !isCorrect

                  return (
                    <motion.button
                      key={index}
                      whileHover={!showFeedback ? { scale: 1.02 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      animate={
                        showWrong
                          ? { x: [-10, 10, -10, 10, 0], backgroundColor: '#fee2e2' }
                          : showCorrect
                          ? { backgroundColor: '#dcfce7' }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showFeedback}
                      className={`
                        p-6 rounded-xl text-lg font-semibold transition-all
                        ${!showFeedback ? 'bg-gray-100 hover:bg-purple-100 hover:border-purple-400' : ''}
                        ${showCorrect ? 'bg-green-100 border-green-500' : ''}
                        ${showWrong ? 'bg-red-100 border-red-500' : ''}
                        ${!showFeedback ? 'border-2 border-gray-300' : 'border-2'}
                        disabled:cursor-not-allowed
                      `}
                    >
                      {option}
                    </motion.button>
                  )
                })}
              </div>

              {/* Feedback Overlay */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 text-center"
                  >
                    {isCorrect ? (
                      <div className="text-2xl font-bold text-green-600">
                        ✅ Correct! +{answers[answers.length - 1]?.pointsEarned || 100}pts
                        {streak >= 3 && (
                          <div className="text-lg text-orange-500 mt-1">
                            🔥 Streak x{streak >= 10 ? 3 : streak >= 5 ? 2 : 1.5}!
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-red-600">
                        ❌ Wrong! -25pts
                        <div className="text-lg text-gray-600 mt-2">
                          Correct answer: {currentQuestion.correctAnswer}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
