import { NextRequest, NextResponse } from 'next/server'

/**
 * Have I Been Pwned API Integration
 * 
 * Checks if an email has been exposed in known data breaches
 * Uses free XposedOrNot API as fallback when HIBP API key not available
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    console.log('[HIBP] Checking email:', email.replace(/(.{3}).*(@.*)/, '$1***$2'))
    
    // Extract domain for AI analysis
    const domain = email.split('@')[1]
    
    // Check if API key is configured
    const apiKey = process.env.HIBP_API_KEY
    
    // Try HIBP API first (v3 with API key)
    if (apiKey) {
      try {
        console.log('[HIBP] Trying HIBP API v3 with API key')
        const response = await fetch(
          `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
          {
            headers: {
              'hibp-api-key': apiKey,
              'user-agent': 'Nebula-AI-Security-Tool'
            }
          }
        )
        
        console.log('[HIBP] API response status:', response.status)
        
        // 404 means no breaches found
        if (response.status === 404) {
          return NextResponse.json({
            breached: false,
            message: 'Good news! No breaches found for this email.',
            count: 0
          })
        }
        
        // 429 means rate limited
        if (response.status === 429) {
          console.log('[HIBP] Rate limited, trying free alternative')
          // Fall through to XposedOrNot
        } else if (response.status === 200) {
          // Success - breaches found
          let breaches
          try {
            breaches = await response.json()
          } catch (parseError) {
            console.error('[HIBP] JSON parse error:', parseError)
            // Fall through to XposedOrNot
          }
          
          if (breaches) {
            console.log('[HIBP] Found', breaches.length, 'breaches')
            
            // Format breach data
            const formattedBreaches = breaches.map((breach: any) => ({
              name: breach.Name,
              date: breach.BreachDate,
              dataClasses: breach.DataClasses || [],
              description: breach.Description
            }))
          
            return NextResponse.json({
              breached: true,
              count: breaches.length,
              breaches: formattedBreaches,
              source: 'HIBP'
            })
          }
        } else if (response.status === 401) {
          console.log('[HIBP] Invalid API key, trying free alternative')
          // Fall through to XposedOrNot
        }
      } catch (hibpError) {
        console.error('[HIBP] HIBP API error:', hibpError)
        // Fall through to XposedOrNot
      }
    }
    
    // Try XposedOrNot API (completely FREE, no API key needed)
    try {
      console.log('[HIBP] Trying XposedOrNot free API')
      const xposedResponse = await fetch(
        `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
        {
          headers: {
            'user-agent': 'Nebula-AI-Security-Tool'
          }
        }
      )
      
      console.log('[HIBP] XposedOrNot response status:', xposedResponse.status)
      
      if (xposedResponse.ok) {
        let data
        try {
          data = await xposedResponse.json()
        } catch (parseError) {
          console.error('[HIBP] XposedOrNot JSON parse error:', parseError)
          throw new Error('Failed to parse XposedOrNot response')
        }
        
        // XposedOrNot response format
        if (data.Error) {
          // No breaches found
          return NextResponse.json({
            breached: false,
            message: 'No breaches in XposedOrNot database. For complete results visit haveibeenpwned.com',
            count: 0,
            source: 'XposedOrNot',
            disclaimer: true
          })
        }
        
        // Breaches found
        const breachesData = data.breaches_details || data.BreachDetails || []
        const breachCount = data.breaches_count || breachesData.length || 0
        
        if (breachCount > 0) {
          // Format breach data
          const formattedBreaches = breachesData.map((breach: any) => ({
            name: breach.breach || breach.Name || 'Unknown',
            date: breach.breach_date || breach.BreachDate || 'Unknown',
            dataClasses: breach.data_classes || breach.DataClasses || [],
            description: breach.description || breach.Description || ''
          }))
          
          console.log('[HIBP] XposedOrNot found', breachCount, 'breaches')
          
          return NextResponse.json({
            breached: true,
            count: breachCount,
            breaches: formattedBreaches,
            source: 'XposedOrNot'
          })
        }
        
        // No breaches
        return NextResponse.json({
          breached: false,
          message: 'No breaches in XposedOrNot database. For complete results visit haveibeenpwned.com',
          count: 0,
          source: 'XposedOrNot',
          disclaimer: true
        })
      }
    } catch (xposedError) {
      console.error('[HIBP] XposedOrNot API error:', xposedError)
      // Fall through to AI simulation
    }
    
    // Last resort: Use AI simulation with clear disclaimer
    console.log('[HIBP] All APIs failed, using AI simulation')
    
    try {
      const aiPrompt = `The user wants to check if email ${email} has been in data breaches.

You cannot actually check real breach databases without an API key.

Respond with this EXACT structure:

⚠️ IMPORTANT: This is an AI-simulated security assessment.
For 100% accurate results, visit: haveibeenpwned.com

Based on common breach patterns for ${domain} users:

**Security Recommendations:**
1. [Provide specific recommendation for this domain]
2. [Provide another specific recommendation]
3. [Provide third specific recommendation]

**Common Breaches Affecting ${domain} Users:**
- [List 2-3 well-known breaches that commonly affect users of this domain]

**Personalized Recovery Plan:**

🔐 **Immediate Actions:**
- Change passwords on: Gmail, ${domain}, and any accounts where you reused passwords
- Enable 2FA on all important accounts (Gmail, banking, social media)
- Review recent account activity for suspicious logins

🔍 **Verification:**
- Visit haveibeenpwned.com to check your exact breach history
- Check if your phone number was exposed: haveibeenpwned.com/Passwords

📧 **Email Security:**
- Consider using email aliases for different services
- Enable advanced protection on your ${domain} account
- Set up breach alerts at haveibeenpwned.com/NotifyMe

⚠️ **Always end with:** "Visit haveibeenpwned.com for your exact breach history and real-time monitoring."

Be specific, actionable, and reassuring. Tailor recommendations to the email domain.`

      // Call AI service (Lambda or Groq)
      const lambdaEndpoint = process.env.NEBULA_LAMBDA_ENDPOINT
      const groqApiKey = process.env.GROQ_API_KEY
      
      let aiResponse = ''
      
      if (lambdaEndpoint) {
        // Try Lambda first
        console.log('[HIBP] Using Lambda AI for simulation')
        const lambdaResponse = await fetch(lambdaEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: aiPrompt,
            conversationHistory: []
          })
        })
        
        if (lambdaResponse.ok) {
          const data = await lambdaResponse.json()
          aiResponse = data.message || data.response || ''
        }
      }
      
      if (!aiResponse && groqApiKey) {
        // Fallback to Groq
        console.log('[HIBP] Using Groq AI for simulation')
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You are a cybersecurity expert providing breach analysis and security recommendations.' },
              { role: 'user', content: aiPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        })
        
        if (groqResponse.ok) {
          const data = await groqResponse.json()
          aiResponse = data.choices?.[0]?.message?.content || ''
        }
      }
      
      if (aiResponse) {
        return NextResponse.json({
          breached: null,
          useAI: true,
          aiAnalysis: aiResponse,
          message: '⚠️ Simulated - visit haveibeenpwned.com for real results',
          source: 'AI Simulation'
        })
      }
      
      // If AI also fails, return generic message
      return NextResponse.json({
        breached: null,
        useAI: true,
        message: '⚠️ Unable to check breaches. Visit haveibeenpwned.com to check your email.',
        source: 'Fallback'
      })
      
    } catch (aiError) {
      console.error('[HIBP] AI simulation failed:', aiError)
      return NextResponse.json({
        breached: null,
        useAI: true,
        message: '⚠️ Unable to check breaches. Visit haveibeenpwned.com to check your email.',
        source: 'Fallback'
      })
    }
    
  } catch (error: any) {
    console.error('[HIBP] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to check email. Please try again.' },
      { status: 500 }
    )
  }
}
