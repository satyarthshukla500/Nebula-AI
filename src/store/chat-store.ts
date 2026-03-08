// Chat state management with workspace-specific conversations
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message, WorkspaceType } from '@/types'

interface WorkspaceConversation {
  messages: Message[]
  sessionId: string | null
}

interface WorkspaceConversations {
  [workspaceType: string]: WorkspaceConversation
}

// User-scoped conversations
interface UserConversations {
  [userId: string]: WorkspaceConversations
}

// Session list item from API
interface SessionListItem {
  sessionId: string
  title: string
  workspace: string
  createdAt: Date | string
  messageCount: number
}

interface ChatState {
  conversations: UserConversations
  isLoading: boolean
  currentWorkspace: string | null
  currentUserId: string | null
  
  // NEW: Session management
  currentSessionId: string | null
  chatHistory: SessionListItem[]
  
  // Get messages for current workspace
  getMessages: () => Message[]
  getSessionId: () => string | null
  
  // Workspace management
  setWorkspace: (workspace: string) => void
  initializeWorkspace: (workspace: string) => void
  
  // User management
  setCurrentUser: (userId: string) => void
  clearAllMessages: () => void
  
  // Message management
  addMessage: (message: Message, workspace: string) => void
  setSessionId: (sessionId: string, workspace: string) => void
  clearWorkspace: (workspace: string) => void
  clearAllWorkspaces: () => void
  
  // Loading state
  setLoading: (loading: boolean) => void
  
  // NEW: Session management methods
  loadChatHistory: (userId: string) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  createSession: (userId: string, workspace: string, firstMessage?: string) => Promise<string>
  deleteSession: (sessionId: string) => Promise<void>
  
  // Send message
  sendMessage: (content: string, workspaceType: string) => Promise<any>
  sendFileMessage: (content: string, file: File, workspaceType: string) => Promise<any>
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: {},
      isLoading: false,
      currentWorkspace: null,
      currentUserId: null,
      
      // NEW: Session management state
      currentSessionId: null,
      chatHistory: [],
      
      // Get messages for current workspace and user
      getMessages: () => {
        const { conversations, currentWorkspace, currentUserId } = get()
        if (!currentWorkspace || !currentUserId || !conversations[currentUserId]) {
          return []
        }
        const userConversations = conversations[currentUserId]
        if (!userConversations[currentWorkspace]) {
          return []
        }
        return userConversations[currentWorkspace].messages
      },
      
      getSessionId: () => {
        const { conversations, currentWorkspace, currentUserId } = get()
        if (!currentWorkspace || !currentUserId || !conversations[currentUserId]) {
          return null
        }
        const userConversations = conversations[currentUserId]
        if (!userConversations[currentWorkspace]) {
          return null
        }
        return userConversations[currentWorkspace].sessionId
      },
      
      // Set current workspace and initialize if needed
      setWorkspace: (workspace) => {
        set({ currentWorkspace: workspace })
        get().initializeWorkspace(workspace)
      },
      
      // Set current user and clear messages if user changed
      setCurrentUser: (userId) => {
        const { currentUserId } = get()
        if (currentUserId !== userId) {
          // User changed - clear current session
          set({ 
            currentUserId: userId,
            currentSessionId: null,
            chatHistory: []
          })
        }
      },
      
      // Clear all messages (for logout or user switch)
      clearAllMessages: () => {
        set({ 
          conversations: {},
          currentSessionId: null,
          chatHistory: []
        })
      },
      
      // Initialize workspace if it doesn't exist
      initializeWorkspace: (workspace) => {
        const { conversations, currentUserId } = get()
        if (!currentUserId) return
        
        const userConversations = conversations[currentUserId] || {}
        if (!userConversations[workspace]) {
          set({
            conversations: {
              ...conversations,
              [currentUserId]: {
                ...userConversations,
                [workspace]: {
                  messages: [],
                  sessionId: null,
                },
              },
            },
          })
        }
      },
      
      // Add message to specific workspace for current user
      addMessage: (message, workspace) => {
        const { conversations, currentUserId } = get()
        if (!currentUserId) return
        
        const userConversations = conversations[currentUserId] || {}
        const workspaceConv = userConversations[workspace] || { messages: [], sessionId: null }
        
        set({
          conversations: {
            ...conversations,
            [currentUserId]: {
              ...userConversations,
              [workspace]: {
                ...workspaceConv,
                messages: [...workspaceConv.messages, message],
              },
            },
          },
        })
      },
      
