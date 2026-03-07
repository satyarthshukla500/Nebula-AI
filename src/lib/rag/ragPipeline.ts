// RAG Pipeline - Combines retrieval with generation
import { retrieveRelevantChunks, RetrievalOptions, RetrievedChunk, shouldUseRAG } from './retriever'
import { AIMessage } from '@/lib/ai'

export interface RAGContext {
  chunks: RetrievedChunk[]
  contextText: string
  sources: string[]
}

export interface RAGOptions extends RetrievalOptions {
  includeContext?: boolean
  maxContextLength?: number
}

/**
 * Build RAG-enhanced prompt with retrieved context
 * @param query - User question
 * @param options - RAG options
 * @returns Enhanced prompt with context
 */
export async function buildRAGPrompt(
  query: string,
  options: RAGOptions = {}
): Promise<{ prompt: string; context: RAGContext | null }> {
  const {
    topK = 5,
    minSimilarity = 0.5,
    fileName,
    includeContext = true,
    maxContextLength = 3000,
  } = options

  console.log('[RAG Pipeline] Building RAG prompt for query:', query.substring(0, 100))

  // Check if we should use RAG
  if (!includeContext && !shouldUseRAG(query)) {
    console.log('[RAG Pipeline] Query does not require RAG')
    return { prompt: query, context: null }
  }

  try {
    // Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(query, {
      topK,
      minSimilarity,
      fileName,
    })

    if (chunks.length === 0) {
      console.log('[RAG Pipeline] No relevant chunks found')
      return { prompt: query, context: null }
    }

    // Build context from chunks
    let contextText = ''
    const sources = [...new Set(chunks.map(c => c.fileName))]

    for (const chunk of chunks) {
      const chunkText = `[Source: ${chunk.fileName}, Chunk ${chunk.chunkIndex}]\n${chunk.content}\n\n`
      
      // Check if adding this chunk would exceed max length
      if (contextText.length + chunkText.length > maxContextLength) {
        console.log('[RAG Pipeline] Reached max context length')
        break
      }
      
      contextText += chunkText
    }

    // Build enhanced prompt
    const enhancedPrompt = `Use the following context to answer the question. If the answer is not in the context, say so.

Context:
${contextText.trim()}

Question: ${query}

Answer based on the context above:`

    const context: RAGContext = {
      chunks,
      contextText: contextText.trim(),
      sources,
    }

    console.log('[RAG Pipeline] Built prompt with', chunks.length, 'chunks')
    console.log('[RAG Pipeline] Context length:', contextText.length, 'characters')
    console.log('[RAG Pipeline] Sources:', sources.join(', '))

    return { prompt: enhancedPrompt, context }
  } catch (error: any) {
    console.error('[RAG Pipeline] Error building RAG prompt:', error)
    // Fallback to original query
    return { prompt: query, context: null }
  }
}

/**
 * Convert RAG prompt to AI messages format
 * @param query - User question
 * @param options - RAG options
 * @returns Array of AI messages with context
 */
export async function buildRAGMessages(
  query: string,
  options: RAGOptions = {}
): Promise<{ messages: AIMessage[]; context: RAGContext | null }> {
  const { prompt, context } = await buildRAGPrompt(query, options)

  const messages: AIMessage[] = [
    {
      role: 'user',
      content: prompt,
    },
  ]

  return { messages, context }
}

/**
 * Format RAG context for display
 * @param context - RAG context
 * @returns Formatted string
 */
export function formatRAGContext(context: RAGContext): string {
  if (!context || context.chunks.length === 0) {
    return 'No context used'
  }

  const lines = [
    `📚 Used ${context.chunks.length} relevant chunks from:`,
    ...context.sources.map(source => `  • ${source}`),
    '',
    'Top matches:',
    ...context.chunks.slice(0, 3).map((chunk, i) => 
      `  ${i + 1}. ${chunk.fileName} (similarity: ${chunk.similarity.toFixed(2)})`
    ),
  ]

  return lines.join('\n')
}

/**
 * Check if RAG system is available
 * @returns True if RAG is configured and ready
 */
export async function isRAGAvailable(): Promise<boolean> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('[RAG Pipeline] Supabase not configured')
      return false
    }

    // Check if AWS Bedrock is configured for embeddings
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('[RAG Pipeline] AWS credentials not configured')
      return false
    }

    console.log('[RAG Pipeline] RAG system is available')
    return true
  } catch (error) {
    console.error('[RAG Pipeline] Error checking RAG availability:', error)
    return false
  }
}

/**
 * Get RAG system status
 * @returns Status information
 */
export async function getRAGStatus(): Promise<{
  available: boolean
  supabaseConfigured: boolean
  awsConfigured: boolean
  embeddingModel: string
}> {
  const supabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const awsConfigured = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  )

  const available = supabaseConfigured && awsConfigured

  return {
    available,
    supabaseConfigured,
    awsConfigured,
    embeddingModel: 'amazon.titan-embed-text-v1',
  }
}
