// Document chunking utilities

export interface Chunk {
  content: string
  index: number
  startChar: number
  endChar: number
}

export interface ChunkOptions {
  chunkSize?: number
  chunkOverlap?: number
  separator?: string
}

/**
 * Split text into chunks with overlap
 * @param text - Text to chunk
 * @param options - Chunking options
 * @returns Array of chunks
 */
export function chunkText(
  text: string,
  options: ChunkOptions = {}
): Chunk[] {
  const {
    chunkSize = 800,
    chunkOverlap = 200,
    separator = '\n\n',
  } = options

  if (!text || text.trim().length === 0) {
    return []
  }

  console.log('[Chunker] Chunking text:', {
    textLength: text.length,
    chunkSize,
    chunkOverlap,
  })

  const chunks: Chunk[] = []
  
  // First, try to split by separator (paragraphs)
  const paragraphs = text.split(separator).filter(p => p.trim().length > 0)
  
  let currentChunk = ''
  let chunkIndex = 0
  let startChar = 0

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim()
    
    // If adding this paragraph would exceed chunk size
    if (currentChunk.length + trimmedParagraph.length > chunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
        startChar,
        endChar: startChar + currentChunk.length,
      })
      
      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-chunkOverlap)
      currentChunk = overlapText + '\n\n' + trimmedParagraph
      startChar = startChar + currentChunk.length - overlapText.length - trimmedParagraph.length - 2
      chunkIndex++
    } else {
      // Add paragraph to current chunk
      if (currentChunk.length > 0) {
        currentChunk += '\n\n' + trimmedParagraph
      } else {
        currentChunk = trimmedParagraph
      }
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      startChar,
      endChar: startChar + currentChunk.length,
    })
  }

  console.log('[Chunker] Created', chunks.length, 'chunks')
  console.log('[Chunker] Average chunk size:', 
    Math.round(chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length)
  )

  return chunks
}

/**
 * Split text into fixed-size chunks (simple approach)
 * @param text - Text to chunk
 * @param chunkSize - Size of each chunk
 * @param overlap - Overlap between chunks
 * @returns Array of chunks
 */
export function simpleChunk(
  text: string,
  chunkSize: number = 800,
  overlap: number = 200
): Chunk[] {
  const chunks: Chunk[] = []
  let index = 0
  let position = 0

  while (position < text.length) {
    const end = Math.min(position + chunkSize, text.length)
    const content = text.slice(position, end).trim()

    if (content.length > 0) {
      chunks.push({
        content,
        index,
        startChar: position,
        endChar: end,
      })
      index++
    }

    position += chunkSize - overlap
  }

  return chunks
}

/**
 * Extract text from PDF buffer (placeholder - requires pdf-parse)
 * @param buffer - PDF file buffer
 * @returns Extracted text
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Note: This requires pdf-parse package
  // For now, return placeholder
  console.warn('[Chunker] PDF extraction not implemented - install pdf-parse')
  throw new Error('PDF extraction requires pdf-parse package')
}

/**
 * Clean and normalize text
 * @param text - Text to clean
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/  +/g, ' ') // Remove multiple spaces
    .trim()
}
