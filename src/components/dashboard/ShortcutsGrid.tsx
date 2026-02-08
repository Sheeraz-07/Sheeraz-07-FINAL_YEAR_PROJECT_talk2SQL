"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { MessageSquare, FileText, BarChart3, HelpCircle, Database, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const shortcuts = [
  {
    icon: MessageSquare,
    label: 'New Query',
    description: 'Ask your database anything',
    path: '/query',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: FileText,
    label: 'Reports',
    description: 'View generated reports',
    path: '/reports',
    color: 'bg-success/10 text-success',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    description: 'Data visualizations',
    path: '/analytics',
    color: 'bg-chart-4/20 text-chart-4',
  },
  {
    icon: HelpCircle,
    label: 'Help',
    description: 'Tutorials & guides',
    path: '/help',
    color: 'bg-info/10 text-info',
  },
];

interface ShortcutsGridProps {
  className?: string;
}

export function ShortcutsGrid({ className }: ShortcutsGridProps) {
  const router = useRouter();

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {shortcuts.map((shortcut) => (
        <Card
          key={shortcut.path}
          className="p-4 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
          onClick={() => router.push(shortcut.path)}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110',
              shortcut.color
            )}
          >
            <shortcut.icon className="h-6 w-6" />
          </div>
          <h4 className="font-semibold">{shortcut.label}</h4>
          <p className="text-xs text-muted-foreground mt-1">{shortcut.description}</p>
        </Card>
      ))}
    </div>
  );
}
