export interface AuthUser {
  id: string
  email?: string
  phone?: string
  username?: string
  provider: 'cognito' | 'supabase'
}

export interface AuthProvider {
  getUser(request: Request): Promise<AuthUser | null>
}

export interface AuthResult {
  user: AuthUser | null
  error: string | null
}
