// Smart Summarizer API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const { content, complexityLevel = 'medium' } = body

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a code and workflow summarizer. Create high-level summaries of complex systems.

Provide:
1. High-level summary of functionality
2. Main components and their relationships
3. Key decision points and dependencies
4. Learning breakdown (order to understand the codebase)

Complexity level: ${complexityLevel}
Be concise but comprehensive.`

    const response = await generateAIResponse(
      [{ role: 'user', content }],
      systemPrompt,
      4096,
      'auto',
      'summarizer'
    )

    try {
      const supabase = await createClient()
      await (supabase as any).from('learning_sessions').insert({
        user_id: user.id,
        workspace_type: 'smart_summarizer',
        input_content: content,
        output_content: response.content,
        mode: 'summarize',
        metadata: {
          complexityLevel,
          tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
        },
      } as any)
    } catch (dbError) {
      console.error('Database error (non-critical):', dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: response.content,
        complexityLevel,
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
})
