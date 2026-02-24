import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ title, value, change, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn(
      'group relative overflow-hidden border-0 bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:scale-[1.02] cursor-pointer',
      className
    )}>
      {/* Background gradient overlay */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        trend === 'up' && 'bg-gradient-to-br from-green-500/10 via-transparent to-transparent',
        trend === 'down' && 'bg-gradient-to-br from-red-500/10 via-transparent to-transparent',
        (!trend || trend === 'neutral') && 'bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent'
      )} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'p-3 rounded-xl transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110',
            trend === 'up' && 'bg-gradient-to-br from-green-500 to-emerald-600',
            trend === 'down' && 'bg-gradient-to-br from-red-500 to-rose-600',
            (!trend || trend === 'neutral') && 'bg-gradient-to-br from-indigo-600 to-blue-600'
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm',
              trend === 'up' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              trend === 'down' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              trend === 'neutral' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            )}>
              {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
              {trend === 'neutral' && <Minus className="h-3 w-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-tight">{value}</p>
          {change !== undefined && (
            <p className="text-xs text-muted-foreground font-medium mt-2">
              {trend === 'up' ? '↑ Increase from last period' : trend === 'down' ? '↓ Decrease from last period' : '→ No change'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

