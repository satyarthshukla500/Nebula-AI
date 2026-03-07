# Task 7 Verification Guide: Workspace Guard Functionality

## Overview

This guide provides step-by-step instructions to verify that the workspace guard is properly integrated and functioning correctly.

## Automated Verification

### Step 1: Run Verification Script

**Windows (PowerShell):**
```powershell
.\verify-task-7.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x verify-task-7.sh
./verify-task-7.sh
```

The script checks:
1. ✅ Workspace guard implementation exists
2. ✅ AI service integration complete
3. ✅ API route enhancement complete
4. ✅ Integration test exists
5. ✅ Manual test exists
6. ✅ TypeScript compilation passes
7. ✅ Documentation exists
8. ✅ Completion summary exists

## Manual Testing

### Step 2: Start Development Server

```bash
npm run dev
```

Wait for the server to start on `http://localhost:3000`

### Step 3: Run Integration Tests

#### Test 1: API Integration Test

This test verifies the workspace guard works through the API:

```bash
npx ts-node src/app/api/workspaces/__tests__/guard-integration.manual-test.ts
```

**Expected Results:**
- ✅ Debug in General Chat (should block)
- ✅ Debug in Debug Workspace (should allow)
- ✅ General Chat in General Chat (should allow)
- ✅ Summarize in General Chat (should block)
- ✅ Summarize in Smart Summarizer (should allow)
- ✅ Execute Code in Explain Assist (should block)
- ✅ Explain in Explain Assist (should allow)

#### Test 2: Workspace Guard Unit Test

This test verifies the workspace guard logic directly:

```bash
npx ts-node src/lib/ai/__tests__/workspace-guard.manual-test.ts
```

**Expected Results:**
- ✅ All 15 test cases pass
- ✅ Intent detection works correctly
- ✅ Helpful messages are generated
- ✅ Workspace suggestions are accurate

### Step 4: Manual Browser Testing

#### Test Case 1: Debug in General Chat (Should Block)

1. Navigate to `http://localhost:3000/dashboard/workspaces/chat`
2. Send message: "Debug this code for me"
3. **Expected:** Guard blocks with message:
   ```
   This is the General Chat workspace. For debugging code please switch to the Debug Workspace.
   ```
4. **Verify:** Response includes `guardWarning: true` and `suggestedWorkspace: 'debug-workspace'`

#### Test Case 2: Debug in Debug Workspace (Should Allow)

1. Navigate to `http://localhost:3000/dashboard/workspaces/debug`
2. Send message: "Debug this code for me"
3. **Expected:** AI responds normally (no guard block)
4. **Verify:** Response includes `guardWarning: false` or undefined

#### Test Case 3: Summarize in General Chat (Should Block)

1. Navigate to `http://localhost:3000/dashboard/workspaces/chat`
2. Send message: "Summarize this text for me"
3. **Expected:** Guard blocks with message:
   ```
   This is the General Chat workspace. For text summarization please switch to the Smart Summarizer workspace.
   ```
4. **Verify:** Response includes `guardWarning: true` and `suggestedWorkspace: 'smart-summarizer'`

#### Test Case 4: General Chat in General Chat (Should Allow)

1. Navigate to `http://localhost:3000/dashboard/workspaces/chat`
2. Send message: "Hello, how are you?"
3. **Expected:** AI responds normally (no guard block)
4. **Verify:** Response includes `guardWarning: false` or undefined

### Step 5: Verify Existing Features Still Work

#### Test RAG Functionality

1. Navigate to `http://localhost:3000/dashboard/workspaces/knowledge`
2. Upload a document (if not already uploaded)
3. Ask a question about the document
4. **Expected:** RAG retrieves relevant context and AI responds
5. **Verify:** No guard interference with RAG workspace

#### Test Voice Input

1. Navigate to any workspace
2. Click the microphone button
3. Speak a message
4. **Expected:** Voice input works normally
5. **Verify:** Guard only checks text content, not input method

#### Test Image Analysis

1. Navigate to image analyzer workspace (if available)
2. Upload an image
3. Ask about the image
4. **Expected:** Image analysis works normally
5. **Verify:** Guard doesn't interfere with image workspace

#### Test All Workspace Types

Test that all 10 workspace types function correctly:

