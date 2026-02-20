"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { MessageSquare, FileText, BarChart3, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const shortcuts = [
  {
    icon: MessageSquare,
    label: 'New Query',
    description: 'Ask your database anything',
    path: '/query',
    gradient: 'from-indigo-500 to-blue-600',
    bgGradient: 'from-indigo-50 to-blue-50',
    darkBgGradient: 'dark:from-indigo-900/20 dark:to-blue-900/20',
  },
  {
    icon: FileText,
    label: 'Reports',
    description: 'View generated reports',
    path: '/reports',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50',
    darkBgGradient: 'dark:from-green-900/20 dark:to-emerald-900/20',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    description: 'Data visualizations',
    path: '/analytics',
    gradient: 'from-orange-500 to-amber-600',
    bgGradient: 'from-orange-50 to-amber-50',
    darkBgGradient: 'dark:from-orange-900/20 dark:to-amber-900/20',
  },
  {
    icon: HelpCircle,
    label: 'Help',
    description: 'Tutorials & guides',
    path: '/help',
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    darkBgGradient: 'dark:from-purple-900/20 dark:to-pink-900/20',
  },
];

interface ShortcutsGridProps {
  className?: string;
}

export function ShortcutsGrid({ className }: ShortcutsGridProps) {
  const router = useRouter();

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-5', className)}>
      {shortcuts.map((shortcut, index) => (
        <Card
          key={shortcut.path}
          className={cn(
            'relative p-6 cursor-pointer border-0 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl'
          )}
          onClick={() => router.push(shortcut.path)}
        >
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-all duration-300',
            shortcut.bgGradient,
            shortcut.darkBgGradient
          )} />
          <div className="relative z-10">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 bg-gradient-to-br',
                shortcut.gradient
              )}
            >
              <shortcut.icon className="h-7 w-7 text-white" />
            </div>
            <h4 className="font-bold text-base mb-2 text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{shortcut.label}</h4>
            <p className="text-sm text-muted-foreground font-medium">{shortcut.description}</p>
            <ArrowRight className="absolute bottom-5 right-5 h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Card>
      ))}
    </div>
  );
}
