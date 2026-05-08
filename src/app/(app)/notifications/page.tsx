"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Notification, NotificationType } from '@/types';

const types: Array<{ id: NotificationType | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'user_signup', label: 'Signups' },
  { id: 'user_pending', label: 'Pending' },
  { id: 'user_approved', label: 'Approved' },
  { id: 'user_rejected', label: 'Rejected' },
  { id: 'system', label: 'System' },
  { id: 'admin_action', label: 'Admin' },
];

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const pageSize = 20;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const loadNotifications = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (filter !== 'all') {
      params.set('type', filter);
    }
    const res = await fetch(`/api/notifications?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const json = await res.json();
    setItems(json.items || []);
    setTotal(json.total || 0);
  }, [filter, page]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
    });
  }, [loadNotifications]);

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await loadNotifications();
  };

  const markAll = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    await loadNotifications();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <Button onClick={markAll} variant="outline">Mark all as read</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map((type) => (
          <Button
            key={type.id}
            variant={filter === type.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPage(1);
              setFilter(type.id);
            }}
          >
            {type.label}
          </Button>
        ))}
      </div>

      <Card className="divide-y divide-border">
        {items.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">No notifications found.</div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-4 flex items-start justify-between gap-4 ${!item.is_read ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{item.title}</p>
                {!item.is_read && <Badge variant="secondary">new</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{item.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleString()}</p>
            </div>
            {!item.is_read && (
              <Button size="sm" variant="outline" onClick={() => markRead(item.id)}>
                Mark read
              </Button>
            )}
          </div>
        ))}
      </Card>

      <div className="flex justify-between">
        <Button disabled={page <= 1} variant="outline" onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <Button disabled={page >= totalPages} variant="outline" onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
