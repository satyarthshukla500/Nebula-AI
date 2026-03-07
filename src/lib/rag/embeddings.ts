// AWS Bedrock Titan Embeddings
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_BEDROCK_MODEL_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const EMBEDDING_MODEL = 'amazon.titan-embed-text-v1'

export interface EmbeddingResult {
  embedding: number[]
  inputTokens: number
}

/**
 * Create embedding vector for text using AWS Bedrock Titan
 * @param text - Text to embed
 * @returns Embedding vector (1536 dimensions)
 */
export async function createEmbedding(text: string): Promise<EmbeddingResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty')
  }

  console.log('[Embeddings] Creating embedding for text:', text.substring(0, 100) + '...')

  try {
    const payload = {
      inputText: text.trim(),
    }

    const command = new InvokeModelCommand({
      modelId: EMBEDDING_MODEL,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    })

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))

    console.log('[Embeddings] Embedding created successfully')
    console.log('[Embeddings] Vector dimensions:', responseBody.embedding.length)
    console.log('[Embeddings] Input tokens:', responseBody.inputTextTokenCount)

    return {
      embedding: responseBody.embedding,
      inputTokens: responseBody.inputTextTokenCount,
    }
  } catch (error: any) {
    console.error('[Embeddings] Error creating embedding:', error)
    throw new Error(`Failed to create embedding: ${error.message}`)
  }
}

/**
 * Create embeddings for multiple texts in batch
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  console.log('[Embeddings] Creating embeddings for', texts.length, 'texts')

  const embeddings: number[][] = []

  for (const text of texts) {
    const result = await createEmbedding(text)
    embeddings.push(result.embedding)
  }

  console.log('[Embeddings] Created', embeddings.length, 'embeddings')
  return embeddings
}

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score (0-1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
