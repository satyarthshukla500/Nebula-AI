// Vector store using Supabase
import { createClient } from '@supabase/supabase-js'
import { createEmbedding } from './embeddings'
import { chunkText, cleanText, Chunk } from './chunker'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface Document {
  id: string
  content: string
  embedding: number[]
  fileName: string
  chunkIndex: number
  metadata?: Record<string, any>
  createdAt: Date
}

export interface StoreDocumentOptions {
  fileName: string
  chunkSize?: number
  chunkOverlap?: number
  metadata?: Record<string, any>
}

/**
 * Store document chunks with embeddings in Supabase
 * @param text - Document text
 * @param options - Storage options
 * @returns Array of stored document IDs
 */
export async function storeDocument(
  text: string,
  options: StoreDocumentOptions
): Promise<string[]> {
  const { fileName, chunkSize = 800, chunkOverlap = 200, metadata = {} } = options

  console.log('[Store] Storing document:', fileName)
  console.log('[Store] Text length:', text.length)

  // Clean and chunk text
  const cleanedText = cleanText(text)
  const chunks = chunkText(cleanedText, { chunkSize, chunkOverlap })

  console.log('[Store] Created', chunks.length, 'chunks')

  const documentIds: string[] = []

  // Process each chunk
  for (const chunk of chunks) {
    try {
      // Create embedding
      const { embedding } = await createEmbedding(chunk.content)

      // Store in Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert({
          content: chunk.content,
          embedding: embedding,
          fileName: fileName,
          chunkIndex: chunk.index,
          metadata: {
            ...metadata,
            startChar: chunk.startChar,
            endChar: chunk.endChar,
            chunkSize: chunk.content.length,
          },
          createdAt: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) {
        console.error('[Store] Error storing chunk:', error)
        throw error
      }

      if (data) {
        documentIds.push(data.id)
        console.log('[Store] Stored chunk', chunk.index, 'with ID:', data.id)
      }
    } catch (error: any) {
      console.error('[Store] Error processing chunk', chunk.index, ':', error)
      throw new Error(`Failed to store chunk ${chunk.index}: ${error.message}`)
    }
  }

  console.log('[Store] Successfully stored', documentIds.length, 'chunks')
  return documentIds
}

/**
 * Delete all chunks for a specific file
 * @param fileName - Name of file to delete
 * @returns Number of deleted chunks
 */
export async function deleteDocument(fileName: string): Promise<number> {
  console.log('[Store] Deleting document:', fileName)

  const { data, error } = await supabase
    .from('documents')
    .delete()
    .eq('fileName', fileName)
    .select('id')

  if (error) {
    console.error('[Store] Error deleting document:', error)
    throw error
  }

  const count = data?.length || 0
  console.log('[Store] Deleted', count, 'chunks')
  return count
}

/**
 * Get all documents (file names)
 * @returns Array of unique file names
 */
export async function listDocuments(): Promise<string[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('fileName')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('[Store] Error listing documents:', error)
    throw error
  }

  // Get unique file names
  const fileNames = [...new Set(data?.map(d => d.fileName) || [])]
  console.log('[Store] Found', fileNames.length, 'documents')
  return fileNames
}

/**
 * Get document statistics
 * @param fileName - Optional file name filter
 * @returns Document statistics
 */
export async function getDocumentStats(fileName?: string): Promise<{
  totalChunks: number
  totalFiles: number
  avgChunkSize: number
}> {
  let query = supabase.from('documents').select('content, fileName')

  if (fileName) {
    query = query.eq('fileName', fileName)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Store] Error getting stats:', error)
    throw error
  }

  const totalChunks = data?.length || 0
  const uniqueFiles = new Set(data?.map(d => d.fileName) || [])
  const totalFiles = uniqueFiles.size
  const avgChunkSize = totalChunks > 0
    ? Math.round(data!.reduce((sum, d) => sum + d.content.length, 0) / totalChunks)
    : 0

  return {
    totalChunks,
    totalFiles,
    avgChunkSize,
  }
}

/**
 * Check if Supabase documents table exists and is accessible
 * @returns True if table is accessible
 */
export async function checkTableExists(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .select('id')
      .limit(1)

    return !error
  } catch (error) {
    console.error('[Store] Table check failed:', error)
    return false
  }
}
