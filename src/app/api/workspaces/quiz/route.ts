// Quiz Generation API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const { content, questionCount = 5, difficulty = 'intermediate' } = body

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    // Build system prompt for quiz generation
    const systemPrompt = `You are a quiz generator. Create ${questionCount} quiz questions based on the provided content.
Difficulty: ${difficulty}

Generate a mix of:
- Multiple choice questions (with 4 options)
- Short answer questions

For each question, provide:
1. The question
2. Options (for multiple choice)
3. Correct answer
4. Detailed explanation

Format as JSON array:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "..."
  }
]`

    const userPrompt = `Generate ${questionCount} quiz questions from this content:\n\n${content}`

    // Call AI provider
    const response = await generateAIResponse(
      [{ role: 'user', content: userPrompt }],
      systemPrompt,
      4096,
      'auto',
      'quiz'
    )

    // Parse JSON from response
    let questions = []
    try {
      // Extract JSON from response (may be wrapped in markdown)
      const jsonMatch = response.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', parseError)
      // Fallback: return raw response
      questions = [{
        id: 'q1',
        type: 'short_answer',
        question: 'Unable to parse quiz format',
        correctAnswer: '',
        explanation: response.content,
      }]
    }

    // Save to database
    try {
      const supabase = await createClient()
      await (supabase as any).from('learning_sessions').insert({
        user_id: user.id,
        workspace_type: 'quiz_arena',
        input_content: content,
        output_content: JSON.stringify(questions),
        mode: 'quiz_generation',
        metadata: {
          questionCount,
          difficulty,
          tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
        },
      } as any)
    } catch (dbError) {
      console.error('Database error (non-critical):', dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        questions,
        questionCount: questions.length,
        difficulty,
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
})

// Submit quiz results
export const PUT = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const {
      quizTitle,
      questions,
      answers,
      timeTakenSeconds,
      isStrictMode = false,
      proctoringEvents = [],
    } = body

    // Calculate score
    let correctAnswers = 0
    questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++
      }
    })

    const scorePercentage = (correctAnswers / questions.length) * 100

    // Save quiz result
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
      .from('quiz_results')
      .insert({
        user_id: user.id,
        quiz_title: quizTitle,
        total_questions: questions.length,
        correct_answers: correctAnswers,
        score_percentage: scorePercentage,
        time_taken_seconds: timeTakenSeconds,
        is_strict_mode: isStrictMode,
        questions_data: questions,
        answers_data: answers,
        proctoring_events: proctoringEvents,
      })
      .select()
      .single();

    if (error) throw error;

    const resultData = data as any;

    return NextResponse.json({
      success: true,
      data: {
        resultId: resultData.id,
        correctAnswers,
        totalQuestions: questions.length,
        scorePercentage,
        passed: scorePercentage >= 70,
      },
    })
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
})
