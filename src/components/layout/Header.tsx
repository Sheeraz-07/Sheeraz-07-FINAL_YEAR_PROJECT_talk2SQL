"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Moon, Sun, Menu, Sparkles, LogOut, User, ChevronDown } from 'lucide-react';
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
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

const notifications = [
  { 
    id: 1, 
    title: 'Query completed', 
    message: 'Your sales report is ready', 
    time: '2 min ago',
    isRead: false,
    type: 'success'
  },
  { 
    id: 2, 
    title: 'New insight', 
    message: 'Sales increased 23% this week', 
    time: '1 hour ago',
    isRead: false,
    type: 'info'
  },
  { 
    id: 3, 
    title: 'Database connected', 
    message: 'Production DB is now online', 
    time: '3 hours ago',
    isRead: true,
    type: 'success'
  },
];

export function Header({ title, onMobileMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-900/60">
      <div className="container flex h-16 items-center px-4 lg:px-6 max-w-full">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 group">
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
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200',
                    'hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:scale-105 hover:shadow-md',
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' 
                      : 'text-slate-700 dark:text-slate-300 hover:text-indigo-900 dark:hover:text-indigo-200'
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
            {user?.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:scale-105 hover:shadow-md transition-all duration-200">
                    <span>Admin</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                  <DropdownMenuLabel className="font-bold text-sm">Administration</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {adminNavItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors rounded-lg p-3"
                      onClick={() => router.push(item.path)}
                    >
                      <item.icon className="mr-3 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <div className="font-semibold text-sm">{item.label}</div>
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
            className="lg:hidden h-10 w-10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:scale-105 hover:shadow-md transition-all duration-200"
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
                className="h-10 w-10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:scale-105 hover:shadow-md transition-all duration-200"
                title="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-3 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-200",
                  searchFocused && "text-indigo-600 dark:text-indigo-400"
                )} />
                <Input
                  placeholder="Quick search..."
                  className={cn(
                    "pl-10 pr-4 h-11 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl font-medium text-sm",
                    "focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500",
                    "hover:border-indigo-300 dark:hover:border-indigo-700",
                    "transition-colors duration-200"
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
            className="hidden md:flex h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 hover:shadow-md transition-all duration-200"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/help')}
            className="hidden md:flex h-10 w-10 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105 hover:shadow-md transition-all duration-200"
            title="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:scale-105 hover:shadow-md transition-all duration-200"
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
                className="h-10 w-10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 hover:shadow-md transition-all duration-200 relative overflow-visible"
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
                  <Badge variant="secondary" className="rounded-full text-xs font-bold px-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200">
                    {unreadCount} new
                  </Badge>
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
                      !notification.isRead && "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-indigo-500"
                    )}
                  >
                    <div className="flex items-start justify-between w-full mb-1">
                      <span className="font-bold text-sm">{notification.title}</span>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-md" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{notification.message}</span>
                    <span className="text-xs text-muted-foreground mt-2 font-medium">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors p-3 text-sm m-2 rounded-lg">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                <Avatar className="h-8 w-8 ring-2 ring-indigo-200 dark:ring-indigo-800">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white text-sm font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block font-semibold text-sm max-w-[100px] truncate">{user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
              <DropdownMenuLabel className="font-bold p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold">{user?.name || 'User'}</p>
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

