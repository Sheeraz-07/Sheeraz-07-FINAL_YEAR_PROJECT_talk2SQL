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
      'p-2.5 border-2 hover:border-accent/60 dark:hover:border-accent/70 hover:shadow-xl transition-all duration-300 group overflow-hidden relative hover:scale-[1.02] max-w-[80%]',
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent dark:from-accent/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
      <div className="flex items-start justify-between mb-2">
        <div className={cn(
          'p-1.5 rounded-xl transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110',
          trend === 'up' && 'bg-gradient-to-br from-success/20 to-success/10 text-success',
          trend === 'down' && 'bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive',
          (!trend || trend === 'neutral') && 'bg-gradient-to-br from-accent/20 to-accent/10 text-accent'
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm',
            trend === 'up' && 'bg-gradient-to-r from-success/15 to-success/10 text-success',
            trend === 'down' && 'bg-gradient-to-r from-destructive/15 to-destructive/10 text-destructive',
            trend === 'neutral' && 'bg-muted text-muted-foreground'
          )}>
            {trend === 'up' && <ArrowUpRight className="h-2.5 w-2.5" />}
            {trend === 'down' && <ArrowDownRight className="h-2.5 w-2.5" />}
            {trend === 'neutral' && <Minus className="h-2.5 w-2.5" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">{title}</p>
        <p className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text leading-tight">{value}</p>
        {change !== undefined && (
          <p className="text-[9px] text-muted-foreground font-semibold leading-tight">
            {trend === 'up' ? '↑ Increase' : trend === 'down' ? '↓ Decrease' : '→ No change'}
          </p>
        )}
      </div>
      </div>
    </Card>
  );
}

