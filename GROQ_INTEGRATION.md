# Groq AI Provider Integration

## Overview

Nebula AI now supports multiple AI providers with automatic fallback:
- **Primary**: AWS Bedrock (Claude 3 Sonnet)
- **Fallback**: Groq (Llama3-8b-8192)

The system automatically selects the best available provider based on configuration.

## Architecture

### Provider Priority

1. **AWS Bedrock** (Primary)
   - Model: `anthropic.claude-3-sonnet-20240229-v1:0`
   - Requires: AWS credentials + Bedrock model ID
   - Best for: Production workloads, high-quality responses

2. **Groq** (Fallback)
   - Model: `llama3-8b-8192`
   - Requires: GROQ_API_KEY
   - Best for: Fast inference, cost-effective alternative

3. **None** (Error State)
   - Returns: "AI provider not configured" message
   - Occurs when: No credentials are available

### Automatic Fallback Logic

```
Request → Check Bedrock Config
         ↓
    [Configured?]
         ↓ Yes
    Try Bedrock
         ↓
    [Success?]
         ↓ No
    Check Groq Config
         ↓
    [Configured?]
         ↓ Yes
    Try Groq
         ↓
    [Success?]
         ↓ No
    Return Error
```

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# AWS Bedrock (Primary Provider)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
AWS_BEDROCK_MODEL_REGION=us-east-1

# Groq (Fallback Provider)
GROQ_API_KEY=your-groq-api-key
```

### Getting Groq API Key

1. Visit: https://console.groq.com/keys
2. Sign up or log in
3. Create a new API key
4. Copy and add to `.env.local`

## Files Created/Modified

### New Files

1. **`src/lib/ai/groqProvider.ts`**
   - Groq SDK integration
   - `generateGroqResponse()` - Standard response generation
   - `generateGroqResponseStream()` - Streaming support
   - `isGroqConfigured()` - Configuration check

### Modified Files

1. **`src/lib/ai.ts`**
   - Added multi-provider support
   - Implemented automatic fallback logic
   - Added `getProviderInfo()` for debugging
   - Maintained backward compatibility

2. **`.env.local`**
   - Added `GROQ_API_KEY` configuration

3. **`.env.example`**
   - Added Groq configuration template
   - Added documentation comments

## Usage

### Standard Usage (No Code Changes Required)

All existing workspace APIs automatically use the new multi-provider system:

```typescript
import { generateAIResponse } from '@/lib/ai'

// Automatically uses Bedrock → Groq → Error
const response = await generateAIResponse(
  [{ role: 'user', content: 'Hello!' }],
  'You are a helpful assistant'
)
```

### Streaming Support

```typescript
import { generateAIResponseStream } from '@/lib/ai'

await generateAIResponseStream(
  [{ role: 'user', content: 'Tell me a story' }],
  'You are a storyteller',
  (chunk) => {
    console.log('Received:', chunk)
  }
)
```

### Check Active Provider

```typescript
import { getProviderInfo } from '@/lib/ai'

const info = getProviderInfo()
console.log('Provider:', info.provider)  // 'bedrock' | 'groq' | 'none'
console.log('Model:', info.model)
console.log('Configured:', info.configured)
```

## API Compatibility

### Workspace APIs (All Compatible)

All workspace APIs work seamlessly with both providers:

- ✅ `/api/workspaces/chat` - General chat
- ✅ `/api/workspaces/explain` - Code explanation
- ✅ `/api/workspaces/quiz` - Quiz generation
- ✅ `/api/workspaces/study` - Study materials
- ✅ `/api/workspaces/debug` - Code debugging
- ✅ `/api/workspaces/summarize` - Content summarization
- ✅ `/api/workspaces/wellness` - Mental wellness support
- ✅ `/api/workspaces/cyber-safety` - Security analysis

### Message Format

Both providers use the same message format:

```typescript
interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}
```

### Response Format

Both providers return the same response structure:

```typescript
interface AIResponse {
  content: string
  stopReason?: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}
