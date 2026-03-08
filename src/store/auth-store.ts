// Authentication state management
import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
  signIn: (user: User) => void
  signOut: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null, isLoading: false }),
  signIn: (user) => set({ user, isLoading: false }),
  signOut: () => {
    // Clear user
    set({ user: null, isLoading: false })
    
    // Clear all chat messages from store
    // Import dynamically to avoid circular dependency
    import('./chat-store').then(({ useChatStore }) => {
      useChatStore.getState().clearAllMessages()
    })
  },
  checkAuth: async () => {
    // This will be implemented when Supabase is configured
    set({ isLoading: false })
  },
}))
