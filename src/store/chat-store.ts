// Chat state management
import { create } from 'zustand'
import { Message, WorkspaceType } from '@/types'

interface ChatState {
  messages: Message[]
  isLoading: boolean
  currentWorkspace: WorkspaceType | null
  sessionId: string | null
  
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  setWorkspace: (workspace: WorkspaceType) => void
  setSessionId: (sessionId: string) => void
  clearMessages: () => void
  sendMessage: (content: string, workspaceType: string, sessionId: string | null) => Promise<any>
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  currentWorkspace: null,
  sessionId: null,
  
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setWorkspace: (currentWorkspace) => set({ currentWorkspace }),
  setSessionId: (sessionId) => set({ sessionId }),
  clearMessages: () => set({ messages: [], sessionId: null }),
  
  sendMessage: async (content, workspaceType, sessionId) => {
    set({ isLoading: true })
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    get().addMessage(userMessage)
    
    try {
      const response = await fetch('/api/workspaces/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId,
          conversationHistory: get().messages,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Add assistant message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date(),
        }
        get().addMessage(assistantMessage)
        set({ isLoading: false })
        return data.data
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
}))
