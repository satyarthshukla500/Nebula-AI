// Explain Assist API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const { content, mode = 'explain', skillLevel = 'intermediate', language = 'en' } = body

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    // Build system prompt based on mode
    let systemPrompt = ''
    
    switch (mode) {
      case 'explain':
        systemPrompt = `You are a technical educator. Provide detailed technical explanations with context.
Skill level: ${skillLevel}
Structure your response with:
- What this does
- Key concepts
- Real-world analogy
Keep it clear and educational.`
        break
      
      case 'teach':
        systemPrompt = `You are a programming teacher. Provide step-by-step learning-focused explanations.
Skill level: ${skillLevel}
Include:
- Progressive challenges
- Exercises for practice
- Detailed explanations suitable for beginners
Make it interactive and engaging.`
        break
      
      case 'simplify':
        systemPrompt = `You are explaining to a beginner. Use simple language and analogies.
Skill level: beginner
Avoid jargon. Use everyday examples. Make it easy to understand.`
        break
      
      case 'non-technical':
        systemPrompt = `Explain this in everyday language for non-technical people.
Use simple analogies. Avoid code details. Focus on "what it means in real life".
Structure:
- What this means
- Why it matters
- Real-life example`
        break
      
      default:
        systemPrompt = 'Provide a clear explanation of the technical content.'
    }

    // Call AI provider
    const response = await generateAIResponse(
      [{ role: 'user', content }],
      systemPrompt,
      4096,
      'auto',
      'explain'
    )

    // Save to database
    try {
      const supabase = await createClient()
      await (supabase as any).from('learning_sessions').insert({
        user_id: user.id,
        workspace_type: 'explain_assist',
        input_content: content,
        output_content: response.content,
        mode,
        language,
        skill_level: skillLevel,
        metadata: {
          tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
        },
      } as any)
    } catch (dbError) {
      console.error('Database error (non-critical):', dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        explanation: response.content,
        mode,
        skillLevel,
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error('Explain error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate explanation' },
      { status: 500 }
    )
  }
})
