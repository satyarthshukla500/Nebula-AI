/**
 * POST /api/quiz/create
 * 
 * Creates a new quiz (teacher only)
 * 
 * Request Body:
 * {
 *   title: string
 *   description?: string
 *   topic: string
 *   questions: QuizQuestion[]
 *   settings: QuizSettings
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   data?: { quizId: string, quizCode: string }
 *   error?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { Quiz } from '@/types/quiz'

// Generate 6-character alphanumeric code
function generateQuizCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing characters
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { title, description, topic, questions, settings } = body

    // Validation
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      )
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one question is required' },
        { status: 400 }
      )
    }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Quiz settings are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const quizId = crypto.randomUUID()
    const quizCode = generateQuizCode()

    // Create quiz in database
    const quiz: Quiz = {
      id: quizId,
      teacherId: user.id,
      title,
      description,
      topic,
      questions,
      settings,
      status: 'draft',
      quizCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const { error: dbError } = await (supabase as any)
      .from('quizzes')
      .insert({
        id: quiz.id,
        teacher_id: quiz.teacherId,
        title: quiz.title,
        description: quiz.description,
        topic: quiz.topic,
        questions: quiz.questions,
        settings: quiz.settings,
        status: quiz.status,
        quiz_code: quiz.quizCode,
        created_at: quiz.createdAt,
        updated_at: quiz.updatedAt,
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to create quiz')
    }

    return NextResponse.json({
      success: true,
      data: {
        quizId: quiz.id,
        quizCode: quiz.quizCode,
      },
    })
  } catch (error: any) {
    console.error('Create quiz error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create quiz' },
      { status: 500 }
    )
  }
})
