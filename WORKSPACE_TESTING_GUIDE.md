# Workspace Testing Guide

## 🎯 Quick Test (5 Minutes)

### Test Workspace Isolation

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Login**: Navigate to http://localhost:3000/auth/login

3. **Test General Chat**:
   - Go to: http://localhost:3000/dashboard/workspaces/chat
   - Send: "Hello, I need help with cooking pasta"
   - **Expected**: Friendly response about cooking
   - Note the conversational, helpful tone

4. **Test Debug Workspace**:
   - Go to: http://localhost:3000/dashboard/workspaces/debug
   - **Expected**: Empty conversation (no cooking messages!)
   - Send: "I have a bug in my code"
   - **Expected**: AI asks what language and what you're debugging
   - Note the technical, debugging-focused tone

5. **Test Explain Workspace**:
   - Go to: http://localhost:3000/dashboard/workspaces/explain
   - **Expected**: Empty conversation (no previous messages!)
   - Send: "Explain how React hooks work"
   - **Expected**: Clear, educational explanation
   - Note the teaching-focused tone

6. **Return to General Chat**:
   - Go back to: http://localhost:3000/dashboard/workspaces/chat
   - **Expected**: Your cooking conversation is still there!
   - Send another message
   - **Expected**: AI continues the cooking conversation

## ✅ Success Indicators

### Workspace Isolation ✓
- Each workspace shows only its own messages
- Switching workspaces doesn't mix conversations
- Returning to a workspace shows previous messages

### System Prompts ✓
- General Chat: Friendly, daily life assistance
- Debug: Asks about language and debugging needs
- Explain: Educational, clear explanations
- Summarizer: Offers to summarize content

### Persistence ✓
- Messages survive page refresh (F5)
- Messages survive browser close/reopen
- Each workspace maintains its own history

## 📋 Detailed Test Scenarios

### Scenario 1: Multiple Workspace Conversations

**Steps**:
1. General Chat → "Help me plan dinner"
2. Debug → "I have a Python error: NameError"
3. Explain → "What is machine learning?"
4. Summarizer → "Summarize this: [paste long text]"
5. Navigate back through all workspaces

**Expected**:
- Each workspace has its own conversation
- No message mixing
- All conversations preserved

### Scenario 2: System Prompt Verification

**General Chat Test**:
```
You: "Help me"
AI: Should offer help with cooking, gardening, cleaning, study, etc.
```

**Debug Test**:
```
You: "Help me"
AI: Should ask what programming language and what to debug
```

**Explain Test**:
```
You: "Help me"
AI: Should offer to explain concepts clearly and simply
```

**Summarizer Test**:
```
You: "Help me"
AI: Should offer to summarize text, code, or workflows
```

### Scenario 3: Persistence Test

**Steps**:
1. Open General Chat
2. Send 3 messages
3. Refresh page (F5)
4. **Expected**: All 3 messages still there
5. Navigate to Debug
6. Send 2 messages
7. Close browser completely
8. Reopen browser
9. Navigate to Debug
10. **Expected**: 2 messages still there
11. Navigate to General Chat
12. **Expected**: 3 messages still there

### Scenario 4: Conversation Context

**General Chat**:
```
You: "I want to cook pasta"
AI: [Gives pasta recipe]
You: "What about the sauce?"
AI: [Continues with sauce suggestions - remembers pasta context]
```

**Debug**:
```
You: "I have a Python error"
AI: [Asks for details]
You: "NameError: name 'x' is not defined"
AI: [Explains NameError - remembers Python context]
```

## 🔍 Console Verification

### When Switching Workspaces

**General Chat**:
```
[Chat API] Workspace: general_chat
[Chat API] System prompt: You are a helpful AI assistant for daily tasks...
```

**Debug**:
```
[Chat API] Workspace: debug
[Chat API] System prompt: You are an expert software debugging assistant...
```

**Explain**:
```
[Chat API] Workspace: explain
[Chat API] System prompt: You are an AI teacher...
```

