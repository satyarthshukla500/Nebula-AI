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

interface ChatState {
  conversations: WorkspaceConversations
  isLoading: boolean
  currentWorkspace: string | null
  
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
          const sessionId = get().conversations[workspaceType]?.sessionId || null
          const conversationHistory = get().conversations[workspaceType]?.messages || []
          
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
            
            // Update session ID if provided
            if (data.data.sessionId && !sessionId) {
              get().setSessionId(data.data.sessionId, workspaceType)
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
