"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar isCollapsed={false} onToggle={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        )}
      >
        <Header
          title={pageTitle}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
        />
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
