/**
 * AWS SageMaker API Route
 * Direct endpoint for SageMaker inference requests
 * Used by Debug Workspace for specialized ML tasks
 */

import { NextRequest, NextResponse } from "next/server"
import { invokeSageMaker, isSageMakerConfigured } from "@/lib/ai/sagemakerProvider"
import { withAuth } from "@/lib/auth/withAuth"

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    console.log('[SageMaker API] Request received from user:', user.id)
    
    // Check if SageMaker is configured
    if (!isSageMakerConfigured()) {
      console.error('[SageMaker API] SageMaker not configured')
      return NextResponse.json(
        { 
          error: "SageMaker is not configured. Please set SAGEMAKER_ENDPOINT_NAME in environment variables.",
          configured: false
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    console.log('[SageMaker API] Invoking SageMaker with prompt length:', prompt.length)
    
    const result = await invokeSageMaker(prompt)
    
    console.log('[SageMaker API] Success - Response length:', result.length)

    return NextResponse.json({
      success: true,
      result,
      provider: "sagemaker",
      endpoint: process.env.SAGEMAKER_ENDPOINT_NAME || process.env.AWS_SAGEMAKER_ENDPOINT_NAME,
      model: "distilbert-base-uncased-finetuned-sst-2-english",
      task: "text-classification"
    })
    
  } catch (error: any) {
    console.error('[SageMaker API] Error:', error)
    return NextResponse.json(
      { 
        error: error.message || "Failed to invoke SageMaker endpoint",
        details: error.toString()
      },
      { status: 500 }
    )
  }
})