      // Set session ID for specific workspace for current user
      setSessionId: (sessionId, workspace) => {
        const { conversations, currentUserId } = get()
        if (!currentUserId) return
        
        const userConversations = conversations[currentUserId] || {}
        const workspaceConv = userConversations[workspace] || { messages: [], sessionId: null }
        
        set({
          conversations: {
            ...conversations,
            [currentUserId]: {
              ...userConversations,
              [workspace]: {
                ...workspaceConv,
                sessionId,
              },
            },
          },
        })
      },
      
      // Clear specific workspace for current user
      clearWorkspace: (workspace) => {
        const { conversations, currentUserId } = get()
        if (!currentUserId) return
        
        const userConversations = conversations[currentUserId] || {}
        set({
          conversations: {
            ...conversations,
            [currentUserId]: {
              ...userConversations,
              [workspace]: {
                messages: [],
                sessionId: null,
              },
            },
          },
        })
      },
      
      // Clear all workspaces for current user
      clearAllWorkspaces: () => {
        const { currentUserId } = get()
        if (!currentUserId) return
        
        const { conversations } = get()
        set({
          conversations: {
            ...conversations,
            [currentUserId]: {},
          },
        })
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      // NEW: Load chat history from API
      loadChatHistory: async (userId) => {
        // Validate userId before making request
        if (!userId || userId === 'undefined' || userId === 'null') {
          console.warn('[ChatStore] Invalid userId, skipping chat history load')
          set({ chatHistory: [] })
          return
        }
        
        try {
          console.log('[ChatStore] Loading chat history for user:', userId)
          
          const response = await fetch(`/api/chat/session/list?userId=${encodeURIComponent(userId)}`)
          const data = await response.json()
          
          if (data.success && data.data?.sessions) {
            set({ chatHistory: data.data.sessions })
            console.log('[ChatStore] Loaded', data.data.sessions.length, 'sessions')
          } else {
            console.error('[ChatStore] Failed to load chat history:', data.error)
            set({ chatHistory: [] })
          }
        } catch (error: any) {
          console.error('[ChatStore] Error loading chat history:', error.message)
          set({ chatHistory: [] })
        }
      },
      
      // NEW: Load specific session from API
      loadSession: async (sessionId) => {
        try {
          console.log('[ChatStore] Loading session:', sessionId)
          set({ isLoading: true })
          
          const response = await fetch(`/api/chat/session/${sessionId}`)
          const data = await response.json()
          
          if (data.success && data.data) {
            const session = data.data.session
            const messages = data.data.messages
            
            // Convert API messages to store format
            const storeMessages: Message[] = messages.map((msg: any) => ({
              id: msg.messageId || crypto.randomUUID(),
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
            }))
            
            // Update workspace conversation for current user
            const { conversations, currentUserId } = get()
            if (!currentUserId) {
              console.error('[ChatStore] No current user - cannot load session')
              set({ isLoading: false })
              return
            }
            
            const userConversations = conversations[currentUserId] || {}
            set({
              conversations: {
                ...conversations,
                [currentUserId]: {
                  ...userConversations,
                  [session.workspace]: {
                    messages: storeMessages,
                    sessionId: session.sessionId,
                  },
                },
              },
              currentWorkspace: session.workspace,
              currentSessionId: session.sessionId,
              isLoading: false,
            })
            
            console.log('[ChatStore] Loaded session with', storeMessages.length, 'messages for workspace:', session.workspace)
          } else {
            console.error('[ChatStore] Failed to load session:', data.error)
            set({ isLoading: false })
          }
        } catch (error: any) {
          console.error('[ChatStore] Error loading session:', error.message)
          set({ isLoading: false })
        }
      },
      
      // NEW: Create new session via API
      createSession: async (userId, workspace, firstMessage) => {
        try {
          console.log('[ChatStore] Creating session:', { userId, workspace, firstMessage })
          
          const response = await fetch('/api/chat/session/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              workspace,
              firstMessage,
            }),
          })
          
          const data = await response.json()
          
