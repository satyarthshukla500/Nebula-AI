'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import type { Message } from '@/types'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

interface MessageBubbleProps {
  message: Message
}

interface FileAnalysisMetadata {
  type?: 'image-analysis' | 'pdf-analysis' | 'csv-analysis' | 'excel-analysis'
  fileName?: string
  fileUrl?: string
  fileType?: 'image' | 'pdf' | 'csv' | 'excel'
  
  // Image analysis
  image?: string
  imageUrl?: string
  labels?: string[]
  
  // PDF analysis
  summary?: string
  pageCount?: number
  
  // CSV/Excel analysis
  insights?: string[]
  rowCount?: number
  columnCount?: number
  columns?: string[]
  
  // Common
  ai_explanation?: string
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [showError, setShowError] = useState<string | null>(null)
  const metadata = message.metadata as FileAnalysisMetadata | undefined
  const isFileAnalysis = metadata?.type && ['image-analysis', 'pdf-analysis', 'csv-analysis', 'excel-analysis'].includes(metadata.type)

  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
  } = useSpeechSynthesis({
    onError: (error) => {
      setShowError(error)
      setTimeout(() => setShowError(null), 3000)
    },
  })

  const handleSpeak = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      speak(message.content)
    }
  }

  const handleStop = () => {
    stop()
  }

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        )}
      >
        {/* File Analysis Response */}
        {isFileAnalysis && metadata && (
          <div className="space-y-3">
            {/* Image Analysis */}
            {metadata.type === 'image-analysis' && (
              <>
                {metadata.imageUrl && (
                  <div className="rounded-lg overflow-hidden border-2 border-gray-300 relative w-full max-w-md">
                    <Image
                      src={metadata.imageUrl}
                      alt={metadata.image || 'Uploaded image'}
                      width={400}
                      height={300}
                      className="w-full h-auto object-contain"
                      unoptimized
                    />
                  </div>
                )}
                
                {metadata.labels && metadata.labels.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Detected Labels:</p>
                    <div className="flex flex-wrap gap-2">
                      {metadata.labels.map((label, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* PDF Analysis */}
            {metadata.type === 'pdf-analysis' && (
              <>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-300">
                  <span className="text-3xl">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metadata.fileName}</p>
                    {metadata.pageCount && (
                      <p className="text-xs text-gray-500">{metadata.pageCount} pages</p>
                    )}
                  </div>
                </div>
                
                {metadata.summary && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Document Summary:</p>
                    <p className="text-sm whitespace-pre-wrap bg-white p-2 rounded border border-gray-200">
                      {metadata.summary}
                    </p>
                  </div>
                )}
              </>
            )}
            
            {/* CSV/Excel Analysis */}
            {(metadata.type === 'csv-analysis' || metadata.type === 'excel-analysis') && (
              <>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-300">
                  <span className="text-3xl">📊</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metadata.fileName}</p>
                    {metadata.rowCount && metadata.columnCount && (
                      <p className="text-xs text-gray-500">
                        {metadata.rowCount} rows × {metadata.columnCount} columns
                      </p>
                    )}
                  </div>
                </div>
                
                {metadata.columns && metadata.columns.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Columns:</p>
                    <div className="flex flex-wrap gap-2">
                      {metadata.columns.map((column, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {column}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {metadata.insights && metadata.insights.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Dataset Insights:</p>
                    <ul className="space-y-1 bg-white p-3 rounded border border-gray-200">
                      {metadata.insights.map((insight, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            {/* AI Explanation (Common for all types) */}
            {metadata.ai_explanation && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">AI Analysis:</p>
                <p className="text-sm whitespace-pre-wrap">{metadata.ai_explanation}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Regular Message */}
        {!isFileAnalysis && (
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm whitespace-pre-wrap flex-1">{message.content}</p>
            
            {/* Text-to-Speech Controls (only for assistant messages) */}
            {!isUser && isSupported && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleSpeak}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title={
                    isSpeaking
                      ? isPaused
                        ? 'Resume'
                        : 'Pause'
                      : 'Read aloud'
                  }
                >
                  {isSpeaking ? (
                    isPaused ? (
                      // Play icon (resume)
                      <svg
                        className="w-4 h-4 text-gray-700"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      // Pause icon
                      <svg
                        className="w-4 h-4 text-blue-600 animate-pulse"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )
                  ) : (
                    // Speaker icon
                    <svg
                      className="w-4 h-4 text-gray-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                
                {/* Stop button (only show when speaking) */}
                {isSpeaking && (
                  <button
                    onClick={handleStop}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Stop"
                  >
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Error message */}
        {showError && (
          <p className="text-xs mt-1 text-red-600 bg-red-50 px-2 py-1 rounded">
            {showError}
          </p>
        )}
        
        {/* Timestamp */}
        {message.timestamp && (
          <p className={cn('text-xs mt-1', isUser ? 'text-blue-100' : 'text-gray-500')}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}
