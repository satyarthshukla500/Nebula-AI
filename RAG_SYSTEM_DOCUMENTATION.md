# RAG (Retrieval Augmented Generation) System Documentation

## Overview

The Nebula AI RAG system enables the AI to answer questions using information from uploaded documents. It combines vector similarity search with the existing AI providers (Bedrock, Groq) to provide accurate, context-aware responses.

## Architecture

```
┌─────────────────┐
│  User Question  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  RAG Detection  │ ← Auto-detect if query needs RAG
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Create Query  │
│    Embedding    │ ← AWS Bedrock Titan
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Vector Search   │
│   in Supabase   │ ← Find similar chunks
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Build Enhanced  │
│     Prompt      │ ← Context + Question
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  AI Provider    │
│ (Bedrock/Groq)  │ ← Generate answer
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  AI Response    │
│  with Sources   │
└─────────────────┘
```

## Components

### 1. Embeddings (`src/lib/rag/embeddings.ts`)

**Purpose**: Create vector embeddings using AWS Bedrock Titan

**Key Functions**:
- `createEmbedding(text: string)` - Create embedding for single text
- `createEmbeddings(texts: string[])` - Batch create embeddings
- `cosineSimilarity(a, b)` - Calculate similarity between vectors

**Model**: `amazon.titan-embed-text-v1`
**Dimensions**: 1536

**Example**:
```typescript
import { createEmbedding } from '@/lib/rag'

const { embedding, inputTokens } = await createEmbedding('What is machine learning?')
// embedding: number[] (1536 dimensions)
```

### 2. Chunker (`src/lib/rag/chunker.ts`)

**Purpose**: Split documents into manageable chunks

**Key Functions**:
- `chunkText(text, options)` - Smart chunking with overlap
- `simpleChunk(text, size, overlap)` - Fixed-size chunking
- `cleanText(text)` - Normalize text

**Default Settings**:
- Chunk size: 800 characters
- Overlap: 200 characters
- Separator: `\n\n` (paragraphs)

**Example**:
```typescript
import { chunkText } from '@/lib/rag'

const chunks = chunkText(documentText, {
  chunkSize: 800,
  chunkOverlap: 200,
})
// Returns: Chunk[] with content, index, startChar, endChar
```

### 3. Store (`src/lib/rag/store.ts`)

**Purpose**: Store document chunks with embeddings in Supabase

**Key Functions**:
- `storeDocument(text, options)` - Store document with embeddings
- `deleteDocument(fileName)` - Delete all chunks for a file
- `listDocuments()` - Get all document names
- `getDocumentStats(fileName?)` - Get statistics

**Supabase Table**: `documents`

**Schema**:
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  fileName TEXT NOT NULL,
  chunkIndex INTEGER NOT NULL,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

**Example**:
```typescript
import { storeDocument } from '@/lib/rag'

const documentIds = await storeDocument(text, {
  fileName: 'guide.txt',
  chunkSize: 800,
  metadata: { userId: 'user123' }
})
// Returns: string[] (document IDs)
```

### 4. Retriever (`src/lib/rag/retriever.ts`)

**Purpose**: Find relevant chunks using vector similarity

**Key Functions**:
- `retrieveRelevantChunks(query, options)` - Find similar chunks
- `shouldUseRAG(query)` - Auto-detect if query needs RAG
- `getContextSummary(chunks)` - Format context info

**Options**:
- `topK`: Number of chunks to return (default: 5)
- `minSimilarity`: Minimum similarity score (default: 0.5)
- `fileName`: Filter by specific file

**Example**:
```typescript
import { retrieveRelevantChunks } from '@/lib/rag'

const chunks = await retrieveRelevantChunks('What is AI?', {
  topK: 5,
  minSimilarity: 0.5,
})
// Returns: RetrievedChunk[] with content, similarity, fileName
```

### 5. RAG Pipeline (`src/lib/rag/ragPipeline.ts`)

**Purpose**: Combine retrieval with generation

**Key Functions**:
- `buildRAGPrompt(query, options)` - Build enhanced prompt
- `buildRAGMessages(query, options)` - Build AI messages
- `isRAGAvailable()` - Check if RAG is configured
- `getRAGStatus()` - Get system status

