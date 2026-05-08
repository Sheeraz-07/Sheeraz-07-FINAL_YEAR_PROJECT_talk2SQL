import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notifications';
import type { NotificationType } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = Number(request.nextUrl.searchParams.get('page') || '1');
    const pageSize = Number(request.nextUrl.searchParams.get('pageSize') || '20');
    const type = request.nextUrl.searchParams.get('type') as NotificationType | null;

    const [result, unreadCount] = await Promise.all([
      listNotifications(user.user_id, page, pageSize, type || undefined),
      getUnreadCount(user.user_id),
    ]);

    return NextResponse.json({
      items: result.items,
      total: result.total,
      unreadCount,
    });
  } catch (error) {
    console.error('[GET /api/notifications] Error:', error);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { id?: string; markAll?: boolean };
    if (body.markAll) {
      await markAllNotificationsRead(user.user_id);
      return NextResponse.json({ success: true });
    }
    if (!body.id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 });
    }
    await markNotificationRead(body.id, user.user_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/notifications] Error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
