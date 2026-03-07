# Bedrock Model Configuration Refactor Guide

## Overview

This guide explains how to refactor your AWS Lambda function to use the `BEDROCK_MODEL` environment variable instead of hardcoded model IDs.

## Problem

The Lambda function currently has a hardcoded Bedrock model ID:
```javascript
modelId: "us.anthropic.claude-3-haiku-20240307-v1:0"
```

This makes it difficult to:
- Switch between different Claude models
- Handle model version updates
- Test with different models in different environments

## Solution

Move the model ID to an environment variable for flexibility and maintainability.

## Implementation Steps

### Step 1: Update Lambda Function Code

Locate the Bedrock invocation in your Lambda handler and update it:

**BEFORE:**
```javascript
const command = new InvokeModelCommand({
  modelId: "us.anthropic.claude-3-haiku-20240307-v1:0",
  body: JSON.stringify(payload),
  contentType: "application/json"
});
```

**AFTER:**
```javascript
// Validate environment variable exists
if (!process.env.BEDROCK_MODEL) {
  throw new Error("BEDROCK_MODEL environment variable is not defined");
}

const command = new InvokeModelCommand({
  modelId: process.env.BEDROCK_MODEL,
  body: JSON.stringify(payload),
  contentType: "application/json"
});
```

### Step 2: Add Environment Variable to Lambda

In AWS Lambda Console:

1. Navigate to your Lambda function
2. Go to **Configuration** → **Environment variables**
3. Click **Edit**
4. Add new environment variable:
   - **Key**: `BEDROCK_MODEL`
   - **Value**: `us.anthropic.claude-3-haiku-20240307-v1:0`
5. Click **Save**

### Step 3: Update Local Environment

The `.env.local` file has been updated with:
```env
BEDROCK_MODEL=us.anthropic.claude-3-haiku-20240307-v1:0
```

This ensures consistency between local development and Lambda deployment.

### Step 4: Deploy Lambda Function

Deploy your updated Lambda function code:

```bash
# If using AWS SAM
sam build
sam deploy

# If using AWS CLI
zip function.zip index.js
aws lambda update-function-code \
  --function-name your-function-name \
  --zip-file fileb://function.zip
```

### Step 5: Test the Changes

Test with a sample event:

```json
{
  "body": "{\"message\":\"Hello\"}"
}
```

Expected response:
```json
{
  "type": "chat",
  "reply": "Hello! How can I assist you today?"
}
```

## Available Bedrock Models

You can now easily switch between models by updating the environment variable:

### Claude 3.5 Sonnet (Recommended for production)
```
us.anthropic.claude-3-5-sonnet-20240620-v1:0
```
- Best reasoning and coding capabilities
- Higher cost per token
- Slower response time

### Claude 3 Haiku (Current - Fast and cost-effective)
```
us.anthropic.claude-3-haiku-20240307-v1:0
```
- Fast response time
- Lower cost per token
- Good for general chat

### Claude 3 Sonnet (Balanced)
```
anthropic.claude-3-sonnet-20240229-v1:0
```
- Balanced performance and cost
- Good reasoning capabilities

## Validation Checklist

- [ ] Lambda function code updated with `process.env.BEDROCK_MODEL`
- [ ] Environment variable validation added
- [ ] `BEDROCK_MODEL` added to Lambda environment variables
- [ ] `.env.local` updated with `BEDROCK_MODEL`
- [ ] Lambda function deployed
- [ ] Test event executed successfully
- [ ] Chat functionality tested end-to-end

## Rollback Plan

If issues occur:

1. **Quick Fix**: Update Lambda environment variable back to working model
2. **Code Rollback**: Revert Lambda function code to previous version
3. **Verify**: Test with sample event

## Benefits

✅ **Flexibility** - Switch models without code changes  
✅ **Environment-specific** - Use different models in dev/staging/prod  
✅ **Version Control** - Easy to track model changes  
✅ **Testing** - Test with different models easily  
✅ **Maintenance** - Update model versions without redeployment  

## Important Notes

### DO NOT Modify
- Rekognition integration
- Durable Execution wrapper
- Lambda handler structure
- API request format
- Response JSON structure

### Only Changed
- How the model ID is loaded (from environment variable)
- Added validation for environment variable

## Troubleshooting

### Error: "BEDROCK_MODEL environment variable is not defined"

**Cause**: Environment variable not set in Lambda

**Solution**: 
1. Go to Lambda Console
2. Configuration → Environment variables
3. Add `BEDROCK_MODEL` with appropriate value

### Error: "ValidationException: The provided model identifier is invalid"

**Cause**: Invalid model ID in environment variable

**Solution**:
1. Verify model ID format matches AWS Bedrock model IDs
2. Check model is available in your AWS region
3. Ensure model ID includes version suffix (e.g., `-v1:0`)

### Lambda Still Using Old Model

**Cause**: Lambda function code not deployed

**Solution**:
1. Verify code changes were saved
2. Redeploy Lambda function
3. Check Lambda version/alias if using versioning

## Next Steps

After successful implementation:

1. **Monitor Performance**: Check CloudWatch logs for any issues
2. **Test Different Models**: Try Claude 3.5 Sonnet for better responses
3. **Document Changes**: Update team documentation
4. **Set Up Alerts**: Create CloudWatch alarms for Lambda errors

## Example Lambda Function (Complete)

Here's a complete example of the refactored Lambda function:

```javascript
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

exports.handler = async (event) => {
  try {
    // Validate environment variable
    if (!process.env.BEDROCK_MODEL) {
      throw new Error("BEDROCK_MODEL environment variable is not defined");
    }

    const body = JSON.parse(event.body);
    const { message, systemPrompt, conversationHistory = [] } = body;

    // Build messages array
    const messages = [
      ...conversationHistory,
      { role: "user", content: message }
    ];

    // Prepare Bedrock payload
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      messages: messages,
      ...(systemPrompt && { system: systemPrompt })
    };

    // Invoke Bedrock with environment variable
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL,
      body: JSON.stringify(payload),
      contentType: "application/json"
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reply: responseBody.content[0].text,
        usage: responseBody.usage,
        stopReason: responseBody.stop_reason
      })
    };
  } catch (error) {
    console.error("Lambda error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## Summary

This refactor makes your Lambda function more maintainable and flexible by:
- Removing hardcoded model IDs
- Adding environment variable configuration
- Enabling easy model switching
- Improving error handling

The change is minimal, focused, and doesn't affect any other system components.
