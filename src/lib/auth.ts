import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { User, UserRole, UserStatus } from '@/types';

type UserProfileRow = {
  user_id: number;
  auth_user_id?: string | null;
  emp_id: number | null;
  username: string | null;
  role: string | null;
  status?: string | null;
  email: string | null;
  last_login: string | null;
};

function mapProfileToUser(
  profile: UserProfileRow,
  authUser?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null
): User {
  const username =
    profile.username ||
    (typeof authUser?.user_metadata?.full_name === 'string' ? authUser.user_metadata.full_name : null) ||
    authUser?.email?.split('@')[0] ||
    'User';

  return {
    user_id: profile.user_id,
    emp_id: profile.emp_id,
    username,
    role: (profile.role as UserRole | null) || 'user',
    status: (profile.status as UserStatus | null) || 'pending',
    email: profile.email || authUser?.email || null,
    last_login: profile.last_login ? new Date(profile.last_login) : null,
    name: username,
    avatar:
      typeof authUser?.user_metadata?.avatar_url === 'string'
        ? authUser.user_metadata.avatar_url
        : undefined,
    preferredLanguage:
      authUser?.user_metadata?.preferred_language === 'ur' ? 'ur' : 'en',
    auth_user_id: profile.auth_user_id || authUser?.id,
  };
}

export async function getCurrentSession() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getCurrentUser(includeUnapproved = false): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      return null;
    }

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('user_id, auth_user_id, emp_id, username, role, status, email, last_login')
      .eq('email', authUser.email)
      .maybeSingle<UserProfileRow>();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!userProfile) {
      return null;
    }

    const user = mapProfileToUser(userProfile, authUser);
    if (!includeUnapproved && user.status !== 'approved') {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser(true);
  return user?.role || null;
}

export async function hasRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  const role = await getUserRole();
  if (!role) {
    return false;
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(role);
}

export async function isAdmin(): Promise<boolean> {
  return hasRole(['admin', 'super_admin']);
}

export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('super_admin');
}

export async function requireRole(requiredRole: UserRole | UserRole[]): Promise<User> {
  const user = await getCurrentUser(true);

  if (!user) {
    throw new Error('Not authenticated');
  }
  if (user.status !== 'approved') {
    throw new Error('Account is not approved');
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!user.role || !roles.includes(user.role)) {
    throw new Error(`Unauthorized. Required role: ${roles.join(' or ')}`);
  }

  return user;
}

export async function requireApprovedUser(): Promise<User> {
  const user = await getCurrentUser(true);
  if (!user) {
    throw new Error('Not authenticated');
  }
  if (user.status !== 'approved') {
    throw new Error('Account is not approved');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  return requireRole(['admin', 'super_admin']);
}

export async function requireSuperAdmin(): Promise<User> {
  return requireRole('super_admin');
}
