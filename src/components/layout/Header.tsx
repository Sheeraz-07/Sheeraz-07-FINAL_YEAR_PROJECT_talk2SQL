"use client";

import { Bell, Search, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  onMobileMenuClick?: () => void;
}

const notifications = [
  { id: 1, title: 'Query completed', message: 'Your sales report is ready', time: '2 min ago' },
  { id: 2, title: 'New insight', message: 'Sales increased 23% this week', time: '1 hour ago' },
  { id: 3, title: 'Database connected', message: 'Production DB is now online', time: '3 hours ago' },
];

export function Header({ title, onMobileMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search queries..."
              className="pl-9 w-64 bg-secondary/50 border-border"
            />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
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
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-sm text-muted-foreground">{notification.message}</span>
                  <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
