import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
      'group relative overflow-hidden transition-all duration-200 h-[140px] w-full p-5 cursor-pointer',
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[11px] font-[600]',
            trend === 'up' && 'text-success bg-success/10',
            trend === 'down' && 'text-destructive bg-destructive/10',
            trend === 'neutral' && 'text-muted-foreground bg-secondary'
          )}>
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {trend === 'neutral' && <Minus className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[13px] font-[500] text-muted-foreground tracking-tight">{title}</p>
        <p className="text-[28px] font-[600] text-foreground leading-none tracking-tight">{value}</p>
      </div>
    </Card>
  );
}
