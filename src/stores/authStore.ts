import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Mock user for demo
const mockUser: User = {
  user_id: 1,
  emp_id: 1,
  username: 'demo_user',
  role: 'analyst',
  last_login: new Date(),
  // Frontend-only convenience fields
  name: 'Demo User',
  email: 'demo@talk2sql.com',
  preferredLanguage: 'en',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({
          user: { ...mockUser, email },
          token: 'mock-jwt-token',
          isAuthenticated: true,
          isLoading: false,
        });
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({
          user: { ...mockUser, name, email },
          token: 'mock-jwt-token',
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