**Prompt Format**:
```
Use the following context to answer the question. If the answer is not in the context, say so.

Context:
[Source: file1.txt, Chunk 0]
Content of chunk 1...

[Source: file1.txt, Chunk 1]
Content of chunk 2...

Question: {user_question}

Answer based on the context above:
```

**Example**:
```typescript
import { buildRAGMessages } from '@/lib/rag'

const { messages, context } = await buildRAGMessages('What is AI?', {
  topK: 5,
  minSimilarity: 0.5,
})
// messages: AIMessage[] (ready for AI provider)
// context: RAGContext (chunks, sources, etc.)
```

## Integration with AI Router

The RAG system is integrated into `src/lib/ai.ts`:

```typescript
import { generateAIResponse } from '@/lib/ai'

// Auto-detect RAG usage
const response = await generateAIResponse(messages, systemPrompt, 4096, 'auto')

// Force RAG usage
const response = await generateAIResponse(messages, systemPrompt, 4096, true)

// Disable RAG
const response = await generateAIResponse(messages, systemPrompt, 4096, false)

// Response includes RAG context
if (response.ragContext) {
  console.log('Used', response.ragContext.chunks.length, 'chunks')
  console.log('Sources:', response.ragContext.sources)
}
```

## API Endpoints

### Upload Document
```
POST /api/rag/upload
Content-Type: multipart/form-data

Body:
- file: File (text or PDF)
- fileName: string (optional)

Response:
{
  "success": true,
  "data": {
    "fileName": "guide.txt",
    "chunksStored": 15,
    "textLength": 12000,
    "documentIds": ["uuid1", "uuid2", ...]
  }
}
```

### List Documents
```
GET /api/rag/documents

Response:
{
  "success": true,
  "data": {
    "documents": ["file1.txt", "file2.txt"],
    "stats": {
      "totalChunks": 50,
      "totalFiles": 2,
      "avgChunkSize": 750
    }
  }
}
```

### Delete Document
```
DELETE /api/rag/documents?fileName=guide.txt

Response:
{
  "success": true,
  "data": {
    "fileName": "guide.txt",
    "deletedChunks": 15
  }
}
```

### Query Documents
```
POST /api/rag/query

Body:
{
  "query": "What is machine learning?",
  "topK": 5,
  "minSimilarity": 0.5,
  "fileName": "guide.txt" // optional
}

Response:
{
  "success": true,
  "data": {
    "query": "What is machine learning?",
    "chunks": [
      {
        "id": "uuid",
        "content": "Machine learning is...",
        "fileName": "guide.txt",
        "chunkIndex": 0,
        "similarity": 0.85
      }
    ],
    "count": 5
  }
}
```

## Setup Instructions

### 1. Supabase Setup

Create the documents table:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  fileName TEXT NOT NULL,
  chunkIndex INTEGER NOT NULL,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX documents_embedding_idx 
ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for fileName lookups
CREATE INDEX documents_fileName_idx ON documents(fileName);

-- Optional: Create RPC function for efficient similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter_fileName TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  fileName TEXT,
  chunkIndex INT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.fileName,
    documents.chunkIndex,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE filter_fileName IS NULL OR documents.fileName = filter_fileName
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 2. Environment Variables

Ensure these are set in `.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AWS Bedrock (required for embeddings and AI)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BEDROCK_MODEL_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
```

### 3. Install Dependencies

The RAG system uses existing dependencies:
- `@supabase/supabase-js` ✓
- `@aws-sdk/client-bedrock-runtime` ✓

No additional packages needed!

## Usage Examples

### Example 1: Upload and Query Document

```typescript
// 1. Upload document
const formData = new FormData()
formData.append('file', file)
formData.append('fileName', 'ml-guide.txt')

const uploadResponse = await fetch('/api/rag/upload', {
  method: 'POST',
  body: formData,
})

// 2. Ask question
const response = await fetch('/api/workspaces/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What is machine learning according to the document?',
    workspaceType: 'general_chat',
  }),
})

// AI will automatically use RAG to answer from the document
```

### Example 2: Manual RAG Query

