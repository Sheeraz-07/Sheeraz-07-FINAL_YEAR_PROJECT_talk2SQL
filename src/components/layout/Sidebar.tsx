"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { canAccessAdmin } from '@/lib/rbac';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavClick?: () => void;
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

export function Sidebar({ isCollapsed, onToggle, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const userCanAccessAdmin = canAccessAdmin(user?.role);

  const handleLogoClick = () => {
    useDashboardStore.getState().setHasLoadedInitial(false);
    useAnalyticsStore.getState().setHasLoadedInitial(false);
    if (onNavClick) onNavClick();
    router.push('/dashboard');
  };

  const NavItem = ({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) => {
    const isActive = pathname === path || pathname.startsWith(path + '/');
    
    const content = (
      <Link
        href={path}
        onClick={onNavClick}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2 rounded-[8px] transition-all duration-200',
          isActive 
            ? 'bg-secondary/60 text-foreground font-[500]' 
            : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground',
          isCollapsed && 'justify-center px-2'
        )}
      >
        {isActive && !isCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
        )}
        <Icon className={cn(
          'h-[18px] w-[18px] flex-shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )} />
        {!isCollapsed && (
          <span className="text-[13px] truncate">{label}</span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium text-[12px] ml-2">
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
        'z-30 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0 flex flex-col',
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-sidebar-border transition-all duration-300',
        isCollapsed ? 'justify-center px-0' : 'px-6 justify-between'
      )}>
        <div 
          className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-[700] text-[15px] tracking-tight truncate">Talk2SQL</span>
          )}
        </div>
        {!isCollapsed && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </Button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center mt-4">
           <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          </Button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <span className="text-[11px] font-[600] text-muted-foreground uppercase tracking-wider">
                Overview
              </span>
            </div>
          )}
          {mainNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {/* Admin Section */}
        {userCanAccessAdmin && (
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-2">
                <span className="text-[11px] font-[600] text-muted-foreground uppercase tracking-wider">
                  Admin
                </span>
              </div>
            )}
            {adminNavItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border space-y-1 bg-sidebar">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>
    </aside>
  );
}
