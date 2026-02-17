"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
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
  const { isAuthenticated } = useAuthStore();

  const pageTitle = pageTitles[pathname] || 'Talk2SQL';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
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