          if (data.success && data.data?.sessionId) {
            const sessionId = data.data.sessionId
            
            // Update current session ID
            set({ currentSessionId: sessionId })
            
            // Update workspace session ID
            get().setSessionId(sessionId, workspace)
            
            console.log('[ChatStore] Created session:', sessionId)
            return sessionId
          } else {
            console.error('[ChatStore] Failed to create session:', data.error)
            throw new Error(data.error || 'Failed to create session')
          }
        } catch (error: any) {
          console.error('[ChatStore] Error creating session:', error.message)
          throw error
        }
      },
      
      // NEW: Delete session via API
      deleteSession: async (sessionId) => {
        try {
          console.log('[ChatStore] Deleting session:', sessionId)
          
          // Get current userId
          const { currentUserId } = get()
          if (!currentUserId) {
            console.warn('[ChatStore] No userId, cannot delete session')
            throw new Error('No user logged in')
          }
          
          const response = await fetch(`/api/chat/session/${sessionId}?userId=${encodeURIComponent(currentUserId)}`, {
            method: 'DELETE',
          })
          
          const data = await response.json()
          
          if (data.success) {
            // Remove from chat history
            const { chatHistory } = get()
            set({
              chatHistory: chatHistory.filter(s => s.sessionId !== sessionId),
            })
            
            // Clear workspace if it's the current session
            const { conversations, currentSessionId } = get()
            if (currentSessionId === sessionId) {
              // Find and clear the workspace with this session
              const userConversations = conversations[currentUserId] || {}
              for (const [workspace, conv] of Object.entries(userConversations)) {
                if (conv.sessionId === sessionId) {
                  get().clearWorkspace(workspace)
                  break
                }
              }
              set({ currentSessionId: null })
            }
            
            console.log('[ChatStore] Deleted session:', sessionId)
          } else {
            console.error('[ChatStore] Failed to delete session:', data.error)
            throw new Error(data.error || 'Failed to delete session')
          }
        } catch (error: any) {
          console.error('[ChatStore] Error deleting session:', error.message)
          throw error
        }
      },
      
      // Send message to specific workspace
      sendMessage: async (content, workspaceType) => {
        const { currentUserId } = get()
        if (!currentUserId) {
          throw new Error('No user logged in')
        }
        
        set({ isLoading: true })
        
        // Initialize workspace if needed
        get().initializeWorkspace(workspaceType)
        
        // Add user message
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          timestamp: new Date(),
        }
        get().addMessage(userMessage, workspaceType)
        
        try {
          const userConversations = get().conversations[currentUserId] || {}
          let sessionId = userConversations[workspaceType]?.sessionId || null
          const conversationHistory = userConversations[workspaceType]?.messages || []
          
          // AUTO-CREATE SESSION: If no session exists and this is the first message, create one
          if (!sessionId && conversationHistory.length === 1) {
            try {
              // Try to get userId from somewhere (you may need to adjust this based on your auth setup)
              // For now, we'll let the API handle session creation
              console.log('[ChatStore] First message - session will be auto-created by API')
            } catch (error) {
              console.warn('[ChatStore] Could not auto-create session:', error)
              // Continue anyway - API will handle it
            }
          }
          
          const response = await fetch('/api/workspaces/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content,
              sessionId,
              conversationHistory,
              workspaceType,
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
            get().addMessage(assistantMessage, workspaceType)
            
            // ALWAYS update session ID if provided by API
            if (data.data.sessionId) {
              get().setSessionId(data.data.sessionId, workspaceType)
              set({ currentSessionId: data.data.sessionId })
              if (!sessionId) {
                console.log('[ChatStore] Session auto-created:', data.data.sessionId)
              }
            }
            
            set({ isLoading: false })
            return data.data
          } else {
            // Add error message as assistant response
            const errorMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Error: ${data.error || 'Failed to get response'}`,
              timestamp: new Date(),
            }
            get().addMessage(errorMessage, workspaceType)
            set({ isLoading: false })
            throw new Error(data.error)
          }
        } catch (error: any) {
          console.error('Send message error:', error)
          // Add error message if not already added
          const { currentUserId } = get()
          if (!currentUserId) return
          
          const userConversations = get().conversations[currentUserId] || {}
          const messages = userConversations[workspaceType]?.messages || []
          const lastMessage = messages[messages.length - 1]
          if (lastMessage?.role !== 'assistant') {
            const errorMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Error: ${error.message || 'Failed to send message. Please try again.'}`,
              timestamp: new Date(),
            }
            get().addMessage(errorMessage, workspaceType)
          }
          set({ isLoading: false })
          throw error
        }
      },
      
      // Send file message to specific workspace (supports images, PDFs, CSV, Excel)
      sendFileMessage: async (content, file, workspaceType) => {
        const { currentUserId } = get()
        if (!currentUserId) {
          throw new Error('No user logged in')
        }
        
        set({ isLoading: true })
        
        // CRITICAL: Set current workspace FIRST
        console.log('[sendFileMessage] Setting workspace to:', workspaceType)
        set({ currentWorkspace: workspaceType })
        
        // Initialize workspace if needed
        get().initializeWorkspace(workspaceType)
        
        // Validate file exists
        if (!file) {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Unable to process file. Please try again.',
            timestamp: new Date(),
          }
          get().addMessage(errorMessage, workspaceType)
          set({ isLoading: false })
          throw new Error('No file provided')
        }
        
        // Determine file type
        const getFileType = (file: File): 'image' | 'pdf' | 'csv' | 'excel' => {
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
          
          return 'image' // fallback
        }
        
        // Convert file to base64
        const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1]) // Remove data:image/jpeg;base64, prefix
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        const fileType = getFileType(file)
        const fileIcon = fileType === 'image' ? '🖼️' : fileType === 'pdf' ? '📄' : '📊'
        
        // Use default prompt if content is empty
        const userContent = content || (fileType === 'image' ? 'Describe what you see in this image.' : `Describe this ${fileType}`)
        
        // Add user message with file indicator
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content: userContent || `${fileIcon} ${file.name}`,
          timestamp: new Date(),
        }
        get().addMessage(userMessage, workspaceType)
        
        try {
          // Convert file to base64
          console.log('[ChatStore] Converting file to base64...')
          const base64Data = await toBase64(file)
          console.log('[ChatStore] File converted to base64 successfully')
          
          // DEBUG LOGS
          console.log('FILE DETAILS:', { name: file.name, type: file.type, size: file.size })
          console.log('BASE64 LENGTH:', base64Data?.length)
          console.log('SENDING TO API WITH CONTENT TYPE:', typeof userContent)
          
          // Get session ID
          const userConversations = get().conversations[currentUserId] || {}
          let sessionId = userConversations[workspaceType]?.sessionId || null
          const conversationHistory = userConversations[workspaceType]?.messages || []
          
          // Send to AI API with base64 content
          const response = await fetch('/api/workspaces/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userContent,
              fileData: {
                type: fileType,
                mimeType: file.type,
                base64: base64Data,
                fileName: file.name,
              },
              sessionId,
              conversationHistory,
              workspaceType,
            }),
          })
          
          const data = await response.json()
          
          console.log('FRONTEND RECEIVED:', JSON.stringify(data))
          console.log('MESSAGE CONTENT:', data?.data?.message || data?.message || data?.content)
          
          console.log('[ChatStore] FILE UPLOAD API Response received:', {
            success: data.success,
            hasMessage: !!data.data?.message,
            messageLength: data.data?.message?.length,
            messagePreview: data.data?.message?.substring(0, 100),
            dataKeys: data.data ? Object.keys(data.data) : [],
          })
          
          if (data.success) {
            // Guard against null/undefined message content
            const content = data?.data?.message || ''
            
            if (!content) {
              console.error('[ChatStore] Received empty message content from API')
              throw new Error('Empty response from AI')
            }
            
            // Add assistant message
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: content,
              timestamp: new Date(),
              metadata: data.data.metadata,
            }
            
            get().addMessage(assistantMessage, workspaceType)
            
            // ALWAYS update session ID if provided by API
            if (data.data.sessionId) {
              get().setSessionId(data.data.sessionId, workspaceType)
              set({ currentSessionId: data.data.sessionId })
              if (!sessionId) {
                console.log('[ChatStore] Session auto-created:', data.data.sessionId)
              }
            }
            
            set({ isLoading: false })
            return data.data
          } else {
            throw new Error(data.error || 'Failed to process file')
          }
        } catch (error: any) {
          console.error('UPLOAD ERROR FULL DETAILS:', error)
          console.error('UPLOAD ERROR MESSAGE:', (error as any)?.message)
          console.error('UPLOAD ERROR STACK:', (error as any)?.stack)
          console.error('[ChatStore] Send file message error:', error)
          // Add user-friendly error message
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Unable to process file. Please try again.',
            timestamp: new Date(),
          }
          get().addMessage(errorMessage, workspaceType)
          set({ isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'nebula-chat-storage',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
)