1. ✅ General Chat - `http://localhost:3000/dashboard/workspaces/chat`
2. ✅ Debug Workspace - `http://localhost:3000/dashboard/workspaces/debug`
3. ✅ Explain Assist - `http://localhost:3000/dashboard/workspaces/explain`
4. ✅ Smart Summarizer - `http://localhost:3000/dashboard/workspaces/summarizer`
5. ✅ RAG Assistant - `http://localhost:3000/dashboard/workspaces/knowledge`
6. ✅ Voice Assistant - (if implemented)
7. ✅ Image Analyzer - (if implemented)
8. ✅ Code Reviewer - (if implemented)
9. ✅ Data Analyst - (if implemented)
10. ✅ Creative Writer - (if implemented)

### Step 6: Verify AI Provider Fallback Chain

Test that the AI provider fallback chain still works:

1. **With Lambda configured:** Verify Lambda is used
2. **Without Lambda:** Verify Bedrock fallback works
3. **Without Lambda/Bedrock:** Verify Groq fallback works
4. **With guard block:** Verify no AI provider is called (fast response)

Check console logs for provider selection:
```
[AI Config] Selected provider: AWS Lambda (default)
[AI] ===== Checking Workspace Guard =====
[AI] ===== Workspace Guard Passed =====
[AI] ===== Using AWS Lambda Backend =====
```

Or when blocked:
```
[AI] ===== Checking Workspace Guard =====
[AI] ===== Workspace Guard Blocked =====
[AI] ========== AI Request End (Blocked by Guard) ==========
```

## Verification Checklist

### Core Functionality
- [ ] Guard blocks debugging in general-chat
- [ ] Guard allows debugging in debug-workspace
- [ ] Guard blocks summarization in general-chat
- [ ] Guard allows summarization in smart-summarizer
- [ ] Guard blocks code execution in explain-assist
- [ ] Guard allows explanations in explain-assist
- [ ] Guard allows general chat in general-chat

### Helpful Messages
- [ ] Guard messages are clear and helpful
- [ ] Guard suggests appropriate alternative workspace
- [ ] Guard messages match expected format

### Integration
- [ ] Guard check happens before AI provider call
- [ ] Guard blocks return immediately (no AI call)
- [ ] Guard allows proceed with normal AI flow
- [ ] API responses include guardWarning field
- [ ] API responses include suggestedWorkspace field

### Backward Compatibility
- [ ] RAG functionality works normally
- [ ] Voice input works normally
- [ ] Image analysis works normally
- [ ] All workspace types function correctly
- [ ] AI provider fallback chain intact
- [ ] AWS service integrations unchanged

### Performance
- [ ] Guard blocks are fast (no network delay)
- [ ] Guard allows have minimal overhead
- [ ] No performance degradation in normal flow

### Code Quality
- [ ] TypeScript compilation passes
- [ ] No linting errors
- [ ] Build succeeds
- [ ] All diagnostics clean

## Troubleshooting

### Issue: Guard not blocking when expected

**Solution:**
1. Check workspace type is passed correctly to AI service
2. Verify intent detection keywords match your message
3. Check console logs for guard decision

### Issue: Guard blocking when it shouldn't

**Solution:**
1. Review intent detection logic in `workspace-guard.ts`
2. Check if message contains restricted keywords
3. Adjust keyword matching if needed

### Issue: API response missing guard fields

**Solution:**
1. Verify API route includes guard fields in response
2. Check AI service returns guard fields in AIResponse
3. Ensure workspace type is passed to generateAIResponse()

### Issue: Existing features broken

**Solution:**
1. Check if guard is blocking legitimate workspace actions
2. Verify workspace type mapping is correct
3. Review guard rules for the affected workspace

## Success Criteria

Task 7 is complete when:

1. ✅ All automated checks pass
2. ✅ All integration tests pass
3. ✅ Manual browser testing confirms guard behavior
4. ✅ Existing features continue to work
5. ✅ No TypeScript errors
6. ✅ Build succeeds
7. ✅ Documentation is complete

## Next Steps

After Task 7 verification is complete:

1. Mark Task 7 as complete in tasks.md
2. Proceed to Task 8: Implement File Upload Service
3. Continue with the implementation plan

## Additional Resources

- **Workspace Guard Implementation:** `src/lib/ai/workspace-guard.ts`
- **AI Service Integration:** `src/lib/ai.ts`
- **API Route Enhancement:** `src/app/api/workspaces/chat/route.ts`
- **Integration Documentation:** `WORKSPACE_GUARD_INTEGRATION.md`
- **Task 6 Summary:** `TASK_6_COMPLETION_SUMMARY.md`
