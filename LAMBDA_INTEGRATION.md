# AWS Lambda Backend Integration

## Overview

Nebula AI now supports AWS Lambda as the primary AI backend provider. This architecture allows you to deploy your AI processing logic to AWS Lambda, which then calls AWS Bedrock (Claude 3.5 Sonnet) for AI responses.

## Architecture

```
User → Frontend → Next.js API → AWS Lambda → AWS Bedrock → Claude 3.5 Sonnet
```

### Provider Priority Chain

The system automatically falls back through providers if one fails:

1. **AWS Lambda** (Primary) - If `NEBULA_LAMBDA_ENDPOINT` is configured
2. **AWS Bedrock** (Fallback) - If Lambda fails or not configured
3. **Groq** (Last Resort) - If both Lambda and Bedrock fail

## Configuration

### Environment Variables

Add the following to your `.env.local`:

```env
# AWS Lambda AI Backend (Primary Provider)
NEBULA_LAMBDA_ENDPOINT=https://your-lambda-url.lambda-url.us-east-1.on.aws/

# AWS Bedrock (Fallback Provider)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
AWS_BEDROCK_MODEL_REGION=us-east-1

# Groq (Last Resort Fallback)
GROQ_API_KEY=your_groq_api_key
```

### Lambda Function Requirements

Your Lambda function must:

1. **Accept POST requests** with JSON body:
```json
{
  "message": "User's message",
  "systemPrompt": "Optional system prompt",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

2. **Return JSON response**:
```json
{
  "reply": "AI generated response",
  "usage": {
    "inputTokens": 100,
    "outputTokens": 200
  },
  "stopReason": "end_turn"
}
```

## Implementation Details

### Lambda Client (`src/lib/aws/lambda.ts`)

The Lambda client provides:

- **`isLambdaConfigured()`** - Check if Lambda endpoint is set
- **`callLambdaAI()`** - Send request to Lambda and get AI response
- **`getLambdaEndpoint()`** - Get configured endpoint URL

### AI Abstraction Layer (`src/lib/ai.ts`)

The AI layer automatically:

1. Detects which providers are configured
2. Prioritizes Lambda if available
3. Falls back to Bedrock if Lambda fails
4. Falls back to Groq if both fail
5. Logs all provider attempts and failures

### Logging

The system provides comprehensive logging:

```
[AI] ========== AI Request Start ==========
[Lambda] Configuration check: { configured: true, endpoint: 'set' }
[AI Config] Selected provider: AWS Lambda (Bedrock via Lambda)
[AI] Using Lambda backend
[Lambda] Calling AI endpoint
[Lambda] Response received in 1234 ms
[AI] ===== Lambda Success =====
[AI] ========== AI Request End ==========
```

## Testing

### 1. Test Lambda Configuration

```bash
# Check if Lambda is detected
npm run dev
# Look for: "[AI Config] Selected provider: AWS Lambda"
```

### 2. Test Chat Functionality

1. Navigate to `/dashboard/workspaces/chat`
2. Send a message
3. Check browser console for Lambda logs
4. Verify AI response is received

### 3. Test Fallback Chain

To test fallback behavior:

1. **Remove Lambda endpoint** - Should fall back to Bedrock
2. **Remove Bedrock credentials** - Should fall back to Groq
3. **Remove all providers** - Should show configuration message

## Deployment

### Lambda Function Setup

1. Create Lambda function in AWS Console
2. Configure function URL (enable CORS)
3. Set environment variables in Lambda:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_BEDROCK_MODEL_ID`

4. Deploy your Lambda code that:
   - Receives POST requests
   - Calls Bedrock with the message
   - Returns formatted response

### Next.js Deployment

1. Add `NEBULA_LAMBDA_ENDPOINT` to your deployment environment
2. Deploy Next.js app (Vercel, AWS Amplify, etc.)
3. Test end-to-end functionality

## Error Handling

The system handles errors gracefully:

- **Lambda timeout** - Falls back to Bedrock
- **Lambda 500 error** - Falls back to Bedrock
- **Network errors** - Falls back to Bedrock
- **All providers fail** - Returns error message to user

## Benefits

### Why Use Lambda?

1. **Centralized AI Logic** - All AI processing in one place
2. **Cost Optimization** - Pay only for Lambda execution time
3. **Scalability** - Lambda auto-scales with demand
4. **Security** - AWS credentials stay in Lambda, not in frontend
5. **Flexibility** - Easy to update AI logic without redeploying frontend

### Performance

- Lambda cold start: ~1-2 seconds
- Lambda warm execution: ~500ms-1s
- Direct Bedrock: ~500ms-1s

## Troubleshooting

### Lambda Not Being Used

Check logs for:
```
[Lambda] Configuration check: { configured: false, endpoint: 'not set' }
```

**Solution**: Add `NEBULA_LAMBDA_ENDPOINT` to `.env.local`

### Lambda Failing

Check logs for:
```
[Lambda] Request failed: { error: '...', endpoint: '...' }
[AI] ===== Falling back to AWS Bedrock =====
```

**Solution**: 
- Verify Lambda URL is correct
- Check Lambda function logs in AWS Console
- Ensure Lambda has Bedrock permissions

### No AI Response

Check logs for:
```
[AI] ===== No Provider Configured =====
```

**Solution**: Configure at least one provider (Lambda, Bedrock, or Groq)

## Example Lambda Function

Here's a minimal Lambda function example (Python):

```python
import json
import boto3

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    message = body['message']
    system_prompt = body.get('systemPrompt', '')
    history = body.get('conversationHistory', [])
    
    # Build messages for Bedrock
    messages = history + [{'role': 'user', 'content': message}]
    
    # Call Bedrock
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
        body=json.dumps({
            'anthropic_version': 'bedrock-2023-05-31',
            'max_tokens': 4096,
            'system': system_prompt,
            'messages': messages
        })
    )
    
    result = json.loads(response['body'].read())
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'reply': result['content'][0]['text'],
            'usage': result['usage'],
            'stopReason': result['stop_reason']
        })
    }
```

## Status

✅ Lambda client implemented  
✅ AI abstraction layer updated  
✅ Automatic fallback chain working  
✅ Comprehensive logging added  
✅ Environment variable configured  
✅ Build successful  
⏳ Lambda endpoint needs to be deployed  
⏳ End-to-end testing pending  

## Next Steps

1. Deploy Lambda function to AWS
2. Add Lambda URL to `NEBULA_LAMBDA_ENDPOINT`
3. Test chat functionality with Lambda
4. Monitor Lambda logs and performance
5. Optimize Lambda cold start time if needed
