/**
 * POST /api/quiz/generate
 * 
 * Generates quiz questions from topic or document using AI
 * 
 * Request Body:
 * {
 *   topic?: string
 *   document?: string (base64 or text content)
 *   numberOfQuestions: number
 *   difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
 *   questionTypes: ('mcq' | 'true-false' | 'short-answer')[]
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   data?: { questions: QuizQuestion[] }
 *   error?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { generateAIResponse } from '@/lib/ai'
import { QuizQuestion, QuestionType, Difficulty } from '@/types/quiz'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { topic, document, numberOfQuestions, difficulty, questionTypes } = body

    // Validation
    if (!topic && !document) {
      return NextResponse.json(
        { success: false, error: 'Either topic or document is required' },
        { status: 400 }
      )
    }

    if (!numberOfQuestions || numberOfQuestions < 1 || numberOfQuestions > 50) {
      return NextResponse.json(
        { success: false, error: 'numberOfQuestions must be between 1 and 50' },
        { status: 400 }
      )
    }

    if (!difficulty || !['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Invalid difficulty level' },
        { status: 400 }
      )
    }

    if (!questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one question type is required' },
        { status: 400 }
      )
    }

    // Build AI prompt
    const content = document || topic
    const questionTypeStr = questionTypes.join(', ')
    
    const prompt = `Generate ${numberOfQuestions} quiz questions based on the following content.

Content: ${content}

Requirements:
- Difficulty: ${difficulty}
- Question types: ${questionTypeStr}
- For MCQ: provide 4 options (A, B, C, D)
- For True-False: provide True/False options
- For Short Answer: provide the expected answer
- Include explanations for correct answers
- Assign points based on difficulty (easy: 10, medium: 15, hard: 20)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here",
    "type": "mcq" | "true-false" | "short-answer",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Only for MCQ and True-False
    "correctAnswer": "The correct answer",
    "explanation": "Why this is correct",
    "points": 10 | 15 | 20
  }
]

Do not include any markdown formatting, code blocks, or additional text. Return ONLY the JSON array.`

    // Call AI to generate questions
    const response = await generateAIResponse(
      [{ role: 'user', content: prompt }],
      'You are a quiz generation expert. Generate high-quality, educational quiz questions.',
      4096,
      false,
      'quiz_arena'
    )

    // Parse AI response
    let questions: QuizQuestion[]
    try {
      // Remove markdown code blocks if present
      let jsonStr = response.content.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      }
      
      let parsedQuestions
      try {
        parsedQuestions = JSON.parse(jsonStr)
      } catch (parseError) {
        console.error('[Quiz] JSON parse error:', parseError)
        throw new Error('Failed to parse quiz questions from AI response')
      }
      
      // Add IDs and order
      questions = parsedQuestions.map((q: any, index: number) => ({
        id: crypto.randomUUID(),
        question: q.question,
        type: q.type as QuestionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points || 10,
        order: index,
      }))
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI response:', response.content)
      return NextResponse.json(
        { success: false, error: 'Failed to generate valid questions. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { questions },
    })
  } catch (error: any) {
    console.error('Generate quiz error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    )
  }
})
