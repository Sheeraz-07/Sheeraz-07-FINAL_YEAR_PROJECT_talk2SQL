'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient, createServerAdminClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import type { User } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

type UserProfileRow = {
  user_id: number;
  auth_user_id?: string | null;
  emp_id: number | null;
  username: string | null;
  role: string | null;
  status?: 'pending' | 'approved' | 'rejected' | null;
  email: string | null;
  last_login: string | null;
};

async function fetchUserProfileByEmail(supabase: SupabaseClient, email: string, accessToken?: string) {
  let query = supabase
    .from('users')
    .select('user_id, emp_id, username, role, email, last_login, auth_user_id, status')
    .ilike('email', email); // Use ilike for case-insensitive matching
    
  if (accessToken) {
    query = query.setHeader('Authorization', `Bearer ${accessToken}`);
  }
  
  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function buildUserFromProfile(profile: UserProfileRow): Promise<User> {
  return {
    user_id: profile.user_id,
    emp_id: profile.emp_id,
    username: profile.username || 'User',
    role: (profile.role as User['role']) || 'user',
    status: profile.status || 'pending',
    email: profile.email,
    last_login: profile.last_login ? new Date(profile.last_login) : null,
    name: profile.username || 'User',
  };
}

async function logAuthEvent(userId: number | undefined, action: string, details: Record<string, unknown>) {
  if (!userId) {
    return;
  }

  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from('auth_logs').insert({
      user_id: userId,
      action,
      details,
    });
  } catch (error) {
    console.warn(`[AUTH] Failed to log ${action}:`, error);
  }
}

async function notifyAdminsOnSignup(email: string, fullName: string) {
  const supabase = createServerAdminClient();
  const { data: admins } = await supabase
    .from('users')
    .select('user_id')
    .in('role', ['admin', 'super_admin'])
    .eq('status', 'approved');

  for (const admin of admins || []) {
    await createNotification({
      recipient_id: admin.user_id as number,
      type: 'user_signup',
      title: 'New user signup pending approval',
      message: `${fullName} (${email}) is waiting for approval.`,
      metadata: { email },
    });
    await createNotification({
      recipient_id: admin.user_id as number,
      type: 'user_pending',
      title: 'Approval queue updated',
      message: `Pending user: ${email}`,
      metadata: { email },
    });
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpAction(
  rawEmail: string,
  password: string,
  fullName: string,
  empId?: number
) {
  try {
    const email = rawEmail.toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Please enter a valid email address in lowercase.' };
    }

    const supabase = await createServerSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      throw new Error(`Auth signup failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User not created in authentication system');
    }

    const { data: userProfileData, error: profileError } = await supabase
      .from('users')
      .insert({
      email,
      username: fullName,
      role: 'user',
      status: 'pending',
      auth_user_id: authData.user.id,
      emp_id: empId || null,
      })
      .select('user_id')
      .single<{ user_id: number }>();

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    const { error: requestError } = await supabase.from('signup_requests').insert({
      auth_user_id: authData.user.id,
      user_id: userProfileData.user_id,
      email,
      full_name: fullName,
      emp_id: empId || null,
      status: 'pending',
    });

    if (requestError) {
      console.warn('[SIGNUP] Failed to create signup request:', requestError);
    }
    await notifyAdminsOnSignup(email, fullName);

    return {
      success: true,
      message:
        'Account created successfully! Please verify your email. You will be able to log in after admin approval.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    return { success: false, error: message };
  }
}

export async function signInAction(rawEmail: string, password: string) {
  try {
    const email = rawEmail.toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const supabase = await createServerSupabaseClient();

    // Check if the user exists in our database first using the admin client
    // We MUST use the admin client here because the user isn't logged in yet, 
    // so Row Level Security (RLS) will block standard queries and return null.
    const adminSupabase = createServerAdminClient();
    const { data: existingUser } = await adminSupabase
      .from('users')
      .select('user_id')
      .ilike('email', email)
      .maybeSingle();

    if (!existingUser) {
      return { success: false, error: 'User not registered. Please create an account first.' };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error(`Login failed: ${authError.message}`);
    }

    if (!authData.user?.email) {
      throw new Error('Authentication failed');
    }

    let profile = await fetchUserProfileByEmail(supabase, authData.user.email, authData.session?.access_token);

    if (!profile) {
      const fallbackUsername =
        (typeof authData.user.user_metadata?.full_name === 'string'
          ? authData.user.user_metadata.full_name
          : null) || authData.user.email.split('@')[0];

      const { error: insertError } = await supabase.from('users').insert({
        email: authData.user.email,
        username: fallbackUsername,
        role: 'user',
        status: 'pending',
        auth_user_id: authData.user.id,
        emp_id: null,
      });

      if (insertError) {
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      }

      profile = await fetchUserProfileByEmail(supabase, authData.user.email, authData.session?.access_token);
    } else if (profile.auth_user_id !== authData.user.id) {
      let updateQuery = supabase
        .from('users')
        .update({ auth_user_id: authData.user.id })
        .eq('user_id', profile.user_id);
        
      if (authData.session?.access_token) {
        updateQuery = updateQuery.setHeader('Authorization', `Bearer ${authData.session.access_token}`);
      }
      
      const { error: updateError } = await updateQuery;
      
      if (updateError) {
        console.error('Failed to update legacy user auth ID:', updateError);
      }
    }

    if (!profile) {
      throw new Error('User account is not properly set up. Please contact support.');
    }
    if (profile.status !== 'approved') {
      await supabase.auth.signOut();
      return {
        success: false,
        error:
          profile.status === 'rejected'
            ? 'Your account has been rejected. Please contact administrator.'
            : 'Your account is pending admin approval.',
        pendingApproval: true,
      };
    }

    const user = await buildUserFromProfile(profile);
    await logAuthEvent(user.user_id, 'login', { timestamp: new Date().toISOString() });

    return { success: true, user, pendingApproval: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign in failed';
    const connectionMessage =
      message.includes('fetch failed') ||
      message.includes('ENOTFOUND') ||
      message.includes('ConnectTimeoutError')
        ? 'Unable to connect to Supabase. Check your network or Supabase project URL.'
        : message;
    return { success: false, error: connectionMessage };
  }
}

export async function checkUserForPasswordReset(rawEmail: string) {
  try {
    const email = rawEmail.toLowerCase().trim();
    const adminSupabase = createServerAdminClient();
    const { data: existingUser, error } = await adminSupabase
      .from('users')
      .select('status')
      .ilike('email', email)
      .maybeSingle();

    if (error) throw error;

    if (!existingUser) {
      return { success: false, error: 'Account does not exist. Please verify the email address.' };
    }

    if (existingUser.status !== 'approved') {
      return { success: false, error: 'Your account is not approved or inactive. Please contact an administrator.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error checking user for password reset:', error);
    return { success: false, error: 'An error occurred while verifying your account.' };
  }
}

export async function signOutAction() {
  try {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentUser();

    await logAuthEvent(user?.user_id, 'logout', { timestamp: new Date().toISOString() });

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Sign out error:', error);
  }
  
  redirect('/login');
}

export async function getCurrentUserAction(): Promise<User | null> {
  try {
    return await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
