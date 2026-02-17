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
    gradient: 'from-accent/20 to-accent/5',
    iconBg: 'bg-accent',
    iconColor: 'text-accent-foreground',
  },
  {
    icon: FileText,
    label: 'Reports',
    description: 'View generated reports',
    path: '/reports',
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success',
    iconColor: 'text-success-foreground',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    description: 'Data visualizations',
    path: '/analytics',
    gradient: 'from-warning/20 to-warning/5',
    iconBg: 'bg-warning',
    iconColor: 'text-warning-foreground',
  },
  {
    icon: HelpCircle,
    label: 'Help',
    description: 'Tutorials & guides',
    path: '/help',
    gradient: 'from-chart-4/20 to-chart-4/5',
    iconBg: 'bg-chart-4',
    iconColor: 'text-white',
  },
];

interface ShortcutsGridProps {
  className?: string;
}

export function ShortcutsGrid({ className }: ShortcutsGridProps) {
  const router = useRouter();

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {shortcuts.map((shortcut, index) => (
        <Card
          key={shortcut.path}
          className="relative p-5 cursor-pointer border-2 hover:border-accent/60 dark:hover:border-accent/70 hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden"
          onClick={() => router.push(shortcut.path)}
        >
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-all duration-300',
            shortcut.gradient
          )} />
          <div className="relative z-10">
            <div
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300',
                shortcut.iconBg
              )}
            >
              <shortcut.icon className={cn('h-6 w-6', shortcut.iconColor)} />
            </div>
            <h4 className="font-bold text-sm mb-1.5 group-hover:text-accent transition-colors">{shortcut.label}</h4>
            <p className="text-xs text-muted-foreground font-semibold">{shortcut.description}</p>
            <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Card>
      ))}
    </div>
  );
}
