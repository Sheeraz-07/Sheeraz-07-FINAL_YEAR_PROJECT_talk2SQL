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
  Bell,
  HelpCircle,
  Users,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { canAccessAdmin } from '@/lib/rbac';

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
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const userCanAccessAdmin = canAccessAdmin(user?.role);

  const NavItem = ({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) => {
    const isActive = pathname === path || pathname.startsWith(path + '/');
    
    const content = (
      <Link
        href={path}
        onClick={() => onToggle()}
        className={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
          isActive 
            ? 'bg-primary/10 text-primary font-semibold shadow-[inset_3px_0_0_hsl(var(--primary))]' 
            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:translate-x-1',
          isCollapsed && 'justify-center px-2 shadow-none'
        )}
      >
        <Icon className={cn(
          'h-5 w-5 flex-shrink-0 transition-all duration-300',
          isActive ? 'text-primary' : 'group-hover:scale-110'
        )} />
        {!isCollapsed && (
          <span className="text-sm truncate font-medium">{label}</span>
        )}
        {!isCollapsed && isActive && (
          <div className="ml-auto h-2 w-2 rounded-full bg-accent-foreground animate-pulse" />
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
        'z-[202] h-screen bg-background/40 backdrop-blur-3xl border-r border-border/30 transition-all duration-300 flex-shrink-0 shadow-lg',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo & Brand */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-divider',
          isCollapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="relative group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-slide-right">
              <span className="font-bold text-lg tracking-tight uppercase">Talk2SQL</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                Main Menu
              </span>
            </div>
          )}
          {mainNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}

          {/* Admin Section */}
          {userCanAccessAdmin && (
            <>
              <div className={cn(
                'pt-6 pb-2',
                isCollapsed ? 'border-t border-divider mt-4' : ''
              )}>
                {!isCollapsed && (
                  <div className="px-3">
                    <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                      Administration
                    </span>
                  </div>
                )}
              </div>
              {adminNavItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </>
          )}

          {/* Bottom Section */}
          <div className={cn(
            'pt-6',
            isCollapsed ? 'border-t border-divider mt-4' : ''
          )}>
            {!isCollapsed && (
              <div className="px-3 pb-2">
                <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                  Support
                </span>
              </div>
            )}
            {bottomNavItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-divider">
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors group cursor-pointer',
            isCollapsed && 'justify-center'
          )}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user?.username?.charAt(0) || user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.username || user?.name || 'User'}</p>
                <p className="text-xs text-default-500 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            )}
            {!isCollapsed && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={logout} 
                    className="h-8 w-8 hover:bg-danger/10 hover:text-danger transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="font-semibold">Sign out</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className={cn(
            'absolute -right-3 top-20 h-6 w-6 rounded-full border border-divider bg-background shadow-sm',
            'hover:bg-default-100 transition-colors',
            'hidden lg:flex items-center justify-center'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-default-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-default-500" />
          )}
        </Button>
      </div>
    </aside>
  );
}

