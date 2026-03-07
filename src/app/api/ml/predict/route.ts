// API route for SageMaker ML predictions
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { invokeSageMakerEndpoint, isSageMakerConfigured } from '@/lib/aws/sagemaker'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Check if SageMaker is configured
    if (!isSageMakerConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'SageMaker is not configured. Please set AWS_SAGEMAKER_ENDPOINT_NAME environment variable.',
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { input, endpointName } = body

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'Input is required' },
        { status: 400 }
      )
    }

    console.log('[ML Predict] Processing prediction request')
    console.log('[ML Predict] User:', user.id)
    console.log('[ML Predict] Input type:', typeof input)

    // Invoke SageMaker endpoint
    const result = await invokeSageMakerEndpoint(input, endpointName)

    console.log('[ML Predict] Prediction completed successfully')

    return NextResponse.json({
      success: true,
      data: {
        prediction: result,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[ML Predict] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process prediction',
      },
      { status: 500 }
    )
  }
})

// GET endpoint to check SageMaker status
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const configured = isSageMakerConfigured()

    return NextResponse.json({
      success: true,
      data: {
        configured,
        message: configured
          ? 'SageMaker is configured and ready'
          : 'SageMaker is not configured',
      },
    })
  } catch (error: any) {
    console.error('[ML Predict] Status check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check SageMaker status',
      },
      { status: 500 }
    )
  }
})
