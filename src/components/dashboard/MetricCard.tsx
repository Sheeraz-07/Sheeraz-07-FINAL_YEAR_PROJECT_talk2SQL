import { LucideIcon } from 'lucide-react';
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
    <Card className={cn('p-6 hover:shadow-lg transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-destructive',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          trend === 'up' && 'bg-success/10 text-success',
          trend === 'down' && 'bg-destructive/10 text-destructive',
          (!trend || trend === 'neutral') && 'bg-primary/10 text-primary'
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
