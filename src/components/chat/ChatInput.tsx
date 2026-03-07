'use client'

import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface ChatInputProps {
  onSend: (message: string, file?: File) => void
  disabled?: boolean
  enableFileUpload?: boolean
  externalValue?: string
  onValueChange?: (value: string) => void
}

export function ChatInput({ onSend, disabled, enableFileUpload = false, externalValue, onValueChange }: ChatInputProps) {
  const [message, setMessage] = useState('')
  
  // Sync with external value when provided
  useEffect(() => {
    if (externalValue !== undefined) {
      setMessage(externalValue)
    }
  }, [externalValue])
  const [showError, setShowError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onTranscript: (text) => {
      // Append transcript to existing message
      setMessage((prev) => {
        const newText = prev ? `${prev} ${text}` : text
        return newText.trim()
      })
    },
    onError: (error) => {
      setShowError(error)
      setTimeout(() => setShowError(null), 5000)
    },
    continuous: false,
    interimResults: true,
  })

  // Update message with interim transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      // Show interim results in real-time
      setMessage((prev) => {
        // Remove previous interim transcript and add new one
        const baseMessage = prev.split(' ').slice(0, -1).join(' ')
        return baseMessage ? `${baseMessage} ${transcript}` : transcript
      })
    }
  }, [transcript, isListening])

  const handleSend = () => {
    if ((message.trim() || selectedFile) && !disabled) {
      onSend(message.trim(), selectedFile || undefined)
      setMessage('')
      onValueChange?.('')
      setSelectedFile(null)
      setFilePreview(null)
    }
  }
  
  const handleMessageChange = (value: string) => {
    setMessage(value)
    onValueChange?.(value)
  }

  const getFileType = (file: File): 'image' | 'pdf' | 'csv' | 'excel' | 'unknown' => {
    const type = file.type.toLowerCase()
    const name = file.name.toLowerCase()
    
    if (type.startsWith('image/')) return 'image'
    if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
    if (type === 'text/csv' || name.endsWith('.csv')) return 'csv'
    if (
      type === 'application/vnd.ms-excel' ||
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      name.endsWith('.xls') ||
      name.endsWith('.xlsx')
    ) return 'excel'
    
    return 'unknown'
  }

  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file)
    
    // Validate file type
    const validTypes = ['image', 'pdf', 'csv', 'excel']
    if (!validTypes.includes(fileType)) {
      return 'Please select a valid file (Image, PDF, CSV, or Excel)'
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setShowError(error)
      setTimeout(() => setShowError(null), 5000)
      return
    }

    setSelectedFile(file)

    // Create preview for images
    const fileType = getFileType(file)
    if (fileType === 'image') {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // For non-images, show file info
      setFilePreview(null)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (enableFileUpload && !disabled) {
      setIsDragging(true)
    }
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

    if (!enableFileUpload || disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const getFileIcon = (file: File) => {
    const fileType = getFileType(file)
    
    switch (fileType) {
      case 'image':
        return '🖼️'
      case 'pdf':
        return '📄'
      case 'csv':
      case 'excel':
        return '📊'
      default:
        return '📎'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div 
      ref={dropZoneRef}
      className={`border-t border-gray-200 p-4 ${isDragging ? 'bg-blue-50 border-blue-400 border-2' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {showError && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {showError}
        </div>
      )}
      
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-lg font-semibold text-blue-700">Drop file here</p>
            <p className="text-sm text-blue-600">Images, PDFs, CSV, Excel</p>
          </div>
        </div>
      )}
      
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 relative inline-block">
          {filePreview ? (
            // Image preview
            <div className="relative max-h-32 rounded-lg border-2 border-gray-300 overflow-hidden">
              <Image
                src={filePreview}
                alt="Preview"
                width={200}
                height={128}
                className="max-h-32 w-auto object-contain"
                unoptimized
              />
            </div>
          ) : (
            // Non-image file preview
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
              <span className="text-3xl">{getFileIcon(selectedFile)}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {getFileType(selectedFile).toUpperCase()}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleRemoveFile}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Remove file"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      
      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => handleMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening 
              ? "Listening... Speak now" 
              : selectedFile
              ? "Add a message (optional)..."
              : "Type your message or drag & drop a file... (Shift+Enter for new line)"
          }
          rows={3}
          disabled={disabled || isListening}
          className={`flex-1 ${isListening ? 'bg-blue-50 border-blue-300' : ''}`}
        />
        
        <div className="flex flex-col space-y-2">
          {/* File Upload Button */}
          {enableFileUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <button
                onClick={handleFileButtonClick}
                disabled={disabled || isListening}
                className={`p-3 rounded-lg transition-all ${
                  selectedFile
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Upload file (Image, PDF, CSV, Excel)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
            </>
          )}
          
          {isSupported && (
            <button
              onClick={handleMicClick}
              disabled={disabled}
              className={`p-3 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? (
                <svg
                  className="w-5 h-5"
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
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
          
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !selectedFile) || isListening}
            className="self-end"
          >
            Send
          </Button>
        </div>
      </div>
      
      {!isSupported && (
        <p className="mt-2 text-xs text-gray-500">
          Voice input is not supported in this browser. Please use Chrome or Edge.
        </p>
      )}
      
      {isListening && (
        <p className="mt-2 text-sm text-blue-600 flex items-center">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
          Recording... Click the microphone to stop
        </p>
      )}
      
      {enableFileUpload && !selectedFile && (
        <p className="mt-2 text-xs text-gray-500">
          💡 Tip: Drag & drop files here or click the upload button. Supports: Images, PDFs, CSV, Excel (max 10MB)
        </p>
      )}
    </div>
  )
}
