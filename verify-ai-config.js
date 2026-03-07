// AI Configuration Verification Script
// Run with: node verify-ai-config.js

require('dotenv').config({ path: '.env.local' })

console.log('='.repeat(60))
console.log('AI PROVIDER CONFIGURATION VERIFICATION')
console.log('='.repeat(60))

// Check AWS Bedrock
console.log('\n📦 AWS BEDROCK (Primary Provider)')
console.log('-'.repeat(60))
const hasAwsAccessKey = !!process.env.AWS_ACCESS_KEY_ID
const hasAwsSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY
const hasBedrockModelId = !!process.env.AWS_BEDROCK_MODEL_ID
const hasBedrockRegion = !!process.env.AWS_BEDROCK_MODEL_REGION

console.log(`AWS_ACCESS_KEY_ID:        ${hasAwsAccessKey ? '✅ Present' : '❌ Missing'}`)
console.log(`AWS_SECRET_ACCESS_KEY:    ${hasAwsSecretKey ? '✅ Present' : '❌ Missing'}`)
console.log(`AWS_BEDROCK_MODEL_ID:     ${hasBedrockModelId ? '✅ Present' : '❌ Missing'}`)
if (hasBedrockModelId) {
  console.log(`  Model: ${process.env.AWS_BEDROCK_MODEL_ID}`)
}
console.log(`AWS_BEDROCK_MODEL_REGION: ${hasBedrockRegion ? '✅ Present' : '❌ Missing'}`)
if (hasBedrockRegion) {
  console.log(`  Region: ${process.env.AWS_BEDROCK_MODEL_REGION}`)
}

const bedrockConfigured = hasAwsAccessKey && hasAwsSecretKey && hasBedrockModelId
console.log(`\nBedrock Status: ${bedrockConfigured ? '🟢 CONFIGURED' : '🔴 NOT CONFIGURED'}`)

// Check Groq
console.log('\n🚀 GROQ (Fallback Provider)')
console.log('-'.repeat(60))
const hasGroqKey = !!process.env.GROQ_API_KEY
console.log(`GROQ_API_KEY: ${hasGroqKey ? '✅ Present' : '❌ Missing'}`)
if (hasGroqKey) {
  const keyPreview = process.env.GROQ_API_KEY.substring(0, 10) + '...'
  console.log(`  Key: ${keyPreview}`)
  console.log(`  Model: llama3-8b-8192`)
}
console.log(`\nGroq Status: ${hasGroqKey ? '🟢 CONFIGURED' : '🔴 NOT CONFIGURED'}`)

// Check Supabase
console.log('\n🗄️  SUPABASE (Database)')
console.log('-'.repeat(60))
const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
console.log(`NEXT_PUBLIC_SUPABASE_URL:      ${hasSupabaseUrl ? '✅ Present' : '❌ Missing'}`)
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅ Present' : '❌ Missing'}`)
const supabaseConfigured = hasSupabaseUrl && hasSupabaseKey
console.log(`\nSupabase Status: ${supabaseConfigured ? '🟢 CONFIGURED' : '🔴 NOT CONFIGURED'}`)

// Check MongoDB
console.log('\n🍃 MONGODB (Database)')
console.log('-'.repeat(60))
const hasMongoUri = !!process.env.MONGODB_URI
const hasMongoDb = !!process.env.MONGODB_DB_NAME
console.log(`MONGODB_URI:     ${hasMongoUri ? '✅ Present' : '❌ Missing'}`)
console.log(`MONGODB_DB_NAME: ${hasMongoDb ? '✅ Present' : '❌ Missing'}`)
if (hasMongoDb) {
  console.log(`  Database: ${process.env.MONGODB_DB_NAME}`)
}
const mongoConfigured = hasMongoUri && hasMongoDb
console.log(`\nMongoDB Status: ${mongoConfigured ? '🟢 CONFIGURED' : '🔴 NOT CONFIGURED'}`)

// Provider Priority
console.log('\n🎯 AI PROVIDER PRIORITY')
console.log('-'.repeat(60))
if (bedrockConfigured && hasGroqKey) {
  console.log('1. AWS Bedrock (Claude 3.5 Sonnet) - PRIMARY ✅')
  console.log('2. Groq (Llama3-8b-8192) - FALLBACK ✅')
  console.log('\n✅ Both providers configured - High availability mode')
} else if (bedrockConfigured) {
  console.log('1. AWS Bedrock (Claude 3.5 Sonnet) - PRIMARY ✅')
  console.log('2. Groq - NOT CONFIGURED ⚠️')
  console.log('\n⚠️  No fallback provider - Consider adding GROQ_API_KEY')
} else if (hasGroqKey) {
  console.log('1. AWS Bedrock - NOT CONFIGURED ⚠️')
  console.log('2. Groq (Llama3-8b-8192) - PRIMARY ✅')
  console.log('\n✅ Groq configured - Using as primary provider')
} else {
  console.log('❌ No AI provider configured')
  console.log('\n🔴 CRITICAL: Add AWS Bedrock or Groq credentials')
}

// Overall Status
console.log('\n' + '='.repeat(60))
console.log('OVERALL STATUS')
console.log('='.repeat(60))

const allConfigured = bedrockConfigured && hasGroqKey && supabaseConfigured && mongoConfigured
const aiConfigured = bedrockConfigured || hasGroqKey

if (allConfigured) {
  console.log('🟢 ALL SYSTEMS CONFIGURED')
  console.log('✅ AI Provider: Ready')
  console.log('✅ Database: Ready')
  console.log('✅ Authentication: Ready')
} else if (aiConfigured && supabaseConfigured) {
  console.log('🟡 PARTIALLY CONFIGURED')
  console.log(`${aiConfigured ? '✅' : '❌'} AI Provider: ${aiConfigured ? 'Ready' : 'Not Ready'}`)
  console.log(`${supabaseConfigured ? '✅' : '❌'} Supabase: ${supabaseConfigured ? 'Ready' : 'Not Ready'}`)
  console.log(`${mongoConfigured ? '✅' : '⚠️'} MongoDB: ${mongoConfigured ? 'Ready' : 'Optional'}`)
} else {
  console.log('🔴 CONFIGURATION INCOMPLETE')
  console.log(`${aiConfigured ? '✅' : '❌'} AI Provider: ${aiConfigured ? 'Ready' : 'Not Ready'}`)
  console.log(`${supabaseConfigured ? '✅' : '❌'} Supabase: ${supabaseConfigured ? 'Ready' : 'Not Ready'}`)
  console.log(`${mongoConfigured ? '✅' : '⚠️'} MongoDB: ${mongoConfigured ? 'Ready' : 'Optional'}`)
}

console.log('\n' + '='.repeat(60))
console.log('NEXT STEPS')
console.log('='.repeat(60))

if (allConfigured) {
  console.log('✅ Configuration complete!')
  console.log('   Run: npm run dev')
  console.log('   Test: http://localhost:3000/dashboard/workspaces/chat')
} else {
  console.log('📝 Configuration needed:')
  if (!bedrockConfigured && !hasGroqKey) {
    console.log('   1. Add AWS Bedrock credentials OR Groq API key to .env.local')
  }
  if (!supabaseConfigured) {
    console.log('   2. Add Supabase credentials to .env.local')
  }
  if (!mongoConfigured) {
    console.log('   3. (Optional) Add MongoDB credentials to .env.local')
  }
  console.log('\n   Then run: npm run dev')
}

console.log('='.repeat(60))
