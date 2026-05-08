"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/query': 'Query',
  '/history': 'Query History',
  '/reports': 'Reports',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/help': 'Help & Support',
  '/notifications': 'Notifications',
  '/admin/databases': 'Databases',
  '/admin/users': 'Users',
  '/admin/roles': 'Roles & Permissions',
  '/admin/logs': 'Activity Logs',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  const pageTitle = pageTitles[pathname] || 'Talk2SQL';

  // Redirect to login if not authenticated (but wait for initialization)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      {/* Mobile Sidebar (for small screens) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar isCollapsed={false} onToggle={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content - Full Width */}
      <div className="min-h-screen">
        <Header
          title={pageTitle}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="w-full">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 max-w-[1920px]">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

