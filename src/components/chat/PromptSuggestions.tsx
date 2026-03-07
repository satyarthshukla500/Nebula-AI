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
}

const promptCards: PromptCard[] = [
  {
    id: 'explain',
    title: 'Explain something',
    prompt: 'Explain this concept step by step:',
    icon: '💡',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'debug',
    title: 'Debug code',
    prompt: 'Help me debug this code:',
    icon: '🐛',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'summarize',
    title: 'Summarize content',
    prompt: 'Summarize the following text:',
    icon: '📝',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'analyze',
    title: 'Analyze file',
    prompt: 'Analyze this document:',
    icon: '📊',
    gradient: 'from-orange-500 to-red-500'
  }
]

export function PromptSuggestions({ onPromptSelect }: PromptSuggestionsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleCardClick = (prompt: string) => {
    onPromptSelect(prompt)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      {/* Title */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          What can Nebula help you with?
        </h1>
        <p className="text-lg text-gray-600">
          Choose a prompt to get started, or type your own message below
        </p>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
        {promptCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.prompt)}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 hover:border-transparent text-left"
          >
            {/* Gradient overlay on hover */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />

            {/* Card content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gray-100 group-hover:bg-white transition-colors duration-300">
                <span className="text-2xl">{card.icon}</span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-800">
                {card.title}
              </h3>

              {/* Prompt preview */}
              <p className="text-sm text-gray-600 group-hover:text-gray-700">
                {card.prompt}
              </p>

              {/* Arrow indicator on hover */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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

            {/* Gradient border on hover */}
            {hoveredCard === card.id && (
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-20 animate-pulse-slow`}
                style={{ zIndex: -1 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Additional info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Tip: You can also upload files, use voice input, or type any custom prompt
        </p>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
