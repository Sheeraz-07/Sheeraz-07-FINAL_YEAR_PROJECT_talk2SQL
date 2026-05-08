import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { signOutAction } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUserFromServer: (user: User | null, token: string | null) => void;
  initializeFromServer: () => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setUserFromServer: (user: User | null, token: string | null) => {
        set({
          user,
          token,
          isAuthenticated: !!token && !!user,
          isLoading: false,
          error: null,
        });
      },

      initializeFromServer: async () => {
        try {
          set({ isLoading: true, error: null });

          const supabase = createClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const response = await fetch('/api/auth/user', {
              headers: { Accept: 'application/json' },
              cache: 'no-store',
            });

            if (response.ok) {
              const user = (await response.json()) as User | null;
              set({
                user,
                token: user ? session.access_token : null,
                isAuthenticated: !!user,
                isLoading: false,
                error: user ? null : 'Account is not approved',
              });
              return;
            }

            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Failed to load user profile',
            });
            return;
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('[authStore] Initialization error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to initialize auth',
          });
        }
      },

      logout: () => {
        signOutAction().catch((error) => {
          console.error('[authStore] Logout error:', error);
        });

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updates,
                username: updates.username || updates.name || state.user.username,
                name: updates.name || updates.username || state.user.name || state.user.username,
              }
            : null,
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
