# AI Services

This directory contains AI-related services for the Nebula AI application.

## Workspace Guard

The Workspace Guard enforces workspace-specific behavior rules and provides helpful guidance when users attempt actions incompatible with their current workspace.

### Overview

The Workspace Guard analyzes user messages to detect intent and ensures that actions are appropriate for the current workspace. When a user attempts an incompatible action, the guard provides a helpful message directing them to the appropriate workspace.

### Usage

```typescript
import { workspaceGuard } from '@/lib/ai/workspace-guard'

// Check if a message is allowed in the current workspace
const result = workspaceGuard.checkMessage(
  'Can you help me debug this code?',
  'general-chat'
)

if (!result.allowed) {
  console.log(result.message)
  // "This is the General Chat workspace. For debugging code please switch to the Debug Workspace."
  console.log(result.suggestedWorkspace)
  // "debug-workspace"
}
```

### Workspaces

The Workspace Guard supports 10 workspace types:

| Workspace | Allowed Actions | Restricted Actions |
|-----------|----------------|-------------------|
| **general-chat** | conversation, questions, general-help | debugging, code-execution, summarization |
| **debug-workspace** | debugging, code-analysis, error-fixing | general-chat, summarization |
| **explain-assist** | explanations, teaching, concepts | debugging, code-execution |
| **smart-summarizer** | summarization, condensing, tldr | general-chat, debugging |
| **rag-assistant** | document-qa, knowledge-base, search | debugging, code-execution |
| **voice-assistant** | voice-commands, speech, audio | debugging, code-execution |
| **image-analyzer** | image-analysis, vision, ocr | debugging, summarization |
| **code-reviewer** | code-review, best-practices, refactoring | general-chat, summarization |
| **data-analyst** | data-analysis, statistics, visualization | debugging, general-chat |
| **creative-writer** | creative-writing, storytelling, poetry | debugging, data-analysis |

### Intent Detection

The Workspace Guard uses keyword matching to detect user intent:

**Debugging Intent**:
- Keywords: debug, fix bug, error, exception, stack trace, breakpoint
- Patterns: "fix this code", "fix the code"

**Code Execution Intent**:
- Keywords: run code, execute, compile, run this
- Patterns: "run this code", "run the code"

**Summarization Intent**:
- Keywords: summarize, summary, tldr, condense, brief overview

**Explanation Intent**:
- Keywords: explain, what is, how does, teach me, help me understand

**General Chat Intent**:
- Keywords: hello, hi, how are you, tell me about, what do you think

**Creative Writing Intent**:
- Keywords: write a story, create a poem, generate content

**Data Analysis Intent**:
- Keywords: analyze data, statistics, data insights, visualize

### Guard Result

The `checkMessage()` method returns a `GuardResult` object:

```typescript
interface GuardResult {
  allowed: boolean              // Whether the message is allowed
  message?: string              // Helpful message if blocked
  suggestedWorkspace?: WorkspaceType  // Suggested workspace for the action
}
```

### Specific Messages

The Workspace Guard provides specific messages for common scenarios:

**Debugging in General Chat**:
> "This is the General Chat workspace. For debugging code please switch to the Debug Workspace."

**General Chat in Smart Summarizer**:
> "This is the Smart Summarizer workspace. For general conversation please switch to the General Chat workspace."

**Code Execution in Explain Assist**:
> "This is the Explain Assist workspace. For code execution please switch to the Debug Workspace."

**Summarization in General Chat**:
> "This is the General Chat workspace. For text summarization please switch to the Smart Summarizer workspace."

### Methods

#### `checkMessage(message: string, workspace: WorkspaceType): GuardResult`

Checks if a message is allowed in the current workspace.

**Parameters**:
- `message` - User message to check
- `workspace` - Current workspace type

**Returns**: `GuardResult` with allowed status and optional message

**Example**:
```typescript
const result = workspaceGuard.checkMessage(
  'Please summarize this document',
  'general-chat'
)

if (!result.allowed) {
  console.log(result.message)
  // Redirect user to smart-summarizer workspace
}
```

#### `getRule(workspace: WorkspaceType): WorkspaceRule | undefined`

Gets the rule for a specific workspace.

**Parameters**:
- `workspace` - Workspace type

