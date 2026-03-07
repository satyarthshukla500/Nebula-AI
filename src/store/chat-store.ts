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

// Session list item from API
interface SessionListItem {
  sessionId: string
  title: string
  workspace: string
  createdAt: Date | string
  messageCount: number
}

interface ChatState {
  conversations: WorkspaceConversations
  isLoading: boolean
  currentWorkspace: string | null
  
  // NEW: Session management
  currentSessionId: string | null
  chatHistory: SessionListItem[]
  
  // Get messages for current workspace
  getMessages: () => Message[]
  getSessionId: () => string | null
  
  // Workspace management
  setWorkspace: (workspace: string) => void
  initializeWorkspace: (workspace: string) => void
  
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
      
      // NEW: Session management state
      currentSessionId: null,
      chatHistory: [],
      
      // Get messages for current workspace
      getMessages: () => {
        const { conversations, currentWorkspace } = get()
        if (!currentWorkspace || !conversations[currentWorkspace]) {
          return []
        }
        return conversations[currentWorkspace].messages
      },
      
      getSessionId: () => {
        const { conversations, currentWorkspace } = get()
        if (!currentWorkspace || !conversations[currentWorkspace]) {
          return null
        }
        return conversations[currentWorkspace].sessionId
      },
      
      // Set current workspace and initialize if needed
      setWorkspace: (workspace) => {
        set({ currentWorkspace: workspace })
        get().initializeWorkspace(workspace)
      },
      
      // Initialize workspace if it doesn't exist
      initializeWorkspace: (workspace) => {
        const { conversations } = get()
        if (!conversations[workspace]) {
          set({
            conversations: {
              ...conversations,
              [workspace]: {
                messages: [],
                sessionId: null,
              },
            },
          })
        }
      },
      
      // Add message to specific workspace
      addMessage: (message, workspace) => {
        const { conversations } = get()
        const workspaceConv = conversations[workspace] || { messages: [], sessionId: null }
        
        set({
          conversations: {
            ...conversations,
            [workspace]: {
              ...workspaceConv,
              messages: [...workspaceConv.messages, message],
            },
          },
        })
      },
      
      // Set session ID for specific workspace
      setSessionId: (sessionId, workspace) => {
        const { conversations } = get()
        const workspaceConv = conversations[workspace] || { messages: [], sessionId: null }
        
        set({
          conversations: {
            ...conversations,
            [workspace]: {
              ...workspaceConv,
              sessionId,
            },
          },
        })
      },
      
      // Clear specific workspace
      clearWorkspace: (workspace) => {
        const { conversations } = get()
        set({
          conversations: {
            ...conversations,
            [workspace]: {
              messages: [],
              sessionId: null,
            },
          },
        })
      },
      
      // Clear all workspaces
      clearAllWorkspaces: () => set({ conversations: {} }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      // NEW: Load chat history from API
      loadChatHistory: async (userId) => {
        try {
          console.log('[ChatStore] Loading chat history for user:', userId)
          
          const response = await fetch(`/api/chat/session/list?userId=${userId}`)
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
            
            // Update workspace conversation
            const { conversations } = get()
            set({
              conversations: {
                ...conversations,
                [session.workspace]: {
                  messages: storeMessages,
                  sessionId: session.sessionId,
                },
              },
              currentWorkspace: session.workspace,
              currentSessionId: session.sessionId,
              isLoading: false,
            })
            
            console.log('[ChatStore] Loaded session with', storeMessages.length, 'messages')
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
          
          const response = await fetch(`/api/chat/session/${sessionId}`, {
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
              for (const [workspace, conv] of Object.entries(conversations)) {
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
          let sessionId = get().conversations[workspaceType]?.sessionId || null
          const conversationHistory = get().conversations[workspaceType]?.messages || []
          
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
            
            // Update session ID if provided (auto-created by API)
            if (data.data.sessionId && !sessionId) {
              get().setSessionId(data.data.sessionId, workspaceType)
              set({ currentSessionId: data.data.sessionId })
              console.log('[ChatStore] Session auto-created:', data.data.sessionId)
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
          const messages = get().conversations[workspaceType]?.messages || []
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
        set({ isLoading: true })
        
        // Initialize workspace if needed
        get().initializeWorkspace(workspaceType)
        
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
        
        const fileType = getFileType(file)
        const fileIcon = fileType === 'image' ? '🖼️' : fileType === 'pdf' ? '📄' : '📊'
        
        // Add user message with file indicator
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content: content || `${fileIcon} ${file.name}`,
          timestamp: new Date(),
        }
        get().addMessage(userMessage, workspaceType)
        
        try {
          // Step 1: Upload file to S3
          const timestamp = Date.now()
          const fileExtension = file.name.split('.').pop()
          const s3FileName = `${fileType}-${timestamp}.${fileExtension}`
          
          // Get presigned URL
          const presignedResponse = await fetch('/api/upload/presigned-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: s3FileName,
              fileType: file.type,
              workspaceType,
            }),
          })
          
          const presignedData = await presignedResponse.json()
          
          if (!presignedData.success) {
            throw new Error(presignedData.error || 'Failed to get upload URL')
          }
          
          // Upload to S3
          await fetch(presignedData.data.uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          })
          
          // Step 2: Send analysis request to Lambda
          const lambdaEndpoint = process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT || process.env.NEBULA_LAMBDA_ENDPOINT
          
          if (!lambdaEndpoint) {
            throw new Error('Lambda endpoint not configured')
          }
          
          // Build payload based on file type
          const payload = fileType === 'image' 
            ? { image: s3FileName }
            : { fileName: s3FileName, fileType }
          
          const analysisResponse = await fetch(lambdaEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          
          const analysisData = await analysisResponse.json()
          
          // Step 3: Add assistant message with file analysis
          let assistantMessage: Message
          
          if (fileType === 'image') {
            assistantMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: analysisData.ai_explanation || 'Image analysis completed',
              timestamp: new Date(),
              metadata: {
                type: 'image-analysis',
                fileName: file.name,
                fileUrl: presignedData.data.fileUrl,
                imageUrl: presignedData.data.fileUrl,
                labels: analysisData.labels || [],
                ai_explanation: analysisData.ai_explanation,
              },
            }
          } else if (fileType === 'pdf') {
            assistantMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: analysisData.ai_explanation || 'PDF analysis completed',
              timestamp: new Date(),
              metadata: {
                type: 'pdf-analysis',
                fileName: file.name,
                fileUrl: presignedData.data.fileUrl,
                summary: analysisData.summary,
                pageCount: analysisData.pageCount,
                ai_explanation: analysisData.ai_explanation,
              },
            }
          } else {
            // CSV or Excel
            assistantMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: analysisData.ai_explanation || 'Dataset analysis completed',
              timestamp: new Date(),
              metadata: {
                type: fileType === 'csv' ? 'csv-analysis' : 'excel-analysis',
                fileName: file.name,
                fileUrl: presignedData.data.fileUrl,
                insights: analysisData.insights || [],
                rowCount: analysisData.rowCount,
                columnCount: analysisData.columnCount,
                columns: analysisData.columns || [],
                ai_explanation: analysisData.ai_explanation,
              },
            }
          }
          
          get().addMessage(assistantMessage, workspaceType)
          
          set({ isLoading: false })
          return analysisData
        } catch (error: any) {
          console.error('Send file message error:', error)
          // Add error message
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${error.message || 'Failed to analyze file. Please try again.'}`,
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