```typescript
import { retrieveRelevantChunks, buildRAGPrompt } from '@/lib/rag'

// Find relevant chunks
const chunks = await retrieveRelevantChunks('What is AI?', {
  topK: 3,
  minSimilarity: 0.6,
})

// Build enhanced prompt
const { prompt, context } = await buildRAGPrompt('What is AI?', {
  topK: 3,
})

console.log('Found', context.chunks.length, 'relevant chunks')
console.log('Sources:', context.sources)
```

### Example 3: Check RAG Status

```typescript
import { getRAGStatus, isRAGAvailable } from '@/lib/rag'

const status = await getRAGStatus()
console.log('RAG available:', status.available)
console.log('Supabase configured:', status.supabaseConfigured)
console.log('AWS configured:', status.awsConfigured)
console.log('Embedding model:', status.embeddingModel)

if (await isRAGAvailable()) {
  console.log('RAG system is ready!')
}
```

## RAG Detection Keywords

The system auto-detects when to use RAG based on these keywords:
- "document"
- "file"
- "uploaded"
- "according to"
- "based on"
- "in the"
- "from the"
- "what does"
- "explain"
- "summarize"
- "tell me about"

## Performance Considerations

### Embedding Creation
- Time: ~200-500ms per chunk
- Cost: Minimal (Titan embeddings are cheap)
- Batch processing: Sequential (can be parallelized)

### Vector Search
- Time: ~50-200ms for 1000 chunks
- Scales with: Number of chunks in database
- Optimization: Use pgvector indexes

### End-to-End RAG Query
- Embedding: ~200ms
- Search: ~100ms
- AI Generation: ~2-5s
- **Total**: ~2.5-5.5s

## Limitations

1. **Text Only**: Currently supports text files only (PDF support requires pdf-parse)
2. **English**: Optimized for English text
3. **Chunk Size**: Fixed at 800 characters (configurable)
4. **No Reranking**: Uses simple cosine similarity
5. **No Caching**: Embeddings created on every query

## Future Enhancements

- [ ] PDF text extraction
- [ ] Multi-language support
- [ ] Semantic reranking
- [ ] Embedding caching
- [ ] Hybrid search (keyword + vector)
- [ ] Document versioning
- [ ] Access control per document
- [ ] Real-time document updates
- [ ] Batch upload API
- [ ] Document preview in UI

## Troubleshooting

### RAG Not Working

**Check**:
1. Supabase table exists: `SELECT * FROM documents LIMIT 1`
2. AWS credentials configured
3. Documents uploaded: `GET /api/rag/documents`
4. RAG status: `await getRAGStatus()`

### Low Similarity Scores

**Solutions**:
- Lower `minSimilarity` threshold (try 0.3-0.4)
- Increase `topK` to get more chunks
- Improve document chunking
- Add more context to query

### Slow Performance

**Optimizations**:
- Create pgvector index on embeddings
- Use `match_documents` RPC function
- Reduce `topK` value
- Cache embeddings

### Out of Memory

**Solutions**:
- Reduce chunk size
- Process documents in batches
- Use streaming for large files

## Security

- ✅ Authentication required for all RAG endpoints
- ✅ User-specific document metadata
- ✅ Service role key for Supabase (server-side only)
- ⚠️ No document-level access control (all users see all docs)
- ⚠️ No rate limiting on uploads

## Monitoring

**Key Metrics**:
- Documents uploaded
- Total chunks stored
- Average chunk size
- Query latency
- Similarity scores
- RAG usage rate

**Logs**:
- `[Embeddings]` - Embedding creation
- `[Chunker]` - Document chunking
- `[Store]` - Document storage
- `[Retriever]` - Chunk retrieval
- `[RAG Pipeline]` - RAG prompt building
- `[AI]` - RAG integration in AI router

## Summary

The RAG system is fully implemented and integrated with the existing Nebula AI architecture. It provides:

✅ Document upload and chunking  
✅ Vector embeddings with AWS Bedrock Titan  
✅ Vector storage in Supabase  
✅ Similarity search and retrieval  
✅ Automatic RAG prompt enhancement  
✅ Integration with AI providers  
✅ API endpoints for management  
✅ Comprehensive logging  

The system is production-ready pending Supabase table creation and testing!
