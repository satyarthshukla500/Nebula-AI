// Test AI Configuration
// Run with: node test-ai-config.js

const fs = require('fs')
const path = require('path')

console.log('='.repeat(60))
console.log('NEBULA AI - Configuration Test')
console.log('='.repeat(60))

// Read .env.local file
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

// Parse environment variables
const env = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim()
    }
  }
})

// Test AWS Bedrock Configuration
console.log('\n[AWS Bedrock Configuration]')
console.log('AWS_REGION:', env.AWS_REGION ? '✓ Set' : '✗ Missing')
console.log('AWS_ACCESS_KEY_ID:', env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing')
console.log('AWS_SECRET_ACCESS_KEY:', env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing')
console.log('AWS_BEDROCK_MODEL_ID:', env.AWS_BEDROCK_MODEL_ID || '✗ Missing')
console.log('AWS_BEDROCK_MODEL_REGION:', env.AWS_BEDROCK_MODEL_REGION || '✗ Missing')

const bedrockConfigured = !!(
  env.AWS_ACCESS_KEY_ID &&
  env.AWS_SECRET_ACCESS_KEY &&
  env.AWS_BEDROCK_MODEL_ID
)
console.log('\nBedrock Status:', bedrockConfigured ? '✓ CONFIGURED' : '✗ NOT CONFIGURED')

// Test Groq Configuration
console.log('\n[Groq Configuration]')
console.log('GROQ_API_KEY:', env.GROQ_API_KEY ? '✓ Set' : '✗ Missing')

const groqConfigured = !!env.GROQ_API_KEY
console.log('\nGroq Status:', groqConfigured ? '✓ CONFIGURED' : '✗ NOT CONFIGURED')

// Test Supabase Configuration
console.log('\n[Supabase Configuration]')
console.log('NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing')

const supabaseConfigured = !!(
  env.NEXT_PUBLIC_SUPABASE_URL &&
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
console.log('\nSupabase Status:', supabaseConfigured ? '✓ CONFIGURED' : '✗ NOT CONFIGURED')

// Test MongoDB Configuration
console.log('\n[MongoDB Configuration]')
console.log('MONGODB_URI:', env.MONGODB_URI ? '✓ Set' : '✗ Missing')
console.log('MONGODB_DB_NAME:', env.MONGODB_DB_NAME || 'nebula-ai (default)')

const mongoConfigured = !!env.MONGODB_URI
console.log('\nMongoDB Status:', mongoConfigured ? '✓ CONFIGURED' : '✗ NOT CONFIGURED')

// Overall Status
console.log('\n' + '='.repeat(60))
console.log('OVERALL STATUS')
console.log('='.repeat(60))

if (bedrockConfigured) {
  console.log('✓ Primary AI Provider: AWS Bedrock (Claude 3.5 Sonnet)')
  console.log('  Model:', env.AWS_BEDROCK_MODEL_ID)
} else if (groqConfigured) {
  console.log('⚠ Primary AI Provider: Groq (Llama 3.1)')
  console.log('  Note: Bedrock not configured, using Groq only')
} else {
  console.log('✗ No AI Provider Configured')
  console.log('  Please configure AWS Bedrock or Groq')
}

if (bedrockConfigured && groqConfigured) {
  console.log('✓ Fallback Provider: Groq (Llama 3.1)')
}

console.log('\nAuthentication:', supabaseConfigured ? '✓ Supabase' : '✗ Not configured')
console.log('Database:', mongoConfigured ? '✓ MongoDB' : '⚠ Not configured (optional)')

console.log('\n' + '='.repeat(60))

// Expected Model IDs
console.log('\nExpected Configuration:')
console.log('- Bedrock Model: anthropic.claude-3-5-sonnet-20240620-v1:0')
console.log('- Groq Model: llama-3.1-8b-instant')

if (env.AWS_BEDROCK_MODEL_ID === 'anthropic.claude-3-5-sonnet-20240620-v1:0') {
  console.log('✓ Bedrock model ID is correct')
} else if (env.AWS_BEDROCK_MODEL_ID) {
  console.log('⚠ Bedrock model ID mismatch')
  console.log('  Current:', env.AWS_BEDROCK_MODEL_ID)
  console.log('  Expected: anthropic.claude-3-5-sonnet-20240620-v1:0')
}

console.log('\n' + '='.repeat(60))
console.log('Test Complete')
console.log('='.repeat(60))
