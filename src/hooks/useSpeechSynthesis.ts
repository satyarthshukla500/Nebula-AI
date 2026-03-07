'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseSpeechSynthesisOptions {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  voice?: SpeechSynthesisVoice | null
  rate?: number
  pitch?: number
  volume?: number
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const {
    onStart,
    onEnd,
    onError,
    voice = null,
    rate = 1,
    pitch = 1,
    volume = 1,
  } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Check browser support and load voices
  useEffect(() => {
    const synth = window.speechSynthesis
    setIsSupported(!!synth)

    if (synth) {
      // Load voices
      const loadVoices = () => {
        const availableVoices = synth.getVoices()
        setVoices(availableVoices)
        console.log('[TTS] Loaded voices:', availableVoices.length)
      }

      loadVoices()
      
      // Chrome loads voices asynchronously
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices
      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      const error = 'Text-to-speech is not supported in this browser.'
      console.error('[TTS]', error)
      if (onError) {
        onError(error)
      }
      return
    }

    const synth = window.speechSynthesis

    // Cancel any ongoing speech
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set voice
    if (voice) {
      utterance.voice = voice
    } else if (voices.length > 0) {
      // Try to find an English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en'))
      if (englishVoice) {
        utterance.voice = englishVoice
      }
    }

    // Set speech parameters
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // Event handlers
    utterance.onstart = () => {
      console.log('[TTS] Speech started')
      setIsSpeaking(true)
      setIsPaused(false)
      if (onStart) {
        onStart()
      }
    }

    utterance.onend = () => {
      console.log('[TTS] Speech ended')
      setIsSpeaking(false)
      setIsPaused(false)
      if (onEnd) {
        onEnd()
      }
    }

    utterance.onerror = (event) => {
      console.error('[TTS] Speech error:', event.error)
      setIsSpeaking(false)
      setIsPaused(false)
      
      let errorMessage = 'Text-to-speech error'
      switch (event.error) {
        case 'canceled':
          errorMessage = 'Speech was cancelled'
          break
        case 'interrupted':
          errorMessage = 'Speech was interrupted'
          break
        case 'audio-busy':
          errorMessage = 'Audio system is busy'
          break
        case 'not-allowed':
          errorMessage = 'Text-to-speech not allowed'
          break
        case 'network':
          errorMessage = 'Network error during speech'
          break
        default:
          errorMessage = `Speech error: ${event.error}`
      }
      
      if (onError) {
        onError(errorMessage)
      }
    }

    utteranceRef.current = utterance
    synth.speak(utterance)
  }, [isSupported, voice, voices, rate, pitch, volume, onStart, onEnd, onError])

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      console.log('[TTS] Speech paused')
    }
  }, [isSpeaking, isPaused])

  const resume = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      console.log('[TTS] Speech resumed')
    }
  }, [isSpeaking, isPaused])

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
      console.log('[TTS] Speech stopped')
    }
  }, [])

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
  }
}
