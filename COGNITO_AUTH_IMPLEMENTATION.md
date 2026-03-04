# AWS Cognito JWT Authentication Implementation

## Overview

This document describes the AWS Cognito JWT authentication integration into the Nebula AI Next.js application. The implementation uses a production-grade architecture with token-based authentication (JWT) and supports multiple authentication providers through an abstraction layer.

## Architecture

### Auth Abstraction Layer

The authentication system uses a provider pattern that allows switching between Supabase and AWS Cognito without changing route code.

**Location**: `src/lib/auth/`

**Files**:
- `types.ts` - TypeScript interfaces for auth system
- `cognitoProvider.ts` - AWS Cognito JWT provider implementation
- `supabaseProvider.ts` - Supabase auth provider implementation
- `index.ts` - Main auth interface and provider factory
- `withAuth.ts` - Higher-order function for protecting routes

### Cognito JWT Verification

**Location**: `src/lib/cognito.ts`

**Features**:
- Uses `jose` library for JWT verification
- Fetches JWKS from Cognito endpoint
- Verifies token issuer and signature
- Extracts user claims from JWT payload

**Configuration**:
- Region: `us-east-1`
- User Pool ID: `us-east-1_cgTtku27r`
- JWKS URL: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_cgTtku27r/.well-known/jwks.json`

## Environment Configuration

Add to `.env.local`:

```env
# Authentication Provider
# Options: 'cognito' | 'supabase'
# Default: 'supabase'
AUTH_PROVIDER=supabase
```

To switch to Cognito authentication, change to:
```env
AUTH_PROVIDER=cognito
```

## Usage

### Protecting API Routes

#### Method 1: Using `withAuth` wrapper (Recommended)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'

export const POST = withAuth(async (request: NextRequest, user) => {
  // user is automatically authenticated
  // user.id, user.email, user.provider are available
  
  return NextResponse.json({
    success: true,
    userId: user.id
  })
})
```

#### Method 2: Using `getAuthenticatedUser` directly

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request)
  
  if (!user || error) {
    return NextResponse.json(
      { success: false, error: error || 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Use user object
  return NextResponse.json({ success: true, userId: user.id })
}
```

### Routes with Dynamic Parameters

For routes with dynamic segments (e.g., `/api/users/[id]`):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { AuthUser } from '@/lib/auth'

export const DELETE = withAuth(async (
  request: NextRequest,
  user: AuthUser,
  context: { params: { id: string } }
) => {
  const userId = context.params.id
  
  // Your logic here
  return NextResponse.json({ success: true })
})
```

## Updated Routes

The following routes have been updated to use the auth abstraction layer:

### Workspace Routes (8 routes)
- ✅ `/api/workspaces/chat` - General chat
- ✅ `/api/workspaces/explain` - Explain assist
- ✅ `/api/workspaces/quiz` - Quiz generation (POST & PUT)
- ✅ `/api/workspaces/study` - Study focus (POST & PUT)
- ✅ `/api/workspaces/debug` - Debug workspace
- ✅ `/api/workspaces/summarize` - Smart summarizer
- ✅ `/api/workspaces/wellness` - Mental wellness
- ✅ `/api/workspaces/cyber-safety` - Cyber safety

### Admin Routes (5 routes)
- ✅ `/api/admin/users` - List users (GET)
- ✅ `/api/admin/users/[id]` - Update/delete user (PUT & DELETE)
- ✅ `/api/admin/stats` - Dashboard statistics (GET)
- ✅ `/api/admin/activity-logs` - Activity logs (GET)

### Upload Routes (4 routes)
- ✅ `/api/upload/presigned-url` - Generate S3 presigned URL (POST)
- ✅ `/api/upload/complete` - Mark upload complete (POST)
- ✅ `/api/upload/list` - List uploads (GET)
- ✅ `/api/upload/[id]` - Delete upload (DELETE)

### Guardian Routes (10 routes)
⚠️ **Not yet updated** - Still using direct Supabase auth

To update Guardian routes, follow the same pattern as workspace routes.

## Authentication Flow

### Supabase Flow (Default)
1. User logs in via `/auth/login`
2. Supabase creates session with cookies
3. API routes use `createClient()` to read session from cookies
4. `SupabaseProvider` extracts user from session

### Cognito Flow (When AUTH_PROVIDER=cognito)
1. User authenticates with Cognito (external OAuth flow)
2. Client receives JWT access token
3. Client sends token in `Authorization: Bearer <token>` header
4. `CognitoProvider` verifies JWT using JWKS
5. User claims extracted from verified token

## Security Features

1. **JWT Verification**: Tokens are cryptographically verified using Cognito's public keys
2. **Issuer Validation**: Only tokens from the configured Cognito User Pool are accepted
3. **Token Expiration**: Expired tokens are automatically rejected
4. **Provider Isolation**: Auth logic is isolated in provider classes
5. **Type Safety**: Full TypeScript support with proper types

## Testing

### Test with Supabase (Current Default)
```bash
# No changes needed - existing login flow works
npm run dev
# Navigate to http://localhost:3000/auth/login
```

### Test with Cognito
1. Update `.env.local`:
   ```env
   AUTH_PROVIDER=cognito
   ```

2. Obtain a Cognito JWT token (via OAuth flow or AWS CLI)

3. Make API request with token:
   ```bash
   curl -X POST http://localhost:3000/api/workspaces/chat \
     -H "Authorization: Bearer <your-cognito-jwt-token>" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   ```

## Dependencies

- `jose` (v5.x) - JWT verification library
- `@supabase/ssr` - Supabase authentication
- `@supabase/supabase-js` - Supabase client

## Migration Guide

### From Direct Supabase Auth to Auth Abstraction

**Before**:
```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your logic
}
```

**After**:
```typescript
import { withAuth } from '@/lib/auth/withAuth'

export const POST = withAuth(async (request: NextRequest, user) => {
  // Your logic - user is already authenticated
})
```

## Future Enhancements

1. **Refresh Token Support**: Implement token refresh logic
2. **Role-Based Access Control**: Add role checking to `withAuth`
3. **Rate Limiting**: Add per-user rate limiting
4. **Audit Logging**: Log all authentication attempts
5. **Multi-Factor Authentication**: Support MFA tokens
6. **Guardian Routes**: Update remaining Guardian routes to use auth abstraction

## Troubleshooting

### "Invalid or expired token" error
- Check token expiration time
- Verify token is from correct Cognito User Pool
- Ensure JWKS endpoint is accessible

### "Unauthorized" with valid Supabase session
- Verify `AUTH_PROVIDER=supabase` in `.env.local`
- Check Supabase session cookies are being sent
- Verify Supabase credentials are correct

### TypeScript errors with `withAuth`
- Ensure you import `AuthUser` type for routes with params
- Use correct signature for routes with dynamic segments

## Build Status

✅ **Build Successful** - All TypeScript and ESLint checks pass
✅ **Type Safety** - Full TypeScript coverage
✅ **Production Ready** - Optimized build completed

## Summary

The AWS Cognito JWT authentication has been successfully integrated into the Nebula AI application using a clean abstraction layer. The system supports both Supabase (default) and Cognito authentication providers, allowing seamless switching via environment variable. All workspace, admin, and upload routes have been updated to use the new auth system.