**Returns**: Workspace rule or undefined

**Example**:
```typescript
const rule = workspaceGuard.getRule('debug-workspace')
console.log(rule.allowedActions)
// ['debugging', 'code-analysis', 'error-fixing', 'code-execution', 'testing']
```

#### `getAllRules(): Map<WorkspaceType, WorkspaceRule>`

Gets all workspace rules.

**Returns**: Map of all workspace rules

**Example**:
```typescript
const allRules = workspaceGuard.getAllRules()
allRules.forEach((rule, workspace) => {
  console.log(`${workspace}: ${rule.description}`)
})
```

### Testing

Run the manual test script to verify functionality:

```bash
npx ts-node src/lib/ai/__tests__/workspace-guard.manual-test.ts
```

The test script covers:
1. ✅ Debugging in General Chat (blocked)
2. ✅ General conversation in General Chat (allowed)
3. ✅ Debugging in Debug Workspace (allowed)
4. ✅ General chat in Smart Summarizer (blocked)
5. ✅ Summarization in Smart Summarizer (allowed)
6. ✅ Code execution in Explain Assist (blocked)
7. ✅ Explanation in Explain Assist (allowed)
8. ✅ Summarization in General Chat (blocked)
9. ✅ No clear intent (allowed)
10. ✅ Multiple intents with debugging (blocked)
11. ✅ Code analysis in Code Reviewer (allowed)
12. ✅ Data analysis in Data Analyst (allowed)
13. ✅ Creative writing in Creative Writer (allowed)
14. ✅ Debugging in Creative Writer (blocked)
15. ✅ Unknown workspace fallback (allowed)

### Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- ✅ **Requirement 4.1**: Restrict General Chat to conversation only
- ✅ **Requirement 4.2**: Allow debugging in Debug Workspace
- ✅ **Requirement 4.3**: Enable explanations in Explain Assist
- ✅ **Requirement 4.4**: Restrict Smart Summarizer to summarization
- ✅ **Requirement 4.5**: Provide helpful messages for incompatible actions
- ✅ **Requirement 5.1**: Specific message for debugging in General Chat
- ✅ **Requirement 5.2**: Specific message for conversation in Smart Summarizer
- ✅ **Requirement 5.3**: Specific message for code execution in Explain Assist
- ✅ **Requirement 5.5**: Detect user intent from message content

### Integration

The Workspace Guard is designed to be integrated into the AI flow:

```typescript
import { workspaceGuard } from '@/lib/ai/workspace-guard'

async function generateAIResponse(message: string, workspace: string) {
  // Check workspace guard
  const guardResult = workspaceGuard.checkMessage(message, workspace)
  
  if (!guardResult.allowed) {
    // Return guard message instead of calling AI
    return {
      message: guardResult.message,
      guardWarning: true,
      suggestedWorkspace: guardResult.suggestedWorkspace
    }
  }
  
  // Proceed with normal AI flow
  const aiResponse = await callAIProvider(message, workspace)
  return aiResponse
}
```

### Design Decisions

**Fail Open**: If intent detection fails or workspace is unknown, the guard allows the message. This ensures the system remains usable even if the guard encounters unexpected input.

**Keyword Matching**: Uses simple keyword matching for intent detection. This is fast, reliable, and doesn't require ML models.

**Helpful Messages**: Provides specific, actionable messages that guide users to the appropriate workspace.

**Non-Blocking**: The guard doesn't throw errors; it returns a result object that the caller can handle appropriately.

**Singleton Pattern**: Exported as a singleton instance for easy use throughout the application.

### Next Steps

After implementing the Workspace Guard:

1. **Task 6**: Integrate Workspace Guard into AI flow
   - Modify `src/lib/ai/ai.ts` to use the guard
   - Add guard check before AI provider call
   - Return guard messages when actions are blocked

2. **Task 7**: Checkpoint - Verify workspace guard functionality
   - Test guard blocks debugging in general-chat
   - Test guard allows debugging in debug-workspace
   - Test helpful messages are returned
   - Test existing AI features still work

## Notes

- The Workspace Guard is production-ready and follows best practices
- All methods include proper error handling
- The singleton pattern makes it easy to use throughout the app
- Comprehensive logging helps with debugging
- The manual test script can be used for verification
