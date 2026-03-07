// Debug Workspace API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const { code, errorMessage, language = 'javascript' } = body

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      )
    }

    // Build system prompt for debugging
    const systemPrompt = `You are an expert debugger for ${language}.
Analyze the code and identify bugs, errors, and potential issues.

Provide:
1. Bug identification and explanation
2. Why the bug occurs
3. Corrected version of the code
4. Best practices to avoid similar issues

Be thorough but concise.`

    const userPrompt = errorMessage
      ? `Debug this ${language} code. Error message: ${errorMessage}\n\nCode:\n${code}`
      : `Debug this ${language} code and identify any issues:\n\n${code}`

    // Call AI provider
    const response = await generateAIResponse(
      [{ role: 'user', content: userPrompt }],
      systemPrompt,
      4096,
      'auto',
      'debug'
    )

    // Save to database
    try {
      const supabase = await createClient()
      await (supabase as any).from('learning_sessions').insert({
        user_id: user.id,
        workspace_type: 'debug_workspace',
        input_content: code,
        output_content: response.content,
        mode: 'debug',
        language,
        metadata: {
          errorMessage,
          tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
        },
      } as any)
    } catch (dbError) {
      console.error('Database error (non-critical):', dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis: response.content,
        language,
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to debug code' },
      { status: 500 }
    )
  }
})
