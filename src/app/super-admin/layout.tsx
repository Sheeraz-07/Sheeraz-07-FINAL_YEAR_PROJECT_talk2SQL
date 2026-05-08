"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, Settings, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const pageTitles: Record<string, string> = {
  '/super-admin': 'Super Admin Dashboard',
  '/super-admin/users': 'Users Management',
  '/super-admin/settings': 'Super Admin Settings',
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const pageTitle = pageTitles[pathname] || 'Super Admin';

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'super_admin')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-muted-foreground/30 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/super-admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">Super Admin</h2>
              <p className="text-xs text-muted-foreground">Control Center</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/super-admin"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname === '/super-admin'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Shield className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/super-admin/users"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname === '/super-admin/users'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Users className="h-4 w-4" />
            Users Management
          </Link>
          <Link
            href="/super-admin/settings"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname === '/super-admin/settings'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="p-6 border-b border-border">
            <h2 className="font-bold text-lg">Super Admin</h2>
          </div>
          <nav className="p-4 space-y-2">
            <Link
              href="/super-admin"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === '/super-admin'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Shield className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/super-admin/users"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === '/super-admin/users'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Users className="h-4 w-4" />
              Users Management
            </Link>
            <Link
              href="/super-admin/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === '/super-admin/settings'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold flex-1 md:flex-none">{pageTitle}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
