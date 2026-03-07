// AWS SageMaker Runtime integration for ML inference
import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
  InvokeEndpointCommandInput,
} from '@aws-sdk/client-sagemaker-runtime'

// Initialize client with proper error handling
let client: SageMakerRuntimeClient | null = null

try {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    client = new SageMakerRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
    console.log('[SageMaker] Client initialized successfully')
  } else {
    console.log('[SageMaker] AWS credentials not found, client not initialized')
  }
} catch (error) {
  console.error('[SageMaker] Failed to initialize client:', error)
}

export interface SageMakerInferenceInput {
  inputs: string | Record<string, any>
  parameters?: Record<string, any>
}

export interface SageMakerInferenceOutput {
  [key: string]: any
}

/**
 * Invoke a SageMaker inference endpoint
 * 
 * @param input - Input text or object for inference
 * @param endpointName - Optional endpoint name (defaults to env variable)
 * @param contentType - Content type for the request (default: application/json)
 * @param accept - Accept type for the response (default: application/json)
 * @returns Parsed JSON response from the endpoint
 */
export async function invokeSageMakerEndpoint(
  input: string | Record<string, any>,
  endpointName?: string,
  contentType: string = 'application/json',
  accept: string = 'application/json'
): Promise<SageMakerInferenceOutput> {
  if (!client) {
    throw new Error('SageMaker client not initialized. Check AWS credentials.')
  }

  const endpoint = endpointName || process.env.AWS_SAGEMAKER_ENDPOINT_NAME

  if (!endpoint) {
    throw new Error('SageMaker endpoint name not provided. Set AWS_SAGEMAKER_ENDPOINT_NAME environment variable.')
  }

  console.log('[SageMaker] Invoking endpoint:', endpoint)
  console.log('[SageMaker] Input type:', typeof input)
  console.log('[SageMaker] Content-Type:', contentType)

  // Prepare the payload
  const payload: SageMakerInferenceInput = {
    inputs: input,
  }

  // Convert payload to JSON string
  const body = JSON.stringify(payload)
  console.log('[SageMaker] Payload size:', body.length, 'bytes')

  const commandInput: InvokeEndpointCommandInput = {
    EndpointName: endpoint,
    Body: body,
    ContentType: contentType,
    Accept: accept,
  }

  try {
    const startTime = Date.now()
    const command = new InvokeEndpointCommand(commandInput)
    const response = await client.send(command)
    const duration = Date.now() - startTime

    console.log('[SageMaker] Response received in', duration, 'ms')
    console.log('[SageMaker] Response content type:', response.ContentType)

    if (!response.Body) {
      throw new Error('SageMaker response body is empty')
    }

    // Decode the response body
    const responseBody = new TextDecoder().decode(response.Body)
    console.log('[SageMaker] Response size:', responseBody.length, 'bytes')

    // Parse JSON response
    let parsedResponse: SageMakerInferenceOutput
    try {
      parsedResponse = JSON.parse(responseBody)
      console.log('[SageMaker] Response parsed successfully')
    } catch (parseError) {
      console.error('[SageMaker] Failed to parse response as JSON:', parseError)
      console.error('[SageMaker] Raw response:', responseBody.substring(0, 500))
      throw new Error('Failed to parse SageMaker response as JSON')
    }

    return parsedResponse
  } catch (error: any) {
    console.error('[SageMaker] Invocation error:', {
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      endpoint,
    })
    throw new Error(`Failed to invoke SageMaker endpoint: ${error.message}`)
  }
}

/**
 * Invoke SageMaker endpoint with custom parameters
 * 
 * @param input - Input text or object for inference
 * @param parameters - Additional parameters for the model
 * @param endpointName - Optional endpoint name
 * @returns Parsed JSON response from the endpoint
 */
export async function invokeSageMakerWithParameters(
  input: string | Record<string, any>,
  parameters: Record<string, any>,
  endpointName?: string
): Promise<SageMakerInferenceOutput> {
  if (!client) {
    throw new Error('SageMaker client not initialized. Check AWS credentials.')
  }

  const endpoint = endpointName || process.env.AWS_SAGEMAKER_ENDPOINT_NAME

  if (!endpoint) {
    throw new Error('SageMaker endpoint name not provided.')
  }

  console.log('[SageMaker] Invoking endpoint with parameters:', endpoint)
  console.log('[SageMaker] Parameters:', Object.keys(parameters))

  const payload = {
    inputs: input,
    parameters,
  }

  const body = JSON.stringify(payload)

  const commandInput: InvokeEndpointCommandInput = {
    EndpointName: endpoint,
    Body: body,
    ContentType: 'application/json',
    Accept: 'application/json',
  }

  try {
    const startTime = Date.now()
    const command = new InvokeEndpointCommand(commandInput)
    const response = await client.send(command)
    const duration = Date.now() - startTime

    console.log('[SageMaker] Response received in', duration, 'ms')

    if (!response.Body) {
      throw new Error('SageMaker response body is empty')
    }

    const responseBody = new TextDecoder().decode(response.Body)
    const parsedResponse = JSON.parse(responseBody)

    console.log('[SageMaker] Response parsed successfully')
    return parsedResponse
  } catch (error: any) {
    console.error('[SageMaker] Invocation error:', {
      message: error.message,
      code: error.code,
      endpoint,
    })
    throw new Error(`Failed to invoke SageMaker endpoint: ${error.message}`)
  }
}

/**
 * Check if SageMaker is configured
 * 
 * @returns True if SageMaker client and endpoint are configured
 */
export function isSageMakerConfigured(): boolean {
  const configured = !!client && !!process.env.AWS_SAGEMAKER_ENDPOINT_NAME
  console.log('[SageMaker] Configuration check:', {
    clientInitialized: !!client,
    endpointConfigured: !!process.env.AWS_SAGEMAKER_ENDPOINT_NAME,
    configured,
  })
  return configured
}

/**
 * Get the configured SageMaker endpoint name
 * 
 * @returns Endpoint name or undefined
 */
export function getSageMakerEndpointName(): string | undefined {
  return process.env.AWS_SAGEMAKER_ENDPOINT_NAME
}

/**
 * Batch invoke SageMaker endpoint with multiple inputs
 * 
 * @param inputs - Array of inputs for inference
 * @param endpointName - Optional endpoint name
 * @returns Array of parsed JSON responses
 */
export async function invokeSageMakerBatch(
  inputs: Array<string | Record<string, any>>,
  endpointName?: string
): Promise<SageMakerInferenceOutput[]> {
  console.log('[SageMaker] Batch invocation with', inputs.length, 'inputs')

  const results: SageMakerInferenceOutput[] = []

  for (let i = 0; i < inputs.length; i++) {
    console.log('[SageMaker] Processing batch item', i + 1, 'of', inputs.length)
    try {
      const result = await invokeSageMakerEndpoint(inputs[i], endpointName)
      results.push(result)
    } catch (error: any) {
      console.error('[SageMaker] Batch item', i + 1, 'failed:', error.message)
      // Continue with other items, but include error in results
      results.push({
        error: true,
        message: error.message,
        index: i,
      })
    }
  }

  console.log('[SageMaker] Batch invocation completed:', {
    total: inputs.length,
    successful: results.filter(r => !r.error).length,
    failed: results.filter(r => r.error).length,
  })

  return results
}
