// RAG System - Main exports

export * from './embeddings'
export * from './chunker'
export * from './store'
export * from './retriever'
export * from './ragPipeline'

// Re-export commonly used functions
export {
  createEmbedding,
  createEmbeddings,
} from './embeddings'

export {
  chunkText,
  cleanText,
} from './chunker'

export {
  storeDocument,
  deleteDocument,
  listDocuments,
  getDocumentStats,
} from './store'

export {
  retrieveRelevantChunks,
  shouldUseRAG,
} from './retriever'

export {
  buildRAGPrompt,
  buildRAGMessages,
  isRAGAvailable,
  getRAGStatus,
} from './ragPipeline'
