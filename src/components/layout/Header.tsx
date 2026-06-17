"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Moon, Sun, Menu, Sparkles, LogOut, ChevronDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { canAccessAdmin } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  FileText,
  BarChart3,
  Database,
  Settings,
  HelpCircle,
  Users,
  Shield,
  Activity,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  onMobileMenuClick?: () => void;
}

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'text-blue-500' },
  { icon: MessageSquare, label: 'Query', path: '/query', color: 'text-purple-500' },
  { icon: History, label: 'History', path: '/history', color: 'text-orange-500' },
  { icon: FileText, label: 'Reports', path: '/reports', color: 'text-green-500' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', color: 'text-pink-500' },
];

const adminNavItems = [
  { icon: Database, label: 'Databases', path: '/admin/databases', desc: 'Manage connections' },
  { icon: Users, label: 'Users', path: '/admin/users', desc: 'User management' },
  { icon: Shield, label: 'Roles', path: '/admin/roles', desc: 'Permissions' },
  { icon: Activity, label: 'Logs', path: '/admin/logs', desc: 'Activity logs' },
];

export function Header({ title, onMobileMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const userCanAccessAdmin = canAccessAdmin(user?.role);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    const response = await fetch('/api/notifications?page=1&pageSize=5', { cache: 'no-store' });
    if (!response.ok) return;
    const json = await response.json();
    setNotifications(json.items || []);
    setUnreadCount(json.unreadCount || 0);
  }, []);

  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startHideTimer = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, []);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    startHideTimer();
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
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

  useEffect(() => {
    startHideTimer();
    
    const handleClickOutside = (e: MouseEvent) => {
      const headerEl = document.getElementById('main-header');
      if (headerEl && !headerEl.contains(e.target as Node)) {
        setIsVisible(false);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [startHideTimer]);

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
    <header 
      id="main-header"
      data-header-visible={isVisible}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "fixed top-0 left-0 right-0 z-[201] transition-transform duration-300 ease-out border-b border-divider/40 bg-background/95 backdrop-blur-3xl shadow-md",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      {/* Invisible hit area to trigger hover when hidden */}
      <div className="absolute top-full left-0 right-0 h-6 bg-transparent cursor-pointer" />
      <span className="sr-only">{title}</span>
      <div className="flex h-16 items-center px-4 lg:px-6 w-full justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Logo & Brand */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 group"
            onClick={() => useDashboardStore.getState().setHasLoadedInitial(false)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-105 shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="hidden lg:block">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Talk2SQL</span>
            </div>
          </Link>
        </div>



        {/* Center - Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors',
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-default-500 hover:bg-default-100 hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <item.icon className="h-4 w-4" />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Dropdown */}
            {userCanAccessAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm text-default-500 hover:text-foreground hover:bg-default-100 transition-colors">
                    <span>Admin</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-divider shadow-md">
                  <DropdownMenuLabel className="font-bold text-sm">Administration</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {adminNavItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      className="cursor-pointer hover:bg-default-100 hover:text-foreground transition-colors rounded-lg p-2"
                      onClick={() => router.push(item.path)}
                    >
                      <item.icon className="mr-3 h-4 w-4 text-default-500" />
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 rounded-lg hover:bg-default-100 transition-colors"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Icon with Dropdown */}
          <DropdownMenu open={searchOpen} onOpenChange={setSearchOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-default-100 transition-colors"
                title="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 rounded-xl border-divider shadow-md">
              <div className="relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400 transition-colors",
                  searchFocused && "text-primary"
                )} />
                <Input
                  placeholder="Quick search..."
                  className={cn(
                    "pl-9 pr-4 h-10 bg-default-100 border-none rounded-lg text-sm",
                    "focus-visible:ring-2 focus-visible:ring-primary",
                    "transition-colors"
                  )}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  autoFocus
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/settings')}
            className="hidden md:flex h-10 w-10 rounded-lg hover:bg-default-100 transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/help')}
            className="hidden md:flex h-10 w-10 rounded-lg hover:bg-default-100 transition-colors"
            title="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-lg hover:bg-default-100 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-lg hover:bg-default-100 transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900 shadow-lg bg-gradient-to-r from-red-600 to-rose-600"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
              <DropdownMenuLabel className="flex items-center justify-between py-3 px-4">
                <span className="font-bold text-base">Notifications</span>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markAllRead();
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className={cn(
                      "flex flex-col items-start p-4 cursor-pointer transition-colors rounded-lg m-2",
                      "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
                      !notification.is_read && "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-indigo-500"
                    )}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (!notification.is_read) {
                        markRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between w-full mb-1">
                      <span className="font-bold text-sm">{notification.title}</span>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-md" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{notification.message}</span>
                    <span className="text-xs text-muted-foreground mt-2 font-medium">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-center text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors p-3 text-sm m-2 rounded-lg cursor-pointer"
                onSelect={() => router.push('/notifications')}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-10 px-2 rounded-lg hover:bg-default-100 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {user?.username?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block font-medium text-sm max-w-[100px] truncate">{user?.username || user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
              <DropdownMenuLabel className="font-bold p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold">{user?.username || user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground font-medium truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold p-3 m-2 rounded-lg"
              >
                <Settings className="mr-3 h-4 w-4 text-slate-600 dark:text-slate-400" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/help')}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold p-3 m-2 rounded-lg"
              >
                <HelpCircle className="mr-3 h-4 w-4 text-green-600 dark:text-green-400" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 p-3 m-2 rounded-lg"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