```

## Provider Comparison

| Feature | AWS Bedrock | Groq |
|---------|-------------|------|
| Model | Claude 3 Sonnet | Llama3-8b-8192 |
| Speed | Moderate | Very Fast |
| Quality | Excellent | Good |
| Cost | Higher | Lower |
| Context Window | 200K tokens | 8K tokens |
| Streaming | Yes | Yes |
| Setup Complexity | High (AWS IAM) | Low (API Key) |

## Testing

### Test with Bedrock Only

```env
# .env.local
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
# GROQ_API_KEY not set
```

Expected: Uses Bedrock

### Test with Groq Only

```env
# .env.local
# AWS credentials not set
GROQ_API_KEY=your-groq-key
```

Expected: Uses Groq

### Test Fallback

```env
# .env.local
AWS_ACCESS_KEY_ID=invalid-key
AWS_SECRET_ACCESS_KEY=invalid-secret
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
GROQ_API_KEY=your-groq-key
```

Expected: Tries Bedrock → Fails → Falls back to Groq

### Test No Provider

```env
# .env.local
# No AI credentials set
```

Expected: Returns "AI provider not configured" message

## Logging

The system logs provider selection and fallback:

```
[AI] Using AWS Bedrock (Claude Sonnet)
[AI] Bedrock failed, trying Groq fallback: Error...
[AI] Falling back to Groq (Llama3)
[AI] Using Groq (Llama3)
```

## Error Handling

### Bedrock Fails, Groq Available
- Logs Bedrock error
- Automatically tries Groq
- Returns Groq response

### Both Providers Fail
- Logs both errors
- Throws: "All AI providers failed"

### No Providers Configured
- Returns friendly message
- Does not throw error
- Allows app to continue

## Performance Considerations

### Bedrock
- Latency: ~2-5 seconds
- Best for: Quality-critical responses
- Use when: AWS infrastructure available

### Groq
- Latency: ~0.5-1 second
- Best for: Speed-critical applications
- Use when: Fast responses needed

## Migration Guide

### From Old AI System

**Before** (Placeholder):
```typescript
// Old system returned placeholder
const response = await generateAIResponse(messages)
// content: "AI provider not yet configured..."
```

**After** (Multi-Provider):
```typescript
// New system uses real AI
const response = await generateAIResponse(messages)
// content: Actual AI-generated response
```

### No Code Changes Required

All existing code continues to work. The system automatically:
- Detects available providers
- Selects best provider
- Handles fallback
- Returns consistent format

## Troubleshooting

### "AI provider not configured"
**Cause**: No credentials set
**Solution**: Add AWS credentials or GROQ_API_KEY to `.env.local`

### "Failed to invoke Bedrock model"
**Cause**: Invalid AWS credentials or permissions
**Solution**: 
1. Check AWS credentials
2. Verify IAM permissions for Bedrock
3. System will auto-fallback to Groq if available

### "Failed to generate response from Groq"
**Cause**: Invalid Groq API key or rate limit
**Solution**:
1. Verify GROQ_API_KEY is correct
2. Check Groq console for rate limits
3. If Bedrock is configured, it will be used instead

### Slow Responses
**Cause**: Using Bedrock (higher latency)
**Solution**: 
- Use Groq for faster responses
- Or optimize prompts to reduce token count

## Security

### API Key Storage
- ✅ Keys stored in `.env.local` (gitignored)
- ✅ Never committed to repository
- ✅ `.env.example` contains templates only

### Best Practices
1. Use environment variables for all keys
2. Rotate API keys regularly
3. Use IAM roles in production (Bedrock)
4. Monitor API usage and costs
5. Implement rate limiting

## Dependencies

### New Package
```json
{
  "groq-sdk": "^0.x.x"
}
```

### Installation
```bash
npm install groq-sdk
```

## Future Enhancements

### Planned Features
1. **Provider Selection API**: Allow manual provider selection
2. **Load Balancing**: Distribute requests across providers
3. **Cost Tracking**: Monitor usage and costs per provider
4. **Response Caching**: Cache common responses
5. **A/B Testing**: Compare provider quality

### Additional Providers
- OpenAI GPT-4
- Anthropic Claude (direct API)
- Google Gemini
- Mistral AI

## Summary

✅ **Groq Integration Complete**
- Multi-provider support implemented
- Automatic fallback working
- All workspace APIs compatible
- No breaking changes
- Production ready

✅ **Build Status**: Successful
✅ **Type Safety**: Verified
✅ **Backward Compatibility**: Maintained

The Nebula AI project now has robust AI provider support with intelligent fallback, ensuring high availability and flexibility.
