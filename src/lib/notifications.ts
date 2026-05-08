import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Notification, NotificationType } from '@/types';

type NotificationInsert = {
  recipient_id: number;
  actor_id?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export async function createNotification(payload: NotificationInsert) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('notifications').insert({
    recipient_id: payload.recipient_id,
    actor_id: payload.actor_id ?? null,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    metadata: payload.metadata ?? {},
  });

  if (error) {
    throw error;
  }
}

export async function listNotifications(
  recipientId: number,
  page = 1,
  pageSize = 20,
  type?: NotificationType
): Promise<{ items: Notification[]; total: number }> {
  const supabase = await createServerSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error, count } = await query;
  if (error) {
    throw error;
  }

  return {
    items: (data || []) as Notification[],
    total: count || 0,
  };
}

export async function getUnreadCount(recipientId: number): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .eq('is_read', false);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function markNotificationRead(notificationId: string, recipientId: number) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('recipient_id', recipientId);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsRead(recipientId: number) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', recipientId)
    .eq('is_read', false);

  if (error) {
    throw error;
  }
}
