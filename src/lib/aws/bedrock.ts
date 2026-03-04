// AWS Bedrock integration for LLM
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_BEDROCK_MODEL_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface BedrockMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface BedrockResponse {
  content: string
  stopReason: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

export async function invokeClaude(
  messages: BedrockMessage[],
  systemPrompt?: string,
  maxTokens: number = 4096
): Promise<BedrockResponse> {
  const modelId = process.env.AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0'

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    ...(systemPrompt && { system: systemPrompt }),
  }

  const input: InvokeModelCommandInput = {
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  }

  try {
    const command = new InvokeModelCommand(input)
    const response = await client.send(command)

    const responseBody = JSON.parse(new TextDecoder().decode(response.body))

    return {
      content: responseBody.content[0].text,
      stopReason: responseBody.stop_reason,
      usage: {
        inputTokens: responseBody.usage.input_tokens,
        outputTokens: responseBody.usage.output_tokens,
      },
    }
  } catch (error) {
    console.error('Bedrock invocation error:', error)
    throw new Error('Failed to invoke Bedrock model')
  }
}

// Streaming support
export async function invokeClaudeStream(
  messages: BedrockMessage[],
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  // Note: Streaming requires different SDK setup
  // For now, we'll use non-streaming and simulate chunks
  const response = await invokeClaude(messages, systemPrompt)
  
  if (onChunk) {
    // Simulate streaming by chunking the response
    const words = response.content.split(' ')
    for (const word of words) {
      onChunk(word + ' ')
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  return response.content
}
