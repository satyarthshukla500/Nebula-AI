-- RAG System: Documents Table Migration
-- This migration creates the necessary tables and functions for the RAG system

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for storing document chunks with embeddings
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  fileName TEXT NOT NULL,
  chunkIndex INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documents_fileName_idx 
ON documents(fileName);

CREATE INDEX IF NOT EXISTS documents_createdAt_idx 
ON documents(createdAt DESC);

-- Create RPC function for efficient vector similarity search
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

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updatedAt
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create view for document statistics
CREATE OR REPLACE VIEW document_stats AS
SELECT
  fileName,
  COUNT(*) as chunk_count,
  AVG(LENGTH(content)) as avg_chunk_size,
  MIN(createdAt) as first_uploaded,
  MAX(createdAt) as last_updated
FROM documents
GROUP BY fileName;

-- Grant permissions (adjust based on your RLS policies)
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (uncomment and adjust as needed):
-- CREATE POLICY "Users can view all documents"
--   ON documents FOR SELECT
--   USING (true);

-- CREATE POLICY "Authenticated users can insert documents"
--   ON documents FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Users can delete their own documents"
--   ON documents FOR DELETE
--   USING (metadata->>'userId' = auth.uid()::text);

-- Add comments for documentation
COMMENT ON TABLE documents IS 'Stores document chunks with vector embeddings for RAG system';
COMMENT ON COLUMN documents.content IS 'Text content of the document chunk';
COMMENT ON COLUMN documents.embedding IS 'Vector embedding (1536 dimensions) from AWS Bedrock Titan';
COMMENT ON COLUMN documents.fileName IS 'Original filename of the document';
COMMENT ON COLUMN documents.chunkIndex IS 'Index of this chunk within the document';
COMMENT ON COLUMN documents.metadata IS 'Additional metadata (userId, fileSize, etc.)';

COMMENT ON FUNCTION match_documents IS 'Performs vector similarity search to find relevant document chunks';
