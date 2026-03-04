import { AuthProvider, AuthUser } from './types'
import { createClient } from '@/lib/supabase/server'

export class SupabaseProvider implements AuthProvider {
  async getUser(request: Request): Promise<AuthUser | null> {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.user_metadata?.username || user.email?.split('@')[0],
        provider: 'supabase',
      }
    } catch (error) {
      return null
    }
  }
}
