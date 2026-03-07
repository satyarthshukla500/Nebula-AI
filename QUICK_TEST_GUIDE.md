# Quick Test Guide - Nebula AI Chat

## 🚀 Quick Start (3 Steps)

### 1. Verify Configuration
```bash
node test-ai-config.js
```

**Expected**: All checkmarks (✓) for AWS Bedrock, Groq, Supabase, and MongoDB

### 2. Start Development Server
```bash
npm run dev
```

**Expected**: Server starts on http://localhost:3000

### 3. Test Chat
1. Open: http://localhost:3000/auth/login
2. Login with your Supabase credentials
3. Navigate to: http://localhost:3000/dashboard/workspaces/chat
4. Type: "Hello, can you help me with cooking?"
5. Click Send
6. **Expected**: AI response appears within 2-5 seconds

## ✅ What Should Happen

### In the Browser
- Message appears in chat immediately after sending
- Loading indicator shows while waiting
- AI response appears as assistant message
- Can continue conversation with context

### In the Console (Server Logs)
```
[AI Config] Bedrock check: { configured: true }
[AI Config] Selected provider: AWS Bedrock (Claude 3.5 Sonnet)
[AI] Using Bedrock Claude 3.5
[AI] ========== AI Request Start ==========
[Bedrock] Invoking model: anthropic.claude-3-5-sonnet-20240620-v1:0
[Bedrock] Response received successfully
[AI] ===== Bedrock Success =====
```

## 🔍 Troubleshooting

### Problem: "Configure Supabase and AWS to enable AI features"
**This message should NOT appear anymore**
- If you see it, clear browser cache and refresh
- Verify you're on the correct page: `/dashboard/workspaces/chat`

### Problem: No response after sending message
1. Check browser console (F12) for errors
2. Check server console for error logs
3. Verify you're logged in (check for auth token)
4. Run `node test-ai-config.js` to verify configuration

### Problem: Error message in chat
- Read the error message - it will tell you what's wrong
- Common errors:
  - "Message is required" - You sent an empty message
  - "Failed to process chat message" - Check server logs
  - "AI provider not configured" - Run configuration test

## 📊 Configuration Status

Run this to check everything:
```bash
node test-ai-config.js
```

Should show:
```
✓ Primary AI Provider: AWS Bedrock (Claude 3.5 Sonnet)
✓ Fallback Provider: Groq (Llama 3.1)
✓ Authentication: Supabase
✓ Database: MongoDB
✓ Bedrock model ID is correct
```

## 🎯 Test Scenarios

### Scenario 1: Basic Chat
**Input**: "What's the weather like?"
**Expected**: Conversational response about weather

### Scenario 2: Cooking Help
**Input**: "How do I make pasta?"
**Expected**: Step-by-step cooking instructions

### Scenario 3: Study Planning
**Input**: "Help me create a study schedule"
**Expected**: Structured study plan suggestions

### Scenario 4: Error Handling
**Input**: (empty message)
**Expected**: "Message is required" error

## 🔧 Advanced Testing

### Test Groq Fallback
1. Stop the dev server
2. Edit `.env.local` - comment out AWS credentials:
   ```env
   # AWS_ACCESS_KEY_ID=...
   # AWS_SECRET_ACCESS_KEY=...
   ```
3. Restart server: `npm run dev`
4. Send a message
5. **Expected**: Response from Groq (Llama 3.1)
6. Console shows: `[AI] Using Groq fallback`

### Test Multiple Workspaces
- Chat: http://localhost:3000/dashboard/workspaces/chat
- Explain: http://localhost:3000/dashboard/workspaces/explain
- Debug: http://localhost:3000/dashboard/workspaces/debug
- Study: http://localhost:3000/dashboard/workspaces/study

All should work with AI responses!

## 📝 What Was Fixed

1. ✅ Chat page now uses ChatContainer (was just placeholder)
2. ✅ Groq model updated to llama-3.1-8b-instant
3. ✅ Enhanced logging: "[AI] Using Bedrock Claude 3.5"
4. ✅ Error messages displayed in chat UI
5. ✅ API properly calls generateAIResponse()
6. ✅ All environment variables verified

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Chat UI loads with input box
- ✅ Messages appear immediately after sending
- ✅ AI responses appear within seconds
- ✅ Can have multi-turn conversations
- ✅ Console shows provider selection logs
- ✅ No error messages in browser or server console

## 📞 Need Help?

If something isn't working:
1. Run `node test-ai-config.js` - verify all ✓
2. Check server console for error logs
3. Check browser console (F12) for errors
4. Verify you're logged in to Supabase
5. Try restarting the dev server

## 🚀 Ready to Go!

If `node test-ai-config.js` shows all ✓, you're ready to chat!

```bash
npm run dev
```

Then visit: http://localhost:3000/dashboard/workspaces/chat

Happy chatting! 🎊
