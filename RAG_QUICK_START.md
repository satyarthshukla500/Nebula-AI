# RAG System - Quick Start Guide

## Setup (5 minutes)

### Step 1: Create Supabase Table

Run the migration in Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard → SQL Editor → New Query
# Copy and paste the contents of:
supabase/migrations/create_rag_documents_table.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### Step 2: Verify Environment Variables

Check `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BEDROCK_MODEL_REGION=us-east-1
```

### Step 3: Test RAG System

```typescript
import { getRAGStatus } from '@/lib/rag'

const status = await getRAGStatus()
console.log('RAG Available:', status.available)
// Should print: RAG Available: true
```

## Usage

### Upload a Document

```typescript
// In your component or API route
const formData = new FormData()
formData.append('file', textFile)
formData.append('fileName', 'my-document.txt')

const response = await fetch('/api/rag/upload', {
  method: 'POST',
  body: formData,
})

const data = await response.json()
console.log('Stored', data.data.chunksStored, 'chunks')
```

### Ask Questions

```typescript
// The AI will automatically use RAG when appropriate
const response = await fetch('/api/workspaces/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What does the document say about machine learning?',
    workspaceType: 'general_chat',
  }),
})

const data = await response.json()
console.log('Answer:', data.data.message)
```

### List Documents

```typescript
const response = await fetch('/api/rag/documents')
const data = await response.json()

console.log('Documents:', data.data.documents)
console.log('Total chunks:', data.data.stats.totalChunks)
```

### Delete a Document

```typescript
const response = await fetch('/api/rag/documents?fileName=my-document.txt', {
  method: 'DELETE',
})

const data = await response.json()
console.log('Deleted', data.data.deletedChunks, 'chunks')
```

## Testing

### Test 1: Upload Document

```bash
curl -X POST http://localhost:3000/api/rag/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-document.txt" \
  -F "fileName=test-document.txt"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "fileName": "test-document.txt",
    "chunksStored": 10,
    "textLength": 8000
  }
}
```

### Test 2: Query Document

```bash
curl -X POST http://localhost:3000/api/rag/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic?",
    "topK": 3
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "chunks": [
      {
        "content": "The main topic is...",
        "similarity": 0.85,
        "fileName": "test-document.txt"
      }
    ],
    "count": 3
  }
}
```

### Test 3: Chat with RAG

```bash
curl -X POST http://localhost:3000/api/workspaces/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "According to the document, what is AI?",
    "workspaceType": "general_chat"
  }'
```

Expected: AI response using document context

## Common Issues

### Issue: "Table documents does not exist"

**Solution**: Run the Supabase migration
```sql
-- In Supabase SQL Editor
CREATE TABLE documents (...);
```

### Issue: "AWS credentials not configured"

**Solution**: Add to `.env.local`
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Issue: "No relevant chunks found"

**Solutions**:
1. Lower similarity threshold: `minSimilarity: 0.3`
2. Upload more documents
3. Rephrase your question

### Issue: "Embedding creation failed"

**Solutions**:
1. Check AWS Bedrock access
2. Verify region: `us-east-1`
3. Check Titan model availability

## Architecture Flow

```
1. Upload Document
   ↓
2. Split into Chunks (800 chars each)
   ↓
3. Create Embeddings (AWS Bedrock Titan)
   ↓
4. Store in Supabase (with vectors)
   ↓
5. User Asks Question
   ↓
6. Create Query Embedding
   ↓
7. Find Similar Chunks (vector search)
   ↓
8. Build Enhanced Prompt (context + question)
   ↓
9. Send to AI Provider (Bedrock/Groq)
   ↓
10. Return Answer with Sources
```

## API Reference

### POST /api/rag/upload
Upload and process document

**Request**:
- `file`: File (text)
- `fileName`: string

**Response**:
```json
{
  "success": true,
  "data": {
    "fileName": "doc.txt",
    "chunksStored": 15,
    "textLength": 12000
  }
}
```

### GET /api/rag/documents
List all documents

**Response**:
```json
{
  "success": true,
  "data": {
    "documents": ["doc1.txt", "doc2.txt"],
    "stats": {
      "totalChunks": 50,
      "totalFiles": 2
    }
  }
}
```

### DELETE /api/rag/documents?fileName=doc.txt
Delete document

**Response**:
```json
{
  "success": true,
  "data": {
    "fileName": "doc.txt",
    "deletedChunks": 15
  }
}
```

### POST /api/rag/query
Query documents directly

**Request**:
```json
{
  "query": "What is AI?",
  "topK": 5,
  "minSimilarity": 0.5
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "chunks": [...],
    "count": 5
  }
}
```

## Code Examples

### Example 1: Simple Upload

```typescript
async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await fetch('/api/rag/upload', {
    method: 'POST',
    body: formData,
  })
  
  return res.json()
}
```

### Example 2: Ask with RAG

```typescript
import { generateAIResponse } from '@/lib/ai'

const messages = [
  { role: 'user', content: 'What does the document say about AI?' }
]

const response = await generateAIResponse(messages, undefined, 4096, 'auto')

if (response.ragContext) {
  console.log('Used RAG with', response.ragContext.chunks.length, 'chunks')
  console.log('Sources:', response.ragContext.sources)
}
```

### Example 3: Manual RAG

```typescript
import { retrieveRelevantChunks, buildRAGPrompt } from '@/lib/rag'

// Find chunks
const chunks = await retrieveRelevantChunks('What is AI?')

// Build prompt
const { prompt, context } = await buildRAGPrompt('What is AI?')

// Use with AI
const response = await generateAIResponse([
  { role: 'user', content: prompt }
])
```

## Performance Tips

1. **Chunk Size**: 800 chars is optimal for most documents
2. **Top K**: Use 3-5 chunks for best results
3. **Similarity**: Start with 0.5, adjust based on results
4. **Indexing**: Ensure pgvector index is created
5. **Caching**: Consider caching frequent queries

## Next Steps

1. ✅ Setup complete
2. ✅ Upload test document
3. ✅ Test RAG queries
4. 🔄 Integrate with UI
5. 🔄 Add document management UI
6. 🔄 Monitor performance
7. 🔄 Optimize chunk size
8. 🔄 Add PDF support

## Support

For issues or questions:
1. Check logs: `[RAG]`, `[Embeddings]`, `[Store]`, `[Retriever]`
2. Verify Supabase table exists
3. Check AWS Bedrock access
4. Review `RAG_SYSTEM_DOCUMENTATION.md`

## Summary

The RAG system is ready to use! Just:
1. Run Supabase migration
2. Upload documents via API
3. Ask questions in chat
4. AI automatically uses document context

**Status**: ✅ Production Ready
