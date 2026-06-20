"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Moon, Sun, Menu, LogOut, ChevronDown, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useQueryStore } from '@/stores/queryStore';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  title: string;
  onMobileMenuClick?: () => void;
}

export function Header({ title, onMobileMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?page=1&pageSize=5', { cache: 'no-store' });
      if (!response.ok) return;
      const json = await response.json();
      setNotifications(json.items || []);
      setUnreadCount(json.unreadCount || 0);
    } catch (error) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
      useQueryStore.getState().hydrateHistory();
    });
    const supabase = createClient();
    const channel = supabase
      .channel('notifications-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new && payload.new.recipient_id === user?.user_id) {
            toast(payload.new.title, { description: payload.new.message });
          }
          loadNotifications().catch(() => undefined);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications, user?.user_id]);

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await loadNotifications();
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    await loadNotifications();
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-card border-b border-border flex items-center justify-between px-6 transition-all duration-300">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-[8px]"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="hidden lg:block text-[15px] font-[600] text-foreground tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right: Search, Actions, Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Button
            variant="outline"
            className={cn(
              "relative h-9 w-[240px] justify-start rounded-[8px] bg-secondary/50 text-[13px] font-normal text-muted-foreground shadow-none border-transparent hover:bg-secondary hover:text-foreground transition-all duration-200",
              searchFocused && "bg-background border-border ring-1 ring-primary text-foreground"
            )}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline-flex">Search...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-2 top-[7px] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-[6px] right-[8px] h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] rounded-[12px] border border-border shadow-premium p-1">
            <div className="flex items-center justify-between p-3">
              <span className="text-[14px] font-[600]">Notifications</span>
              {unreadCount > 0 && (
                <button 
                  className="text-[12px] text-primary font-[500] hover:underline"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator className="mx-2" />
            <div className="max-h-[300px] overflow-y-auto p-1">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-[13px] text-muted-foreground">No new notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={cn(
                      "flex flex-col gap-1 p-3 rounded-[8px] cursor-pointer hover:bg-secondary transition-colors mb-1",
                      !notification.is_read && "bg-secondary/50"
                    )}
                    onClick={() => {
                      setIsNotificationOpen(false);
                      if (!notification.is_read) markRead(notification.id);
                      router.push('/notifications');
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span className={cn("text-[13px] font-[500]", !notification.is_read && "text-foreground font-[600]")}>
                        {notification.title}
                      </span>
                      {!notification.is_read && <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1" />}
                    </div>
                    <span className="text-[12px] text-muted-foreground leading-tight">{notification.message}</span>
                  </div>
                ))
              )}
            </div>
            <DropdownMenuSeparator className="mx-2" />
            <div className="p-1">
              <Button 
                variant="ghost" 
                className="w-full h-8 text-[12px] font-[500] text-primary hover:text-primary hover:bg-primary/10 rounded-[8px]"
                onClick={() => {
                  setIsNotificationOpen(false);
                  router.push('/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-9 pl-2 pr-1 rounded-[8px] hover:bg-secondary transition-colors"
            >
              <Avatar className="h-[24px] w-[24px] rounded-[6px]">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold rounded-[6px]">
                  {user?.username?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-[13px] font-[500] text-foreground max-w-[100px] truncate ml-1">
                {user?.username || user?.name || 'User'}
              </span>
              <ChevronDown className="h-[14px] w-[14px] text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px] rounded-[12px] border border-border shadow-premium p-1">
            <div className="px-3 py-2.5">
              <p className="text-[14px] font-[600] text-foreground truncate">{user?.username || user?.name || 'User'}</p>
              <p className="text-[13px] text-muted-foreground truncate mt-0.5">{user?.email || 'user@example.com'}</p>
            </div>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="rounded-[8px] cursor-pointer text-[13px] py-2 px-3 focus:bg-secondary" onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-[16px] w-[16px] text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-[8px] cursor-pointer text-[13px] py-2 px-3 focus:bg-secondary" onClick={() => router.push('/help')}>
              <HelpCircle className="mr-2 h-[16px] w-[16px] text-muted-foreground" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="rounded-[8px] cursor-pointer text-[13px] py-2 px-3 text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-[16px] w-[16px]" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
    </header>
  );
}
