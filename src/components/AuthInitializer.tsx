"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';

export function AuthInitializer() {
  const router = useRouter();
  const initializeFromServer = useAuthStore((state) => state.initializeFromServer);
  const setUserFromServer = useAuthStore((state) => state.setUserFromServer);

  useEffect(() => {
    // Check if we arrived via a password reset link (Supabase hash fragment)
    if (
      typeof window !== 'undefined' && 
      window.location.hash.includes('type=recovery') &&
      window.location.pathname !== '/reset-password'
    ) {
      router.push('/reset-password' + window.location.hash);
      return;
    }

    const initializeAuth = async () => {
      await initializeFromServer();
    };

    initializeAuth();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const response = await fetch('/api/auth/user', {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          });

          if (response.ok) {
            const user = await response.json();
            setUserFromServer(user, session?.access_token || null);
          } else {
            setUserFromServer(null, null);
          }
        } catch (error) {
          console.error('[AuthInitializer] Error syncing auth state:', error);
          setUserFromServer(null, null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserFromServer(null, null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeFromServer, setUserFromServer]);

  return null;
}
