import { AuthProvider, AuthUser, AuthResult } from './types'
import { CognitoProvider } from './cognitoProvider'
import { SupabaseProvider } from './supabaseProvider'

const AUTH_PROVIDER = process.env.AUTH_PROVIDER || 'supabase'

function getAuthProvider(): AuthProvider {
  if (AUTH_PROVIDER === 'cognito') {
    return new CognitoProvider()
  }
  return new SupabaseProvider()
}

export async function getAuthenticatedUser(request: Request): Promise<AuthResult> {
  try {
    const provider = getAuthProvider()
    const user = await provider.getUser(request)

    if (!user) {
      return { user: null, error: 'Unauthorized' }
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: 'Authentication failed' }
  }
}

export type { AuthUser, AuthResult }
