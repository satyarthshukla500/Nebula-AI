// Study Focus API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const { content, format = 'summary', skillLevel = 'intermediate' } = body

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    let systemPrompt = ''
    
    switch (format) {
      case 'summary':
        systemPrompt = `Create a concise study summary with key points and main concepts.`
        break
      case 'notes':
        systemPrompt = `Generate structured study notes with headings, bullet points, and important details.`
        break
      case 'quiz':
        systemPrompt = `Generate quiz questions to test understanding of this material.`
        break
      case 'flashcards':
        systemPrompt = `Create flashcard pairs (question/answer) for memorization.`
        break
      default:
        systemPrompt = `Provide study assistance for this content.`
    }

    systemPrompt += `\nSkill level: ${skillLevel}\nMake it educational and easy to study from.`

    const response = await generateAIResponse(
      [{ role: 'user', content }],
      systemPrompt
    )

    return NextResponse.json({
      success: true,
      data: {
        studyMaterial: response.content,
        format,
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error('Study error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate study material' },
      { status: 500 }
    )
  }
})

// Create/update study session
export const PUT = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const {
      sessionId,
      sessionName,
      timerDuration,
      actualDuration,
      topics,
      notes,
      status = 'active',
    } = body

    if (sessionId) {
      // Update existing session
      const { data, error } = await (supabase as any)
        .from('study_sessions')
        .update({
          actual_duration: actualDuration,
          notes,
          status,
          ...(status === 'completed' && { completed_at: new Date().toISOString() }),
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, data })
    } else {
      // Create new session
      const { data, error } = await (supabase as any)
        .from('study_sessions')
        .insert({
          user_id: user.id,
          session_name: sessionName,
          timer_duration: timerDuration,
          topics,
          status,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, data })
    }
  } catch (error) {
    console.error('Study session error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage study session' },
      { status: 500 }
    )
  }
})
