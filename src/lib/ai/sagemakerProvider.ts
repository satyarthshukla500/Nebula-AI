/**
 * AWS SageMaker Provider
 * Handles inference requests to SageMaker endpoints
 * Used for specialized ML tasks like sentiment analysis, classification, etc.
 */

import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime"

// Initialize SageMaker Runtime client
const client = new SageMakerRuntimeClient({
  region: process.env.SAGEMAKER_REGION || process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

/**
 * Check if SageMaker is configured
 */
export function isSageMakerConfigured(): boolean {
  const hasEndpoint = !!process.env.SAGEMAKER_ENDPOINT_NAME || !!process.env.AWS_SAGEMAKER_ENDPOINT_NAME
  const hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID
  const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY
  
  const configured = hasEndpoint && hasAccessKey && hasSecretKey
  
  console.log('[SageMaker Config] Configuration check:', {
    hasEndpoint,
    hasAccessKey,
    hasSecretKey,
    configured,
    endpointName: process.env.SAGEMAKER_ENDPOINT_NAME || process.env.AWS_SAGEMAKER_ENDPOINT_NAME || 'not set'
  })
  
  return configured
}

/**
 * Invoke SageMaker endpoint for inference
 * 
 * @param prompt - User input text to analyze
 * @returns Formatted response from SageMaker
 */
export async function invokeSageMaker(prompt: string): Promise<string> {
  console.log('[SageMaker] ===== Invoking SageMaker Endpoint =====')
  console.log('[SageMaker] Prompt length:', prompt.length)
  console.log('[SageMaker] Endpoint:', process.env.SAGEMAKER_ENDPOINT_NAME || process.env.AWS_SAGEMAKER_ENDPOINT_NAME)
  
  try {
    const payload = { inputs: prompt }
    
    const command = new InvokeEndpointCommand({
      EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME || process.env.AWS_SAGEMAKER_ENDPOINT_NAME!,
      ContentType: "application/json",
      Accept: "application/json",
      Body: Buffer.from(JSON.stringify(payload)),
    })
    
    console.log('[SageMaker] Sending request...')
    const response = await client.send(command)
    
    const resultText = Buffer.from(response.Body!).toString()
    console.log('[SageMaker] Raw response:', resultText)
    
    let result
    try {
      result = JSON.parse(resultText)
    } catch (parseError) {
      console.error('[SageMaker] JSON parse error:', parseError)
      throw new Error('Failed to parse SageMaker response')
    }
    
    // Format response for Debug Workspace
    if (Array.isArray(result) && result[0]?.label) {
      const label = result[0].label
      const score = (result[0].score * 100).toFixed(1)
      
      console.log('[SageMaker] ===== SageMaker Success =====')
      console.log('[SageMaker] Label:', label)
      console.log('[SageMaker] Confidence:', score + '%')
      
      return `🤖 **SageMaker Analysis**

**Sentiment:** ${label}
**Confidence:** ${score}%

---

**Endpoint:** nebula-dolphin-endpoint
**Model:** distilbert-base-uncased-finetuned-sst-2-english
**Task:** Text Classification (Sentiment Analysis)
**Provider:** AWS SageMaker

This analysis was performed by a fine-tuned DistilBERT model running on AWS SageMaker, specialized for sentiment classification tasks.`
    }
    
    // Fallback for other response formats
    console.log('[SageMaker] ===== SageMaker Success (Generic) =====')
    return `🤖 **SageMaker Analysis**

${JSON.stringify(result, null, 2)}

---

**Endpoint:** ${process.env.SAGEMAKER_ENDPOINT_NAME || process.env.AWS_SAGEMAKER_ENDPOINT_NAME}
**Provider:** AWS SageMaker`
    
  } catch (error: any) {
    console.error('[SageMaker] ===== SageMaker Failed =====')
    console.error('[SageMaker] Error:', error.message)
    console.error('[SageMaker] Error details:', error)
    
    // Return error message that will trigger fallback
    throw new Error(`SageMaker unavailable: ${error.message}`)
  }
}

/**
 * Invoke SageMaker with fallback to Bedrock
 * 
 * @param prompt - User input text
 * @param fallbackFn - Function to call if SageMaker fails
 * @returns Response from SageMaker or fallback
 */
export async function invokeSageMakerWithFallback(
  prompt: string,
  fallbackFn: (prompt: string) => Promise<string>
): Promise<{ content: string; provider: 'sagemaker' | 'fallback' }> {
  try {
    const content = await invokeSageMaker(prompt)
    return { content, provider: 'sagemaker' }
  } catch (error: any) {
    console.log('[SageMaker] Falling back to alternative provider')
    const content = await fallbackFn(prompt)
    return { 
      content: `⚠️ SageMaker temporarily unavailable. Using fallback provider.\n\n${content}`, 
      provider: 'fallback' 
    }
  }
}
