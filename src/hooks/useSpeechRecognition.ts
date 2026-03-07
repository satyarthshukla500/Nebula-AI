'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

export interface UseSpeechRecognitionOptions {
  onTranscript?: (transcript: string) => void
  onError?: (error: string) => void
  continuous?: boolean
  interimResults?: boolean
  lang?: string
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    onTranscript,
    onError,
    continuous = false,
    interimResults = true,
    lang = 'en-US',
  } = options

  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = lang

      recognition.onstart = () => {
        setIsListening(true)
        console.log('[Speech] Recognition started')
      }

      recognition.onend = () => {
        setIsListening(false)
        console.log('[Speech] Recognition ended')
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('[Speech] Recognition error:', event.error)
        setIsListening(false)
        
        let errorMessage = 'Speech recognition error'
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection.'
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }
        
        if (onError) {
          onError(errorMessage)
        }
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcriptText = result[0].transcript

          if (result.isFinal) {
            finalTranscript += transcriptText + ' '
          } else {
            interimTranscript += transcriptText
          }
        }

        const fullTranscript = finalTranscript || interimTranscript
        setTranscript(fullTranscript.trim())

        if (onTranscript && finalTranscript) {
          onTranscript(finalTranscript.trim())
        }

        console.log('[Speech] Transcript:', fullTranscript.trim())
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [continuous, interimResults, lang, onTranscript, onError])

  const startListening = useCallback(() => {
    if (!isSupported) {
      const error = 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      console.error('[Speech]', error)
      if (onError) {
        onError(error)
      }
      return
    }

    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('')
        recognitionRef.current.start()
      } catch (error) {
        console.error('[Speech] Failed to start recognition:', error)
        if (onError) {
          onError('Failed to start speech recognition')
        }
      }
    }
  }, [isSupported, isListening, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      setIsListening(false)
      setTranscript('')
    }
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    abortListening,
  }
}
