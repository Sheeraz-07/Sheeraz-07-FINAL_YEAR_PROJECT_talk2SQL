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
  Sparkles,
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
          'group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300',
          'hover:bg-sidebar-accent hover:shadow-md hover:-translate-x-1',
          isActive 
            ? 'bg-accent text-accent-foreground font-bold shadow-lg hover:shadow-xl' 
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground font-medium',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className={cn(
          'h-6 w-6 flex-shrink-0 transition-all duration-300',
          isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110 group-hover:rotate-3'
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
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo & Brand */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          isCollapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-6">
              <Sparkles className="h-6 w-6 text-accent-foreground animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-accent/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-slide-right">
              <span className="font-extrabold text-lg tracking-tight">Talk2SQL</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">AI Platform</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Main Menu
              </span>
            </div>
          )}
          {mainNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className={cn(
                'pt-6 pb-2',
                isCollapsed ? 'border-t border-sidebar-border mt-4' : ''
              )}>
                {!isCollapsed && (
                  <div className="px-3">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
            isCollapsed ? 'border-t border-sidebar-border mt-4' : ''
          )}>
            {!isCollapsed && (
              <div className="px-3 pb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group',
            isCollapsed && 'justify-center'
          )}>
            <Avatar className="h-10 w-10 ring-2 ring-sidebar-border hover:ring-accent transition-all duration-300 group-hover:scale-110">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate font-medium">{user?.email || 'user@example.com'}</p>
              </div>
            )}
            {!isCollapsed && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={logout} 
                    className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive hover:rotate-12 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
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
            'absolute -right-3 top-20 h-8 w-8 rounded-full border-2 border-sidebar-border bg-sidebar shadow-xl',
            'hover:bg-sidebar-accent hover:scale-125 hover:rotate-180 transition-all duration-500',
            'hover:border-accent hover:shadow-accent/30',
            'hidden lg:flex items-center justify-center'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}

