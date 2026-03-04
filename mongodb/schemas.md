# MongoDB Schemas for Nebula AI

MongoDB is used for storing long-form, unstructured data that doesn't fit well in PostgreSQL.

## Collections

### 1. project_memory

Stores complete project context for Project Memory feature.

```javascript
{
  _id: ObjectId("..."),
  contextId: "uuid-v4-string", // Matches project_metadata.mongodb_context_id in Supabase
  userId: "uuid-string", // Supabase user ID
  projectName: "My Web App",
  projectDescription: "E-commerce platform with React and Node.js",
  
  // Conversation history
  conversations: [
    {
      timestamp: ISODate("2024-01-15T10:30:00Z"),
      role: "user",
      content: "How should I structure my API routes?"
    },
    {
      timestamp: ISODate("2024-01-15T10:30:15Z"),
      role: "assistant",
      content: "For your e-commerce platform, I recommend..."
    }
  ],
  
  // Key decisions made
  decisions: [
    {
      timestamp: ISODate("2024-01-15T10:35:00Z"),
      category: "architecture",
      decision: "Use REST API with Express.js",
      reasoning: "Team familiarity and simpler deployment"
    }
  ],
  
  // Technical stack
  techStack: {
    frontend: ["React", "TypeScript", "TailwindCSS"],
    backend: ["Node.js", "Express", "PostgreSQL"],
    deployment: ["Vercel", "Railway"]
  },
  
  // File references
  files: [
    {
      name: "api-design.md",
      s3Url: "https://...",
      uploadedAt: ISODate("2024-01-15T10:00:00Z")
    }
  ],
  
  // Summary for quick loading
  summary: "E-commerce platform using React frontend with Node.js backend...",
  
  // Metadata
  lastAccessed: ISODate("2024-01-15T11:00:00Z"),
  createdAt: ISODate("2024-01-15T09:00:00Z"),
  updatedAt: ISODate("2024-01-15T11:00:00Z"),
  
  // Version control
  version: 1,
  
  // Tags for organization
  tags: ["ecommerce", "react", "nodejs"]
}
```

**Indexes:**
```javascript
db.project_memory.createIndex({ contextId: 1 }, { unique: true });
db.project_memory.createIndex({ userId: 1 });
db.project_memory.createIndex({ lastAccessed: -1 });
db.project_memory.createIndex({ "tags": 1 });
```

---

### 2. conversation_history

Stores full conversation history for all workspaces (except wellness - that's encrypted in Supabase).

```javascript
{
  _id: ObjectId("..."),
  sessionId: "uuid-v4-string",
  userId: "uuid-string",
  workspaceType: "general_chat", // or explain_assist, debug_workspace, etc.
  
  // Messages
  messages: [
    {
      id: "msg-uuid",
      timestamp: ISODate("2024-01-15T10:30:00Z"),
      role: "user",
      content: "Explain how async/await works in JavaScript",
      metadata: {
        voiceInput: false,
        language: "en"
      }
    },
    {
      id: "msg-uuid",
      timestamp: ISODate("2024-01-15T10:30:15Z"),
      role: "assistant",
      content: "Async/await is syntactic sugar over Promises...",
      metadata: {
        model: "claude-3-sonnet",
        tokensUsed: 450,
        responseTime: 2.3
      }
    }
  ],
  
  // Session metadata
  title: "JavaScript Async/Await Explanation",
  summary: "Discussion about async/await in JavaScript",
  
  // Context
  context: {
    skillLevel: "intermediate",
    language: "en",
    mode: "explain"
  },
  
  // Timestamps
  startedAt: ISODate("2024-01-15T10:30:00Z"),
  lastMessageAt: ISODate("2024-01-15T10:45:00Z"),
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:45:00Z"),
  
  // Status
  isActive: true,
  messageCount: 8
}
```

**Indexes:**
```javascript
db.conversation_history.createIndex({ sessionId: 1 }, { unique: true });
db.conversation_history.createIndex({ userId: 1, workspaceType: 1 });
db.conversation_history.createIndex({ lastMessageAt: -1 });
db.conversation_history.createIndex({ isActive: 1 });
```

---

### 3. chat_sessions

Stores active chat sessions with real-time state.

```javascript
{
  _id: ObjectId("..."),
  sessionId: "uuid-v4-string",
  userId: "uuid-string",
  workspaceType: "general_chat",
  
  // Current state
  currentContext: {
    lastUserMessage: "Tell me about gardening tips",
    conversationTopic: "gardening",
    messageCount: 5
  },
  
  // Temporary data (cleared after session ends)
  tempFiles: [
    {
      fileId: "uuid",
      fileName: "garden-plan.jpg",
      s3Url: "https://...",
      uploadedAt: ISODate("2024-01-15T10:30:00Z")
    }
  ],
  
  // Session settings
  settings: {
    voiceEnabled: true,
    language: "en",
    autoSave: true
  },
  
  // Timestamps
  startedAt: ISODate("2024-01-15T10:00:00Z"),
  lastActivity: ISODate("2024-01-15T10:30:00Z"),
  expiresAt: ISODate("2024-01-15T12:00:00Z"), // Auto-cleanup after 2 hours
  
  // Status
  isActive: true
}
```

**Indexes:**
```javascript
db.chat_sessions.createIndex({ sessionId: 1 }, { unique: true });
db.chat_sessions.createIndex({ userId: 1, isActive: 1 });
db.chat_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

---

## MongoDB Connection Code

```typescript
// src/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the connection
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Helper to get database
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB_NAME || 'nebula-ai');
}

