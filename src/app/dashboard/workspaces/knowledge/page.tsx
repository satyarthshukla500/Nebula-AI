'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface Document {
  fileName: string
  chunksCount?: number
}

interface QueryResult {
  query: string
  chunks: Array<{
    content: string
    fileName: string
    similarity: number
  }>
  count: number
}

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  
  const [query, setQuery] = useState('')
  const [isQuerying, setIsQuerying] = useState(false)
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Load documents on mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setIsLoadingDocs(true)
    try {
      const response = await fetch('/api/rag/documents')
      const data = await response.json()
      
      if (data.success) {
        const docs = data.data.documents.map((fileName: string) => ({
          fileName,
        }))
        setDocuments(docs)
      } else {
        console.error('Failed to load documents:', data.error)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoadingDocs(false)
    }
  }

  const validateFile = (file: File): string | null => {
    const validTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const validExtensions = ['.pdf', '.txt', '.docx']
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      return 'Please select a valid file (PDF, TXT, or DOCX)'
    }

    // Max 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const uploadFile = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      setUploadError(error)
      setTimeout(() => setUploadError(null), 5000)
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', file.name)

      const response = await fetch('/api/rag/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadSuccess(`Successfully uploaded ${file.name} (${data.data.chunksStored} chunks)`)
        setTimeout(() => setUploadSuccess(null), 5000)
        loadDocuments()
      } else {
        setUploadError(data.error || 'Failed to upload document')
        setTimeout(() => setUploadError(null), 5000)
      }
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload document')
      setTimeout(() => setUploadError(null), 5000)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDeleteDocument = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/rag/documents?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        loadDocuments()
      } else {
        alert(`Failed to delete document: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Error deleting document: ${error.message}`)
    }
  }

  const handleQuery = async () => {
    if (!query.trim()) return

    setIsQuerying(true)
    setQueryError(null)
    setQueryResult(null)

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          topK: 5,
          minSimilarity: 0.5,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setQueryResult(data.data)
      } else {
        setQueryError(data.error || 'Failed to query knowledge base')
      }
    } catch (error: any) {
      setQueryError(error.message || 'Failed to query knowledge base')
    } finally {
      setIsQuerying(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuery()
    }
  }

  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
        <p className="text-gray-600">Upload documents and ask questions using RAG</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left Column - Upload & Documents */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
            </CardHeader>
            <CardBody>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div
                ref={dropZoneRef}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <div className="text-5xl mb-3">📄</div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-gray-500">
                  Supports: PDF, TXT, DOCX (max 10MB)
                </p>
              </div>

              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {uploadSuccess}
                </div>
              )}

              {isUploading && (
                <div className="mt-3 flex items-center justify-center text-blue-600">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Processing document...</span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <span className="text-sm text-gray-500">{documents.length} files</span>
              </div>
            </CardHeader>
            <CardBody className="max-h-96 overflow-y-auto">
              {isLoadingDocs ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Loading documents...</span>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No documents uploaded yet</p>
                  <p className="text-xs mt-1">Upload a document to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">
                          {doc.fileName.endsWith('.pdf') ? '📕' : doc.fileName.endsWith('.docx') ? '📘' : '📄'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.fileName)}
                        className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        title="Delete document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Query Interface */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Ask Knowledge Base</h3>
            </CardHeader>
            <CardBody className="flex-1 flex flex-col">
              {/* Query Input */}
              <div className="mb-4">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your documents... (Shift+Enter for new line)"
                  rows={3}
                  disabled={isQuerying || documents.length === 0}
                  className="w-full"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {documents.length === 0 ? 'Upload documents to start asking questions' : 'Press Enter to search'}
                  </p>
                  <Button
                    onClick={handleQuery}
                    disabled={isQuerying || !query.trim() || documents.length === 0}
                    isLoading={isQuerying}
                    size="sm"
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Query Error */}
              {queryError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {queryError}
                </div>
              )}

              {/* Query Results */}
              <div className="flex-1 overflow-y-auto">
                {queryResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Query:</p>
                      <p className="text-sm text-blue-800">{queryResult.query}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Found {queryResult.count} relevant {queryResult.count === 1 ? 'result' : 'results'}
                      </p>
                    </div>

                    {queryResult.chunks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No relevant information found</p>
                        <p className="text-xs mt-1">Try rephrasing your question</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {queryResult.chunks.map((chunk, index) => (
                          <div
                            key={index}
                            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {chunk.fileName.endsWith('.pdf') ? '📕' : chunk.fileName.endsWith('.docx') ? '📘' : '📄'}
                                </span>
                                <p className="text-xs font-medium text-gray-700">{chunk.fileName}</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {Math.round(chunk.similarity * 100)}% match
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {chunk.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm">Ask a question to search your documents</p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
