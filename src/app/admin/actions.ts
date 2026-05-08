'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import type { SignupRequest } from '@/types';

async function logAdminEvent(userId: number | undefined, action: string, details: Record<string, unknown>) {
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
    console.warn(`[ADMIN ACTION] Failed to log ${action}:`, error);
  }
}

async function sendApprovalEmail(email: string, status: 'approved' | 'rejected') {
  const endpoint = process.env.SUPABASE_APPROVAL_EMAIL_FUNCTION_URL;
  const serviceToken = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!endpoint || !serviceToken) {
    return;
  }

  await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceToken}`,
    },
    body: JSON.stringify({
      email,
      status,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/login`,
    }),
  });
}

export async function getPendingSignupRequests(): Promise<SignupRequest[]> {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('signup_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as SignupRequest[];
}

export async function approveUserSignup(
  email: string,
  empId?: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const admin = await requireRole(['admin', 'super_admin']);
    const supabase = await createServerSupabaseClient();

    const { data: profile } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle<{ user_id: number }>();

    const { error } = await supabase
      .from('signup_requests')
      .update({
        status: 'approved',
        reviewed_by: admin.user_id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('email', email);
    await supabase
      .from('users')
      .update({
        status: 'approved',
        approved_by: admin.user_id,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('email', email);

    if (profile?.user_id) {
      await createNotification({
        recipient_id: profile.user_id,
        actor_id: admin.user_id,
        type: 'user_approved',
        title: 'Account approved',
        message: 'Your account was approved. You can now log in.',
        metadata: { email },
      });
    }
    await sendApprovalEmail(email, 'approved');

    if (error) {
      throw error;
    }

    await logAdminEvent(admin.user_id, 'approve_user', { email, emp_id: empId ?? null });
    revalidatePath('/admin/users');

    return { success: true, message: 'User approved successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Approval failed';
    return { success: false, error: message };
  }
}

export async function rejectUserSignup(
  email: string,
  reason: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const admin = await requireRole(['admin', 'super_admin']);
    const supabase = await createServerSupabaseClient();

    const { data: profile } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle<{ user_id: number }>();

    const { error } = await supabase
      .from('signup_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: admin.user_id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('email', email);
    await supabase
      .from('users')
      .update({
        status: 'rejected',
        rejected_by: admin.user_id,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('email', email);

    if (profile?.user_id) {
      await createNotification({
        recipient_id: profile.user_id,
        actor_id: admin.user_id,
        type: 'user_rejected',
        title: 'Account rejected',
        message: reason || 'Your account request has been rejected.',
        metadata: { email },
      });
    }
    await sendApprovalEmail(email, 'rejected');

    if (error) {
      throw error;
    }

    await logAdminEvent(admin.user_id, 'reject_user', { email, reason });
    revalidatePath('/admin/users');

    return { success: true, message: 'User rejected successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rejection failed';
    return { success: false, error: message };
  }
}

export async function getAllUsers() {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('user_id, emp_id, username, email, role, status, created_at, last_login')
    .not('email', 'is', null)
    .order('user_id', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getActivityLogs() {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('auth_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}

export async function promoteUserToAdmin(
  userId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await requireRole('super_admin');
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('user_id', userId);
    await createNotification({
      recipient_id: userId,
      actor_id: admin?.user_id || null,
      type: 'admin_action',
      title: 'Role changed',
      message: 'Your role was changed to admin.',
      metadata: { role: 'admin' },
    });

    if (error) {
      throw error;
    }

    const admin = await getCurrentUser();
    await logAdminEvent(admin?.user_id, 'promote_to_admin', { promoted_user_id: userId });
    revalidatePath('/admin/users');

    return { success: true, message: 'User promoted to admin' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Promotion failed';
    return { success: false, error: message };
  }
}

export async function demoteAdminToUser(
  userId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await requireRole('super_admin');
    const supabase = await createServerSupabaseClient();

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle<{ role: string | null }>();

    if (user?.role === 'super_admin') {
      throw new Error('Cannot demote super_admin');
    }

    const { error } = await supabase
      .from('users')
      .update({ role: 'user' })
      .eq('user_id', userId);
    await createNotification({
      recipient_id: userId,
      actor_id: admin?.user_id || null,
      type: 'admin_action',
      title: 'Role changed',
      message: 'Your role was changed to user.',
      metadata: { role: 'user' },
    });

    if (error) {
      throw error;
    }

    const admin = await getCurrentUser();
    await logAdminEvent(admin?.user_id, 'demote_to_user', { demoted_user_id: userId });
    revalidatePath('/admin/users');

    return { success: true, message: 'Admin demoted to user' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Demotion failed';
    return { success: false, error: message };
  }
}

export async function deleteUserAccount(userId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireRole('super_admin');
    if (admin.user_id === userId) {
      throw new Error('You cannot delete your own account');
    }
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('users').delete().eq('user_id', userId);
    if (error) throw error;
    await logAdminEvent(admin.user_id, 'delete_user', { user_id: userId });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}
