// Vector similarity search and retrieval
import { createClient } from '@supabase/supabase-js'
import { createEmbedding, cosineSimilarity } from './embeddings'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface RetrievedChunk {
  id: string
  content: string
  fileName: string
  chunkIndex: number
  similarity: number
  metadata?: Record<string, any>
}

export interface RetrievalOptions {
  topK?: number
  minSimilarity?: number
  fileName?: string
}

/**
 * Retrieve relevant chunks for a query using vector similarity
 * @param query - User question
 * @param options - Retrieval options
 * @returns Array of relevant chunks sorted by similarity
 */
export async function retrieveRelevantChunks(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  const { topK = 5, minSimilarity = 0.5, fileName } = options

  console.log('[Retriever] Retrieving chunks for query:', query.substring(0, 100))
  console.log('[Retriever] Options:', { topK, minSimilarity, fileName })

  try {
    // Create embedding for query
    const { embedding: queryEmbedding } = await createEmbedding(query)

    // Fetch all documents (or filtered by fileName)
    let query_builder = supabase
      .from('documents')
      .select('id, content, embedding, fileName, chunkIndex, metadata')

    if (fileName) {
      query_builder = query_builder.eq('fileName', fileName)
    }

    const { data, error } = await query_builder

    if (error) {
      console.error('[Retriever] Error fetching documents:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log('[Retriever] No documents found')
      return []
    }

    console.log('[Retriever] Fetched', data.length, 'chunks')

    // Calculate similarity for each chunk
    const chunksWithSimilarity = data.map(doc => ({
      id: doc.id,
      content: doc.content,
      fileName: doc.fileName,
      chunkIndex: doc.chunkIndex,
      metadata: doc.metadata,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding),
    }))

    // Filter by minimum similarity and sort
    const relevantChunks = chunksWithSimilarity
      .filter(chunk => chunk.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)

    console.log('[Retriever] Found', relevantChunks.length, 'relevant chunks')
    if (relevantChunks.length > 0) {
      console.log('[Retriever] Top similarity:', relevantChunks[0].similarity.toFixed(3))
      console.log('[Retriever] Lowest similarity:', relevantChunks[relevantChunks.length - 1].similarity.toFixed(3))
    }

    return relevantChunks
  } catch (error: any) {
    console.error('[Retriever] Error retrieving chunks:', error)
    throw new Error(`Failed to retrieve chunks: ${error.message}`)
  }
}

/**
 * Retrieve chunks using Supabase's built-in vector similarity (if pgvector is enabled)
 * This is more efficient but requires pgvector extension
 * @param query - User question
 * @param options - Retrieval options
 * @returns Array of relevant chunks
 */
export async function retrieveWithPgVector(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  const { topK = 5, fileName } = options

  console.log('[Retriever] Using pgvector for retrieval')

  try {
    // Create embedding for query
    const { embedding: queryEmbedding } = await createEmbedding(query)

    // Use Supabase RPC function for vector similarity
    // Note: This requires a custom SQL function in Supabase
    let rpcCall = supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: topK,
    })

    if (fileName) {
      rpcCall = rpcCall.eq('fileName', fileName)
    }

    const { data, error } = await rpcCall

    if (error) {
      console.error('[Retriever] pgvector error:', error)
      // Fallback to manual similarity calculation
      return retrieveRelevantChunks(query, options)
    }

    console.log('[Retriever] Retrieved', data?.length || 0, 'chunks with pgvector')
    return data || []
  } catch (error: any) {
    console.error('[Retriever] pgvector failed, falling back:', error)
    return retrieveRelevantChunks(query, options)
  }
}

/**
 * Check if a query should use RAG
 * @param query - User question
 * @returns True if query should use RAG
 */
export function shouldUseRAG(query: string): boolean {
  const ragKeywords = [
    'document',
    'file',
    'uploaded',
    'according to',
    'based on',
    'in the',
    'from the',
    'what does',
    'explain',
    'summarize',
    'tell me about',
  ]

  const lowerQuery = (typeof query === 'string' ? query : '').toLowerCase()
  return ragKeywords.some(keyword => lowerQuery.includes(keyword))
}

/**
 * Get context summary for retrieved chunks
 * @param chunks - Retrieved chunks
 * @returns Summary string
 */
export function getContextSummary(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return 'No relevant context found'
  }

  const files = [...new Set(chunks.map(c => c.fileName))]
  const avgSimilarity = chunks.reduce((sum, c) => sum + c.similarity, 0) / chunks.length

  return `Found ${chunks.length} relevant chunks from ${files.length} document(s) (avg similarity: ${avgSimilarity.toFixed(2)})`
}
