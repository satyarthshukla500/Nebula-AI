'use client'

import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

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
  
  // Microphone state
  const [isListening, setIsListening] = useState(false)
  const [micError, setMicError] = useState('')
  const recognitionRef = useRef<any>(null)

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
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMicError('Microphone not supported in this browser. Use Chrome.')
      return
    }

    // Stop if already listening
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    // Start speech recognition
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setMicError('')
      console.log('[Mic] Started listening')
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
      
      console.log('[Mic] Transcript:', transcript)
      setMessage(transcript)
      onValueChange?.(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('[Mic] Error:', event.error)
      setIsListening(false)
      
      if (event.error === 'not-allowed') {
        setMicError('Microphone access denied. Allow mic in browser settings.')
      } else if (event.error === 'network') {
        setMicError('Please use Google Chrome for voice input. Edge has limited support on localhost.')
      } else if (event.error === 'no-speech') {
        setMicError('No speech detected. Please try again.')
      } else {
        setMicError('Mic error: ' + event.error)
      }
    }

    recognition.onend = () => {
      console.log('[Mic] Stopped listening')
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('[Mic] Start error:', error)
      setMicError('Failed to start microphone')
      setIsListening(false)
    }
  }

  // Check if speech recognition is supported
  const isSupported = typeof window !== 'undefined' && (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window))

  return (
    <div 
      ref={dropZoneRef}
      className={`p-4 backdrop-blur-md ${isDragging ? 'border-2' : 'border-t'}`}
      style={{
        backgroundColor: 'rgba(var(--color-surface-rgb, 26, 26, 46), 0.9)',
        borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-border)',
        width: '100%',
        flexShrink: 0,
      }}
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
      
      {/* Listening Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
          <span className="text-red-600 text-sm font-medium">Listening... speak now</span>
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
      
      <div 
        className="flex items-end gap-1.5"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '12px 16px'
        }}
      >
        <div className="flex-1 relative">
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
            disabled={disabled || isListening}
            className={`w-full transition-all duration-200 resize-none ${isListening ? 'border-blue-300' : ''}`}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              boxShadow: 'none',
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
        </div>
        
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
              className={`rounded-lg transition-all flex-shrink-0 w-[34px] h-[34px] flex items-center justify-center ${
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
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            suppressHydrationWarning={true}
            className={`rounded-lg transition-all flex-shrink-0 w-[34px] h-[34px] flex items-center justify-center text-xl ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-gray-100 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? 'Stop recording' : 'Start voice input'}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
        )}
        
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !selectedFile) || isListening}
          className="flex-shrink-0 w-[36px] h-[36px] flex items-center justify-center p-0"
        >
          ➤
        </Button>
      </div>
      
      {!isSupported && (
        <p className="mt-2 text-xs text-gray-500">
          Voice input is not supported in this browser. Please use Chrome or Edge.
        </p>
      )}
      
      {micError && (
        <p className="text-red-500 text-xs mt-2 px-2">
          {micError}
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
