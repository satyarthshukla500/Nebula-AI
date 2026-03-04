// Voice state management
import { create } from 'zustand'
import { VoiceConfig } from '@/types'

interface VoiceState {
  config: VoiceConfig
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  
  setConfig: (config: Partial<VoiceConfig>) => void
  setListening: (listening: boolean) => void
  setSpeaking: (speaking: boolean) => void
  setTranscript: (transcript: string) => void
  clearTranscript: () => void
}

export const useVoiceStore = create<VoiceState>((set) => ({
  config: {
    enabled: false,
    language: 'en-US',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
  isListening: false,
  isSpeaking: false,
  transcript: '',
  
  setConfig: (config) => set((state) => ({ 
    config: { ...state.config, ...config } 
  })),
  setListening: (isListening) => set({ isListening }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setTranscript: (transcript) => set({ transcript }),
  clearTranscript: () => set({ transcript: '' }),
}))