// Helper functions for each collection
export async function getProjectMemoryCollection() {
  const db = await getDatabase();
  return db.collection('project_memory');
}

export async function getConversationHistoryCollection() {
  const db = await getDatabase();
  return db.collection('conversation_history');
}

export async function getChatSessionsCollection() {
  const db = await getDatabase();
  return db.collection('chat_sessions');
}
```

---

## Data Retention Policies

### Automatic Cleanup

1. **chat_sessions**: Auto-delete after 2 hours of inactivity (TTL index)
2. **conversation_history**: Keep for 90 days, then archive or delete
3. **project_memory**: Keep indefinitely unless user deletes

### Manual Cleanup Script

```javascript
// scripts/cleanup-mongodb.js
const { MongoClient } = require('mongodb');

async function cleanup() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('nebula-ai');
  
  // Delete old conversation history (90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const result = await db.collection('conversation_history').deleteMany({
    lastMessageAt: { $lt: ninetyDaysAgo },
    isActive: false
  });
  
  console.log(`Deleted ${result.deletedCount} old conversations`);
  
  await client.close();
}

cleanup();
```

---

## Backup Strategy

### Recommended Approach

1. **MongoDB Atlas Automated Backups**:
   - Enable in Atlas dashboard
   - Continuous backups with point-in-time recovery
   - Retention: 7 days (free tier) or custom

2. **Manual Exports** (for critical data):
```bash
# Export project_memory collection
mongodump --uri="mongodb+srv://..." --collection=project_memory --out=./backup

# Restore
mongorestore --uri="mongodb+srv://..." --collection=project_memory ./backup/nebula-ai/project_memory.bson
```

---

## Performance Optimization

### 1. Indexing Strategy

All indexes are created above. Monitor slow queries:

```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 });

// View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5);
```

### 2. Query Optimization

```javascript
// Good: Use projection to limit fields
db.conversation_history.find(
  { userId: "uuid" },
  { messages: { $slice: -10 }, title: 1, lastMessageAt: 1 }
);

// Bad: Loading entire conversation
db.conversation_history.find({ userId: "uuid" });
```

### 3. Aggregation Pipelines

```javascript
// Get conversation statistics
db.conversation_history.aggregate([
  { $match: { userId: "uuid" } },
  { $group: {
      _id: "$workspaceType",
      count: { $sum: 1 },
      avgMessages: { $avg: "$messageCount" }
    }
  }
]);
```

---

## Security Best Practices

1. **Connection String**: Never commit to git
2. **IP Whitelist**: Restrict access in MongoDB Atlas
3. **User Permissions**: Use read/write user, not admin
4. **Encryption**: Enable encryption at rest in Atlas
5. **Audit Logs**: Enable in Atlas for compliance

---

## Migration from PostgreSQL (if needed)

If you need to move data from Supabase to MongoDB:

```typescript
// scripts/migrate-to-mongodb.ts
import { createClient } from '@supabase/supabase-js';
import { getConversationHistoryCollection } from '../src/lib/mongodb';

async function migrate() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const collection = await getConversationHistoryCollection();
  
  // Fetch data from Supabase
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('*')
    .limit(1000);
  
  if (error) throw error;
  
  // Transform and insert into MongoDB
  const documents = data.map(session => ({
    sessionId: session.id,
    userId: session.user_id,
    workspaceType: session.workspace_type,
    // ... transform other fields
  }));
  
  await collection.insertMany(documents);
  console.log(`Migrated ${documents.length} sessions`);
}

migrate();
```

---

## Testing

```typescript
// __tests__/mongodb.test.ts
import { getProjectMemoryCollection } from '../src/lib/mongodb';

describe('MongoDB Operations', () => {
  it('should create and retrieve project memory', async () => {
    const collection = await getProjectMemoryCollection();
    
    const testDoc = {
      contextId: 'test-uuid',
      userId: 'user-uuid',
      projectName: 'Test Project',
      conversations: [],
      decisions: [],
      createdAt: new Date()
    };
    
    await collection.insertOne(testDoc);
    
    const retrieved = await collection.findOne({ contextId: 'test-uuid' });
    expect(retrieved?.projectName).toBe('Test Project');
    
    // Cleanup
    await collection.deleteOne({ contextId: 'test-uuid' });
  });
});
```

---

## Monitoring

### Key Metrics to Track

1. **Query Performance**: Slow queries > 100ms
2. **Connection Pool**: Active connections
3. **Storage**: Database size growth
4. **Indexes**: Index usage statistics

### MongoDB Atlas Monitoring

- Enable alerts for:
  - High CPU usage (> 80%)
  - Low disk space (< 20%)
  - Connection spikes
  - Slow queries

---

This completes the MongoDB schema documentation. All collections are designed for optimal performance and scalability.