## 🐛 Troubleshooting

### Problem: Messages appear in wrong workspace
**Check**:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Find `nebula-chat-storage`
4. Verify structure has separate workspace keys

**Fix**: Clear localStorage and refresh

### Problem: Same system prompt for all workspaces
**Check**:
1. Look at server console logs
2. Verify `[Chat API] Workspace:` shows correct workspace
3. Verify `[Chat API] System prompt:` changes per workspace

**Fix**: Check workspace IDs match in pages and config

### Problem: Conversations not persisting
**Check**:
1. Browser localStorage enabled?
2. Private/Incognito mode? (localStorage may not persist)
3. Storage quota exceeded?

**Fix**: Use normal browser mode, clear old data

## 📊 localStorage Structure

Open DevTools → Application → Local Storage → Check `nebula-chat-storage`:

```json
{
  "state": {
    "conversations": {
      "general_chat": {
        "messages": [
          {
            "id": "uuid-1",
            "role": "user",
            "content": "Hello",
            "timestamp": "2024-..."
          },
          {
            "id": "uuid-2",
            "role": "assistant",
            "content": "Hi! How can I help?",
            "timestamp": "2024-..."
          }
        ],
        "sessionId": "session-uuid-1"
      },
      "debug": {
        "messages": [...],
        "sessionId": "session-uuid-2"
      }
    }
  }
}
```

## 🎨 Expected AI Personalities

### General Chat
- Tone: Friendly, conversational
- Focus: Daily life, practical advice
- Examples: Cooking, gardening, cleaning, study tips

### Debug
- Tone: Technical, analytical
- Focus: Code debugging, error analysis
- Examples: Bug identification, code fixes, best practices

### Explain
- Tone: Educational, patient
- Focus: Clear explanations, teaching
- Examples: Concept breakdowns, analogies, step-by-step

### Summarizer
- Tone: Concise, structured
- Focus: Key points extraction
- Examples: Text summaries, code summaries, bullet points

## ✨ Advanced Tests

### Test 1: Long Conversation Context
1. Have a 10-message conversation in General Chat
2. Switch to Debug
3. Have a 10-message conversation
4. Return to General Chat
5. **Expected**: AI remembers all 10 messages of context

### Test 2: Clear Workspace
1. Open General Chat with messages
2. Open DevTools Console
3. Run: `localStorage.clear()`
4. Refresh page
5. **Expected**: All conversations cleared

### Test 3: Multiple Browser Tabs
1. Open General Chat in Tab 1
2. Send messages
3. Open General Chat in Tab 2
4. **Expected**: Same messages appear (shared localStorage)
5. Send message in Tab 2
6. Refresh Tab 1
7. **Expected**: New message appears

## 🚀 Performance Check

### Load Time
- Initial page load: < 2 seconds
- Workspace switch: < 500ms
- Message send: 2-5 seconds (AI response time)

### Memory Usage
- Check DevTools → Memory
- Each workspace conversation: ~1-5 KB
- Total storage: Should stay under 5 MB

## 📝 Test Checklist

- [ ] General Chat has its own conversation
- [ ] Debug has its own conversation
- [ ] Explain has its own conversation
- [ ] Summarizer has its own conversation
- [ ] Switching workspaces loads correct messages
- [ ] No message mixing between workspaces
- [ ] Each workspace uses correct system prompt
- [ ] Conversations persist after refresh
- [ ] Conversations persist after browser close
- [ ] localStorage structure is correct
- [ ] Console logs show correct workspace
- [ ] AI responses match workspace personality
- [ ] Can have long conversations with context
- [ ] Multiple tabs share same conversations

## 🎉 Success!

If all tests pass, you have:
- ✅ Fully isolated workspace conversations
- ✅ Workspace-specific AI personalities
- ✅ Persistent conversation history
- ✅ Seamless workspace switching
- ✅ Context-aware AI responses

Your Nebula AI workspaces are ready for production use! 🚀
