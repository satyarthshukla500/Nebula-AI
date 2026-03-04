// Cyber Safety API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const { type, content, s3Key } = body

    if (!type || !content) {
      return NextResponse.json(
        { success: false, error: 'Type and content are required' },
        { status: 400 }
      )
    }

    let analysisResult: any = {}
    let recommendations: string[] = []
    let riskLevel = 'low'

    if (type === 'email_risk') {
      // Email/Account risk assessment
      const systemPrompt = `You are a cybersecurity educator providing defensive security guidance.

Analyze this email/account activity for potential threats:
- Phishing indicators
- Social engineering tactics
- Account compromise signs
- Suspicious patterns

Provide:
1. Educational Risk Assessment
2. Threat Indicators
3. Defensive Actions (password changes, 2FA, etc.)
4. Cybersecurity Learning points

IMPORTANT: This is educational only. Emphasize defensive cybersecurity and legal compliance.`

      const response = await generateAIResponse(
        [{ role: 'user', content }],
        systemPrompt
      )

      analysisResult = {
        analysis: response.content,
        type: 'email_risk',
      }

      // Extract risk level from response
      if (response.content.toLowerCase().includes('high risk')) {
        riskLevel = 'high'
      } else if (response.content.toLowerCase().includes('medium risk')) {
        riskLevel = 'medium'
      }

      recommendations = [
        'Enable two-factor authentication',
        'Change password immediately',
        'Review recent login activity',
        'Check connected apps and revoke suspicious access',
      ]
    } else if (type === 'deepfake_analysis' && s3Key) {
      // Deepfake/AI media analysis
      // TODO: Implement image analysis when media processing is configured
      
      const systemPrompt = `You are a deepfake detection educator.

Educate about:
- Deepfake detection techniques
- Visual artifacts to look for
- AI-generated media indicators
- How to verify authentic media

Provide educational context about deepfake technology from a defensive perspective.`

      const response = await generateAIResponse(
        [{ role: 'user', content: 'Analyze this image for potential AI generation or manipulation.' }],
        systemPrompt
      )

      analysisResult = {
        analysis: response.content,
        type: 'deepfake_analysis',
        note: 'Image analysis pending media processing configuration',
      }

      recommendations = [
        'Verify source of the media',
        'Look for inconsistencies in lighting and shadows',
        'Check for unnatural facial movements',
        'Use reverse image search',
      ]
    }

    // Save to database
    try {
      const supabase = await createClient()
      await (supabase as any).from('cyber_safety_reports').insert({
        user_id: user.id,
        report_type: type,
        input_data: content,
        analysis_result: analysisResult,
        risk_level: riskLevel,
        recommendations,
        media_analyzed: s3Key ? [s3Key] : [],
      } as any)
    } catch (dbError) {
      console.error('Database error (non-critical):', dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis: analysisResult,
        riskLevel,
        recommendations,
      },
    })
  } catch (error) {
    console.error('Cyber safety error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze security risk' },
      { status: 500 }
    )
  }
})
