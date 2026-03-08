// Crisis keyword detection for mental wellness
const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'want to die',
  'better off dead',
  'no reason to live',
  'self harm',
  'hurt myself',
  'cut myself',
  'overdose',
  'end it all',
]

const CRISIS_RESOURCES = {
  IN: {
    country: 'India',
    helplines: [
      {
        name: 'KIRAN Mental Health Helpline',
        number: '1800-599-0019',
        available: '24/7',
      },
      {
        name: 'Emergency Services',
        number: '112',
        available: '24/7',
      },
      {
        name: 'Vandrevala Foundation',
        number: '1860-2662-345',
        available: '24/7',
      },
    ],
    website: 'https://findahelpline.com/i/iasp',
  },
  US: {
    country: 'United States',
    helplines: [
      {
        name: '988 Suicide & Crisis Lifeline',
        number: '988',
        available: '24/7',
      },
      {
        name: 'Crisis Text Line',
        number: 'Text HOME to 741741',
        available: '24/7',
      },
    ],
    website: 'https://988lifeline.org',
  },
  UK: {
    country: 'United Kingdom',
    helplines: [
      {
        name: 'Samaritans',
        number: '116 123',
        available: '24/7',
      },
      {
        name: 'Crisis Text Line',
        number: 'Text SHOUT to 85258',
        available: '24/7',
      },
    ],
    website: 'https://www.samaritans.org',
  },
}

export function detectCrisisKeywords(text: string): boolean {
  const lowerText = (typeof text === 'string' ? text : '').toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword))
}

export function getCrisisResources(countryCode: string = 'IN') {
  return CRISIS_RESOURCES[countryCode as keyof typeof CRISIS_RESOURCES] || CRISIS_RESOURCES.IN
}

export function generateCrisisMessage(countryCode: string = 'IN'): string {
  const resources = getCrisisResources(countryCode)
  
  let message = `🚨 **CRISIS SUPPORT AVAILABLE**\n\n`
  message += `If you're experiencing a mental health crisis or having thoughts of self-harm, please reach out for immediate help:\n\n`
  
  resources.helplines.forEach(helpline => {
    message += `**${helpline.name}**\n`
    message += `📞 ${helpline.number}\n`
    message += `⏰ Available: ${helpline.available}\n\n`
  })
  
  message += `🌐 More resources: ${resources.website}\n\n`
  message += `**You are not alone. Professional help is available 24/7.**`
  
  return message
}
