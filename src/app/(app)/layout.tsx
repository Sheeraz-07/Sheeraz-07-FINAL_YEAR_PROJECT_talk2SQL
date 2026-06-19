"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/query': 'Natural Language Query',
  '/history': 'Query History',
  '/reports': 'Generated Reports',
  '/analytics': 'Performance Analytics',
  '/settings': 'Account Settings',
  '/help': 'Help & Support',
  '/notifications': 'Notifications',
  '/admin/databases': 'Database Management',
  '/admin/users': 'User Management',
  '/admin/roles': 'Roles & Permissions',
  '/admin/logs': 'System Activity Logs',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  const pageTitle = pageTitles[pathname] || 'Talk2SQL';

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('talk2sql_sidebar_collapsed');
    if (stored === 'true') {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const handleSidebarToggle = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('talk2sql_sidebar_collapsed', String(newState));
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20 selection:text-foreground">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        {mounted && (
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
        )}
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-r-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar 
            isCollapsed={false} 
            onToggle={() => setMobileMenuOpen(false)} 
            onNavClick={() => setMobileMenuOpen(false)} 
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header
          title={pageTitle}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto w-full transition-all duration-300">
          <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 lg:px-12 py-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
