// Mental Wellness API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai'
import { encrypt } from '@/lib/utils/encryption'
import { detectCrisisKeywords, generateCrisisMessage } from '@/lib/utils/crisis-detection'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const {
      message,
      topic = 'general',
      moodRating,
      countryCode = 'IN',
      disclaimerAcknowledged = false,
    } = body

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!disclaimerAcknowledged) {
      return NextResponse.json(
        { success: false, error: 'Disclaimer must be acknowledged' },
        { status: 400 }
      )
    }

    // Check for crisis keywords
    const crisisDetected = detectCrisisKeywords(message)

    if (crisisDetected) {
      const crisisMessage = generateCrisisMessage(countryCode)
      
      // Log crisis detection
      const encryptedContent = encrypt(JSON.stringify({
        userMessage: message,
        crisisDetected: true,
        timestamp: new Date().toISOString(),
      }))

      try {
        const supabase = await createClient()
        await (supabase as any).from('wellness_logs').insert({
          user_id: user.id,
          encrypted_content: encryptedContent,
          topic,
          mood_rating: moodRating,
          crisis_detected: true,
          disclaimer_acknowledged: true,
          country_code: countryCode,
        })
      } catch (dbError) {
        console.error('Database error (non-critical):', dbError)
      }

      return NextResponse.json({
        success: true,
        data: {
          message: crisisMessage,
          crisisDetected: true,
          requiresImmediateHelp: true,
        },
      })
    }

    // Build system prompt for wellness support
    const systemPrompt = `You are a compassionate mental wellness companion. Provide emotional support and coping strategies.

IMPORTANT DISCLAIMERS (include in every response):
- This is not medical advice
- Not a substitute for professional mental health care
- Not emergency care
- Encourage seeking help from licensed professionals

Provide:
- Empathetic listening
- Evidence-based coping strategies
- Supportive guidance
- Encouragement to seek professional help if needed

Topic: ${topic}
Be warm, non-judgmental, and supportive.`

    // Call AI provider
    const response = await generateAIResponse(
      [{ role: 'user', content: message }],
      systemPrompt,
      4096,
      'auto',
      'wellness'
    )

    // Encrypt and save conversation
    const encryptedContent = encrypt(JSON.stringify({
      userMessage: message,
      aiResponse: response.content,
      timestamp: new Date().toISOString(),
    }))

    try {
      const supabase = await createClient()
      await (supabase as any).from('wellness_logs').insert({
        user_id: user.id,
        encrypted_content: encryptedContent,
        topic,
        mood_rating: moodRating,
        crisis_detected: false,
        disclaimer_acknowledged: true,
        country_code: countryCode,
      })
    } catch (dbError) {
      console.error('Database error (non-critical):', dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: response.content,
        crisisDetected: false,
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error('Wellness error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process wellness message' },
      { status: 500 }
    )
  }
})
