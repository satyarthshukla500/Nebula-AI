'use client'

import { useRef, useState } from 'react'

interface FileUploadButtonProps {
  workspace: string
  onFileSelect: (file: File) => void
  disabled?: boolean
  className?: string
}

const ALLOWED_FILE_TYPES = ['pdf', 'txt', 'docx', 'csv', 'json', 'png', 'jpg', 'jpeg'] as const
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function FileUploadButton({ 
  workspace, 
  onFileSelect, 
  disabled = false,
  className = ''
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Get file extension
  const getFileExtension = (fileName: string): string => {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  // Validate file format
  const isValidFormat = (fileName: string): boolean => {
    const extension = getFileExtension(fileName)
    return ALLOWED_FILE_TYPES.includes(extension as any)
  }

  // Validate file size
  const isValidSize = (fileSize: number): boolean => {
    return fileSize <= MAX_FILE_SIZE
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check format
    if (!isValidFormat(file.name)) {
      return {
        valid: false,
        error: `Unsupported file format. Supported formats: ${ALLOWED_FILE_TYPES.join(', ')}`
      }
    }

    // Check size
    if (!isValidSize(file.size)) {
      return {
        valid: false,
        error: `File size exceeds 10MB limit. Your file: ${formatFileSize(file.size)}`
      }
    }

    return { valid: true }
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (!file) return

    // Clear previous error
    setError(null)

    // Validate file
    const validation = validateFile(file)
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Auto-hide error after 5 seconds
      setTimeout(() => setError(null), 5000)
      return
    }

    // Set uploading state
    setIsUploading(true)

    try {
      // Call parent handler
      await onFileSelect(file)
      
      // Clear input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle button click
  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES.map(ext => `.${ext}`).join(',')}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label="Upload file"
      />

      {/* Upload button */}
      <button
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={`
          p-3 rounded-lg transition-all
          ${isUploading 
            ? 'bg-blue-500 text-white cursor-wait' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        title={isUploading ? 'Uploading...' : 'Upload file (PDF, TXT, DOCX, CSV, JSON, PNG, JPG, JPEG)'}
        aria-label={isUploading ? 'Uploading file' : 'Upload file'}
      >
        {isUploading ? (
          // Loading spinner
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          // Upload icon
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-10">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Upload Error</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload progress indicator (shown when uploading) */}
      {isUploading && (
        <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-blue-50 border border-blue-200 rounded-lg shadow-lg z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <p className="text-xs text-blue-800 font-medium">Uploading file...</p>
          </div>
        </div>
      )}
    </div>
  )
}
