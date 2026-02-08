"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'Query', path: '/query' },
  { icon: History, label: 'History', path: '/history' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

const adminNavItems = [
  { icon: Database, label: 'Databases', path: '/admin/databases' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Shield, label: 'Roles', path: '/admin/roles' },
  { icon: Activity, label: 'Logs', path: '/admin/logs' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const NavItem = ({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) => {
    const isActive = pathname === path || pathname.startsWith(path + '/');
    
    const content = (
      <Link
        href={path}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-md',
          isCollapsed && 'justify-center'
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'drop-shadow-sm')} />
        {!isCollapsed && (
          <span className="font-medium truncate">{label}</span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-border',
          isCollapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-md">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-gradient">Talk2SQL</span>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className={cn(
                'pt-4 pb-2',
                isCollapsed ? 'border-t border-border mt-4' : ''
              )}>
                {!isCollapsed && (
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                    Admin
                  </span>
                )}
              </div>
              {adminNavItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-1 border-t border-border">
          {bottomNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}

          {/* User Profile */}
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-lg bg-secondary/50 mt-3',
            isCollapsed && 'justify-center'
          )}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
            {!isCollapsed && (
              <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            'absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card shadow-md',
            'hover:bg-accent'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>
    </aside>
  );
}
