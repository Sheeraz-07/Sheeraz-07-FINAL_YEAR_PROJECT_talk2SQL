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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-14 items-center px-4 lg:px-6 max-w-full">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center hover:shadow-md transition-all duration-200 hover:scale-105">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="hidden lg:block">
              <span className="font-bold text-base tracking-tight">Talk2SQL</span>
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
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-200',
                    'hover:bg-gradient-to-r hover:from-accent/30 hover:to-accent/20 hover:scale-105 hover:shadow-md dark:hover:from-accent/40 dark:hover:to-accent/25',
                    isActive 
                      ? 'bg-gradient-to-r from-accent/25 to-accent/15 text-accent shadow-md dark:from-accent/35 dark:to-accent/20' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <item.icon className={cn(
                      'h-4 w-4',
                      item.color
                    )} />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Dropdown */}
            {user?.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-accent/30 hover:to-accent/20 dark:hover:from-accent/40 dark:hover:to-accent/25 hover:scale-105 hover:shadow-md transition-all duration-200">
                    <span>Admin</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-lg">
                  <DropdownMenuLabel className="font-bold text-sm">Administration</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {adminNavItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      className="cursor-pointer hover:bg-accent/20 dark:hover:bg-accent/30 hover:text-accent transition-colors"
                      onClick={() => router.push(item.path)}
                    >
                      <item.icon className="mr-2 h-4 w-4 text-accent" />
                      <div>
                        <div className="font-bold text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

        {/* Right Section */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 rounded-lg hover:bg-accent/25 dark:hover:bg-accent/35 hover:scale-105 hover:shadow-md transition-all duration-200"
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
                className="h-9 w-9 rounded-lg hover:bg-accent/25 dark:hover:bg-accent/35 hover:scale-105 hover:shadow-md transition-all duration-200"
                title="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <div className="relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-200",
                  searchFocused && "text-accent"
                )} />
                <Input
                  placeholder="Quick search..."
                  className={cn(
                    "pl-9 pr-4 h-10 bg-muted/50 border rounded-lg font-bold text-sm",
                    "focus:bg-background focus:border-accent",
                    "hover:border-accent/50 hover:bg-background/80",
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
            className="hidden md:flex h-9 w-9 rounded-lg hover:bg-accent/25 dark:hover:bg-accent/35 hover:scale-105 hover:shadow-md transition-all duration-200"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/help')}
            className="hidden md:flex h-9 w-9 rounded-lg hover:bg-success/25 dark:hover:bg-success/35 hover:scale-105 hover:shadow-md transition-all duration-200"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-lg hover:bg-warning/25 dark:hover:bg-warning/35 hover:scale-105 hover:shadow-md transition-all duration-200"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg hover:bg-destructive/25 dark:hover:bg-destructive/35 hover:scale-105 hover:shadow-md transition-all duration-200 relative overflow-visible"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold border-2 border-background shadow-lg"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-lg">
              <DropdownMenuLabel className="flex items-center justify-between py-2">
                <span className="font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="rounded-full text-xs font-bold px-2">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className={cn(
                      "flex flex-col items-start p-3 cursor-pointer transition-colors",
                      "hover:bg-accent/10",
                      !notification.isRead && "bg-accent/5 border-l-2 border-accent"
                    )}
                  >
                    <div className="flex items-start justify-between w-full mb-1">
                      <span className="font-bold text-sm">{notification.title}</span>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-accent" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">{notification.message}</span>
                    <span className="text-xs text-muted-foreground mt-1 font-semibold">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-accent font-bold hover:bg-accent/10 transition-colors p-2.5 text-sm">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-accent/10 transition-colors duration-200"
              >
                <Avatar className="h-7 w-7 ring-1 ring-border">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block font-bold text-sm max-w-[100px] truncate">{user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-lg">
              <DropdownMenuLabel className="font-bold">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-bold">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground font-semibold truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="cursor-pointer hover:bg-accent/10 transition-colors font-bold"
              >
                <Settings className="mr-2 h-4 w-4 text-accent" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/help')}
                className="cursor-pointer hover:bg-accent/10 transition-colors font-bold"
              >
                <HelpCircle className="mr-2 h-4 w-4 text-success" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer hover:bg-destructive/10 transition-colors font-bold text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

