// Speech synthesis utilities (client-side only)
export interface SpeechSynthesisConfig {
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
  language?: string
}

export class SpeechSynthesisService {
  private synthesis: SpeechSynthesis | null = null
  private utterance: SpeechSynthesisUtterance | null = null
  private isSpeaking: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis
    }
  }

  isSupported(): boolean {
    return !!this.synthesis
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return []
    return this.synthesis.getVoices()
  }

  getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    return this.getVoices().filter(voice => 
      voice.lang.startsWith(language)
    )
  }

  speak(
    text: string,
    config?: SpeechSynthesisConfig,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): void {
    if (!this.synthesis) {
      onError?.('Speech synthesis not supported')
      return
    }

    // Cancel any ongoing speech
    this.stop()

    // Create utterance
    this.utterance = new SpeechSynthesisUtterance(text)

    // Configure utterance
    if (config?.voice) {
      this.utterance.voice = config.voice
    }
    if (config?.rate) {
      this.utterance.rate = config.rate
    }
    if (config?.pitch) {
      this.utterance.pitch = config.pitch
    }
    if (config?.volume) {
      this.utterance.volume = config.volume
    }
    if (config?.language) {
      this.utterance.lang = config.language
    }

    // Event handlers
    this.utterance.onend = () => {
      this.isSpeaking = false
      onEnd?.()
    }

    this.utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      this.isSpeaking = false
      onError?.(event.error)
    }

    // Speak
    try {
      this.synthesis.speak(this.utterance)
      this.isSpeaking = true
    } catch (error) {
      console.error('Failed to speak:', error)
      onError?.('Failed to start speech synthesis')
    }
  }

  pause(): void {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause()
    }
  }

  resume(): void {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.resume()
    }
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.isSpeaking = false
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking
  }

  isPaused(): boolean {
    return this.synthesis?.paused ?? false
  }
}
