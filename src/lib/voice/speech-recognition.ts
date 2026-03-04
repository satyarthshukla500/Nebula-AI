// Speech recognition utilities (client-side only)
export interface SpeechRecognitionConfig {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export class SpeechRecognitionService {
  private recognition: any
  private isListening: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition
  }

  start(
    config: SpeechRecognitionConfig,
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported')
      return
    }

    if (this.isListening) {
      return
    }

    // Configure recognition
    this.recognition.lang = config.language || 'en-US'
    this.recognition.continuous = config.continuous ?? false
    this.recognition.interimResults = config.interimResults ?? true
    this.recognition.maxAlternatives = config.maxAlternatives || 1

    // Event handlers
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript
      const confidence = result[0].confidence
      const isFinal = result.isFinal

      onResult({ transcript, confidence, isFinal })
    }

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      this.isListening = false
      onError?.(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    // Start recognition
    try {
      this.recognition.start()
      this.isListening = true
    } catch (error) {
      console.error('Failed to start recognition:', error)
      onError?.('Failed to start speech recognition')
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort()
      this.isListening = false
    }
  }

  getIsListening(): boolean {
    return this.isListening
  }
}
