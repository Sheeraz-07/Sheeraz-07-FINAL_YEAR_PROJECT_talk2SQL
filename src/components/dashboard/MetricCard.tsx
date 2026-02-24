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
      'group relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl p-4 cursor-pointer transition-all duration-300 ease-out border border-[#E5E7EB] dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700/50 hover:scale-[1.01] shadow-sm hover:shadow-md',
      className
    )}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            'relative w-11 h-11 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 bg-gradient-to-br',
            trend === 'up' && 'from-green-500 to-emerald-600',
            trend === 'down' && 'from-red-500 to-rose-600',
            (!trend || trend === 'neutral') && 'from-indigo-500 to-blue-600'
          )}>
            {/* Icon glow effect */}
            <div className={cn(
              'absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 bg-gradient-to-br',
              trend === 'up' && 'from-green-500 to-emerald-600',
              trend === 'down' && 'from-red-500 to-rose-600',
              (!trend || trend === 'neutral') && 'from-indigo-500 to-blue-600'
            )} />
            <Icon className="h-5 w-5 text-white relative z-10" />
          </div>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm',
              trend === 'up' && 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-500 border border-green-100 dark:border-green-800/30',
              trend === 'down' && 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-500 border border-red-100 dark:border-red-800/30',
              trend === 'neutral' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            )}>
              {trend === 'up' && <ArrowUpRight className="h-2.5 w-2.5" />}
              {trend === 'down' && <ArrowDownRight className="h-2.5 w-2.5" />}
              {trend === 'neutral' && <Minus className="h-2.5 w-2.5" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">{value}</p>
          {change !== undefined && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {trend === 'up' ? 'Increase from last period' : trend === 'down' ? 'Decrease from last period' : 'No change from last period'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

