'use client'

import { useState } from 'react'

interface PromptCard {
  id: string
  title: string
  prompt: string
  icon: string
  gradient: string
}

interface PromptSuggestionsProps {
  onPromptSelect: (prompt: string) => void
  onFileUploadRequest?: (prompt: string) => void
  workspaceType?: string
}

const workspacePrompts: Record<string, PromptCard[]> = {
  general_chat: [
    {
      id: 'plan',
      title: 'Plan My Day',
      prompt: 'Help me plan my day and prioritize my tasks',
      icon: '📅',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'explain',
      title: 'Explain Simply',
      prompt: 'Explain this concept in simple terms: ',
      icon: '💡',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'travel',
      title: 'Travel Advice',
      prompt: 'Give me travel tips and recommendations for ',
      icon: '✈️',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'recipe',
      title: 'Recipe Idea',
      prompt: 'Suggest a recipe I can make with ',
      icon: '🍳',
      gradient: 'from-orange-500 to-red-500'
    }
  ],
  explain_assist: [
    {
      id: 'explain',
      title: 'Explain Concept',
      prompt: 'Explain this concept clearly: ',
      icon: '🧠',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'summarize',
      title: 'Summarize This',
      prompt: 'Summarize this in simple points: ',
      icon: '📝',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'examples',
      title: 'Give Examples',
      prompt: 'Give me real-world examples of ',
      icon: '🔍',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'eli5',
      title: 'ELI5',
      prompt: 'Explain this like I\'m 5 years old: ',
      icon: '👶',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ],
  debug_workspace: [
    {
      id: 'debug',
      title: 'Debug My Code',
      prompt: 'Find and fix the bug in this code: ',
      icon: '🐛',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      id: 'optimize',
      title: 'Optimize This',
      prompt: 'Optimize this code for better performance: ',
      icon: '⚡',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'convert',
      title: 'Convert Language',
      prompt: 'Convert this code to ',
      icon: '🔄',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'explain',
      title: 'Explain Code',
      prompt: 'Explain what this code does step by step: ',
      icon: '📖',
      gradient: 'from-blue-500 to-indigo-500'
    }
  ],
  smart_summarizer: [
    {
      id: 'summarize',
      title: 'Summarize Text',
      prompt: 'Summarize this text into key points: ',
      icon: '📄',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'takeaways',
      title: 'Key Takeaways',
      prompt: 'What are the main takeaways from: ',
      icon: '🎯',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'rewrite',
      title: 'Rewrite Clearly',
      prompt: 'Rewrite this more clearly and concisely: ',
      icon: '✏️',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'bullets',
      title: 'Bullet Points',
      prompt: 'Convert this into bullet points: ',
      icon: '📋',
      gradient: 'from-orange-500 to-red-500'
    }
  ],
  quiz: [
    {
      id: 'quiz',
      title: 'Quiz Me',
      prompt: 'Quiz me on the topic: ',
      icon: '🎯',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'mcq',
      title: 'Practice MCQs',
      prompt: 'Give me 5 multiple choice questions about ',
      icon: '📝',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'test',
      title: 'Test My Knowledge',
      prompt: 'Test my knowledge on ',
      icon: '🏆',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'flashcards',
      title: 'Flashcards',
      prompt: 'Create flashcards for ',
      icon: '🃏',
      gradient: 'from-orange-500 to-red-500'
    }
  ],
  'cyber-safety': [
    {
      id: 'deepfake',
      title: 'Deepfake Detector',
      prompt: 'Analyze this image carefully for signs of AI manipulation or deepfake generation. Check for: unnatural facial blending, skin texture inconsistencies, lighting mismatches, eye/teeth artifacts, and background anomalies. Give verdict: REAL or DEEPFAKE with confidence percentage and 3 specific reasons.',
      icon: '🎭',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'hibp',
      title: 'Have I Been Pwned?',
      prompt: 'HIBP_CHECK',
      icon: '🔍',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'scam',
      title: 'AI Scam Call Detector',
      prompt: 'SCAM_DETECTOR',
      icon: '📞',
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'privacy',
      title: 'Privacy Check',
      prompt: 'How do I protect my privacy on ',
      icon: '🛡️',
      gradient: 'from-green-500 to-emerald-500'
    }
  ],
  wellness: [
    {
      id: 'feelings',
      title: 'Share Feelings',
      prompt: 'I want to talk about how I\'m feeling: ',
      icon: '💙',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'stress',
      title: 'Stress Relief',
      prompt: 'Give me stress relief techniques for ',
      icon: '🌿',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'checkin',
      title: 'Mood Check-In',
      prompt: 'I\'d like to do a mental health check-in',
      icon: '🌟',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'calm',
      title: 'Calm My Mind',
      prompt: 'Help me calm down, I\'m feeling ',
      icon: '🧘',
      gradient: 'from-purple-500 to-pink-500'
    }
  ],
  study_focus: [
    {
      id: 'plan',
      title: 'Study Plan',
      prompt: 'Create a study plan for ',
      icon: '📚',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'explain',
      title: 'Explain Topic',
      prompt: 'Explain this topic in detail: ',
      icon: '🎓',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'memory',
      title: 'Memory Tips',
      prompt: 'Give me memory techniques to remember ',
      icon: '🧠',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'practice',
      title: 'Practice Questions',
      prompt: 'Give me practice questions for ',
      icon: '❓',
      gradient: 'from-orange-500 to-red-500'
    }
  ]
}

// Default cards for workspaces without specific prompts
const defaultPrompts: PromptCard[] = [
  {
    id: 'help',
    title: 'Help me with',
    prompt: 'Help me with',
    icon: '🤝',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'explain',
    title: 'Explain something',
    prompt: 'Explain this:',
    icon: '💡',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'analyze',
    title: 'Analyze this',
    prompt: 'Analyze this:',
    icon: '📊',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'create',
    title: 'Create something',
    prompt: 'Create',
    icon: '✨',
    gradient: 'from-orange-500 to-red-500'
  }
]

export function PromptSuggestions({ onPromptSelect, onFileUploadRequest, workspaceType = 'general_chat' }: PromptSuggestionsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleCardClick = (card: PromptCard) => {
    // Special handling for deepfake detector - trigger file upload
    if (card.id === 'deepfake' && onFileUploadRequest) {
      onFileUploadRequest(card.prompt)
    } else if (card.id === 'hibp' && onFileUploadRequest) {
      // Special handling for HIBP - trigger HIBP panel
      onFileUploadRequest('HIBP_CHECK')
    } else if (card.id === 'scam' && onFileUploadRequest) {
      // Special handling for Scam Detector - trigger scam panel
      onFileUploadRequest('SCAM_DETECTOR')
    } else {
      onPromptSelect(card.prompt)
    }
  }

  // Get workspace-specific prompts or use default
  const promptCards = workspacePrompts[workspaceType] || defaultPrompts

  return (
    <div className="flex flex-col items-center justify-center py-4 px-4 overflow-y-auto">
      {/* Title - Compact */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          What can Nebula help you with?
        </h1>
        <p className="text-sm text-gray-600">
          Choose a prompt to get started
        </p>
      </div>

      {/* Suggestion Cards Grid - Compact 2x2 or 2x3 */}
      <div className="grid grid-cols-2 gap-3 max-w-3xl w-full">
        {promptCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 text-left h-[120px] flex flex-col"
          >
            {/* Gradient overlay on hover */}
            <div
              className={`absolute inset-0 rounded-lg bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
            />

            {/* Card content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Icon - Top Left */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200">
                  <span className="text-lg">{card.icon}</span>
                </div>
                {/* Arrow indicator on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-800">
                {card.title}
              </h3>

              {/* Prompt preview - Muted */}
              <p className="text-xs text-gray-500 group-hover:text-gray-600 line-clamp-2 flex-1">
                {card.prompt}
              </p>
            </div>

            {/* Subtle border highlight on hover */}
            {hoveredCard === card.id && (
              <div
                className={`absolute inset-0 rounded-lg bg-gradient-to-br ${card.gradient} opacity-10`}
                style={{ zIndex: 0 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Additional info - Compact */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          You can also type any custom prompt below
        </p>
      </div>
    </div>
  )
}

