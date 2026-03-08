'use client'

import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/store/chat-store'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { PromptSuggestions } from './PromptSuggestions'
import { Card } from '@/components/ui/Card'

interface ChatContainerProps {
  workspaceType: string
  systemPrompt?: string
  enableFileUpload?: boolean
}

export function ChatContainer({ workspaceType, systemPrompt, enableFileUpload = false }: ChatContainerProps) {
  const { 
    isLoading, 
    sendMessage,
    sendFileMessage,
    setWorkspace 
  } = useChatStore()
  
  // Subscribe to messages - this will re-render when messages change
  const messages = useChatStore((state) => {
    const { conversations, currentWorkspace, currentUserId } = state
    if (!currentWorkspace || !currentUserId || !conversations[currentUserId]) {
      return []
    }
    const userConversations = conversations[currentUserId]
    if (!userConversations[currentWorkspace]) {
      return []
    }
    return userConversations[currentWorkspace].messages
  })
  
  const [inputValue, setInputValue] = useState('')
  const [showFileUploadPrompt, setShowFileUploadPrompt] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState('')
  const chatInputRef = useRef<{ setMessage: (msg: string) => void; triggerFileUpload: () => void } | null>(null)
  
  // HIBP state
  const [showHIBP, setShowHIBP] = useState(false)
  const [hibpEmail, setHibpEmail] = useState('')
  const [hibpResult, setHibpResult] = useState<any>(null)
  const [hibpLoading, setHibpLoading] = useState(false)
  
  // Scam Detector state
  const [showScamDetector, setShowScamDetector] = useState(false)
  const [scamText, setScamText] = useState('')
  
  // Crisis contact state (wellness workspace)
  const [crisisContactDetected, setCrisisContactDetected] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  
  // Client-only mounting check to prevent hydration errors
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Set workspace when component mounts or workspace changes
  useEffect(() => {
    setWorkspace(workspaceType)
  }, [workspaceType, setWorkspace])

  const handleSendMessage = async (content: string, file?: File) => {
    if (file) {
      await sendFileMessage(content, file, workspaceType)
      setShowFileUploadPrompt(false)
      setPendingPrompt('')
    } else {
      await sendMessage(content, workspaceType)
    }
  }

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt)
  }

  const handleFileUploadRequest = (prompt: string) => {
    // Check if this is HIBP request
    if (prompt === 'HIBP_CHECK') {
      setShowHIBP(true)
      setShowFileUploadPrompt(false)
      return
    }
    
    // Check if this is Scam Detector request
    if (prompt === 'SCAM_DETECTOR') {
      setShowScamDetector(true)
      setShowFileUploadPrompt(false)
      return
    }
    
    // Set the prompt and show upload instruction
    setPendingPrompt(prompt)
    setInputValue(prompt)
    setShowFileUploadPrompt(true)
  }
  
  const handleHIBPCheck = async () => {
    if (!hibpEmail || !hibpEmail.includes('@')) {
      setHibpResult({ error: 'Please enter a valid email address' })
      return
    }
    
    setHibpLoading(true)
    setHibpResult(null)
    
    try {
      const response = await fetch('/api/cyber-safety/hibp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: hibpEmail })
      })
      
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('[HIBP] Response JSON parse error:', parseError)
        setHibpResult({ error: 'Failed to parse response. Please try again.' })
        return
      }
      
      setHibpResult(data)
      
      // If breaches found, send to AI for recovery plan
      if (data.breached && data.breaches) {
        const breachNames = data.breaches.map((b: any) => b.name).join(', ')
        const recoveryPrompt = `The user's email was found in ${data.count} data breaches including: ${breachNames}. Generate a personalized Recovery Plan with:

1. Which passwords to change first (prioritized by breach severity)
2. How to enable 2FA on each affected service
3. What specific data was exposed and risks
4. Step by step action checklist

Be specific, actionable, and reassuring.`
        
        // Send to AI chat
        await sendMessage(recoveryPrompt, workspaceType)
        
        // Close HIBP panel after sending to chat
        setTimeout(() => {
          setShowHIBP(false)
          setHibpEmail('')
          setHibpResult(null)
        }, 2000)
      } else if (data.useAI && data.aiAnalysis) {
        // AI analysis available - send to chat
        await sendMessage(data.aiAnalysis, workspaceType)
        
        // Close HIBP panel after sending to chat
        setTimeout(() => {
          setShowHIBP(false)
          setHibpEmail('')
          setHibpResult(null)
        }, 2000)
      }
    } catch (error) {
      setHibpResult({ error: 'Failed to check email. Please try again.' })
    } finally {
      setHibpLoading(false)
    }
  }
  
  // Detect crisis contact message in wellness workspace
  useEffect(() => {
    if (workspaceType === 'wellness' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant' && lastMessage.content.includes('Dear ')) {
        // Extract contact name and message
        const dearMatch = lastMessage.content.match(/Dear ([^,\n]+)/)
        if (dearMatch) {
          const name = dearMatch[1].trim()
          // Extract the message between --- markers
          const messageMatch = lastMessage.content.match(/---\s*([\s\S]*?)\s*---/)
          if (messageMatch) {
            setContactName(name)
            setContactMessage(messageMatch[1].trim())
            setCrisisContactDetected(true)
          }
        }
      } else {
        // Reset if not a crisis message
        setCrisisContactDetected(false)
      }
    }
  }, [messages, workspaceType])
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Message copied! You can now paste it in WhatsApp or SMS.')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy. Please select and copy the message manually.')
    }
  }

  // Prevent hydration mismatch - return null until mounted
  if (!mounted) return null

  return (
    <Card className="h-full flex flex-col">
      {messages.length === 0 ? (
        <PromptSuggestions 
          onPromptSelect={handlePromptSelect} 
          onFileUploadRequest={handleFileUploadRequest}
          workspaceType={workspaceType} 
        />
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}
      
      {/* Crisis Contact Card (Wellness Workspace) */}
      {crisisContactDetected && workspaceType === 'wellness' && (
        <div className="px-4 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💜</span>
                <div>
                  <p className="text-sm font-semibold text-purple-900">Message prepared for your loved one</p>
                  <p className="text-xs text-purple-700">Contact: {contactName}</p>
                </div>
              </div>
              <button
                onClick={() => setCrisisContactDetected(false)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Close
              </button>
            </div>
            
            {/* Message Preview */}
            <div className="p-3 bg-white rounded-lg border border-purple-200 mb-3">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans">
                {contactMessage}
              </pre>
            </div>
            
            {/* Copy Button */}
            <button
              onClick={() => copyToClipboard(contactMessage)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📋</span>
              Copy Message to Send
            </button>
            
            <p className="text-xs text-purple-600 text-center mt-2">
              You can paste this in WhatsApp, SMS, or any messaging app
            </p>
          </div>
        </div>
      )}
      
      {/* HIBP Panel */}
      {showHIBP && (
        <div className="px-4 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-t border-red-200">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="text-sm font-semibold text-red-900">Have I Been Pwned?</p>
                  <p className="text-xs text-red-700">Check if your email was exposed in data breaches</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHIBP(false)
                  setHibpEmail('')
                  setHibpResult(null)
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
            
            {/* Email Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={hibpEmail}
                onChange={(e) => setHibpEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                disabled={hibpLoading}
              />
              <button
                onClick={handleHIBPCheck}
                disabled={hibpLoading || !hibpEmail}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {hibpLoading ? 'Checking...' : 'Check Now'}
              </button>
            </div>
            
            {/* Results */}
            {hibpResult && (
              <div className={`p-3 rounded-lg ${
                hibpResult.error 
                  ? 'bg-red-100 border border-red-300' 
                  : hibpResult.useAI
                  ? 'bg-orange-100 border border-orange-300'
                  : hibpResult.breached 
                  ? 'bg-red-100 border border-red-300'
                  : hibpResult.disclaimer
                  ? 'bg-yellow-100 border border-yellow-300'
                  : 'bg-green-100 border border-green-300'
              }`}>
                {hibpResult.error ? (
                  <p className="text-sm text-red-800">{hibpResult.error}</p>
                ) : hibpResult.useAI ? (
                  <div>
                    <p className="text-sm font-semibold text-orange-900 mb-2">
                      ⚠️ Simulated - visit haveibeenpwned.com for real results
                    </p>
                    <p className="text-xs text-orange-800">
                      Generating AI security recommendations...
                    </p>
                  </div>
                ) : hibpResult.breached ? (
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-2">
                      ⚠️ Found in {hibpResult.count} breach{hibpResult.count > 1 ? 'es' : ''}!
                    </p>
                    <p className="text-xs text-red-800 mb-2">
                      {hibpResult.source && `Source: ${hibpResult.source} • `}
                      Generating personalized recovery plan...
                    </p>
                    <div className="space-y-1">
                      {hibpResult.breaches?.slice(0, 5).map((breach: any, idx: number) => (
                        <div key={idx} className="text-xs text-red-700">
                          • {breach.name} ({breach.date})
                        </div>
                      ))}
                      {hibpResult.count > 5 && (
                        <div className="text-xs text-red-700">
                          • And {hibpResult.count - 5} more...
                        </div>
                      )}
                    </div>
                  </div>
                ) : hibpResult.disclaimer ? (
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">
                      ⚠️ Not found in XposedOrNot database
                    </p>
                    <p className="text-xs text-yellow-800">
                      Visit haveibeenpwned.com for complete breach history.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      ✅ Good news!
                    </p>
                    <p className="text-xs text-green-800">
                      {hibpResult.message}
                      {hibpResult.source && ` (Source: ${hibpResult.source})`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Scam Detector Panel */}
      {showScamDetector && (
        <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-t border-orange-200">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-sm font-semibold text-orange-900">AI Scam Call Detector</p>
                  <p className="text-xs text-orange-700">Paste suspicious call transcript or message</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowScamDetector(false)
                  setScamText('')
                }}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
            
            {/* Text Input */}
            <textarea
              value={scamText}
              onChange={(e) => setScamText(e.target.value)}
              placeholder="Paste the suspicious message or describe the call here..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
            />
            
            {/* Analyze Button */}
            <button
              onClick={() => {
                if (!scamText.trim()) return
                
                const prompt = `SCAM ANALYSIS REQUEST: Analyze this message/call for scam indicators:

"${scamText}"

Provide:
1. VERDICT: SCAM / LIKELY SCAM / SUSPICIOUS / LEGITIMATE
2. Confidence percentage
3. Red flags found (list each one)
4. Scam type (phishing/vishing/smishing/CEO fraud/etc)
5. What to do next (block, report, ignore)
6. How to report in India (cybercrime.gov.in, 1930 helpline)`
                
                sendMessage(prompt, workspaceType)
                setShowScamDetector(false)
                setScamText('')
              }}
              disabled={!scamText.trim()}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Analyze for Scam
            </button>
          </div>
        </div>
      )}
      
      {/* File Upload Prompt Banner */}
      {showFileUploadPrompt && (
        <div className="px-4 py-3 bg-purple-50 border-t border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎭</span>
              <div>
                <p className="text-sm font-semibold text-purple-900">Deepfake Detector Active</p>
                <p className="text-xs text-purple-700">Upload an image using the button below to analyze for deepfakes</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowFileUploadPrompt(false)
                setPendingPrompt('')
                setInputValue('')
              }}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isLoading}
        enableFileUpload={enableFileUpload}
        externalValue={inputValue}
        onValueChange={setInputValue}
        ref={chatInputRef}
      />
    </Card>
  )
}
