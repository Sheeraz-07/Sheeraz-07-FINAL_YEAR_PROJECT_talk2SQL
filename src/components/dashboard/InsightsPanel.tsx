import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  title: string;
  description: string;
  trend: 'up' | 'down' | 'alert' | 'neutral';
  value?: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  className?: string;
}

export function InsightsPanel({ insights, className }: InsightsPanelProps) {
  const getIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      case 'alert':
        return AlertTriangle;
      default:
        return Lightbulb;
    }
  };

  const getColors = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'bg-success/10 text-success border-success/20';
      case 'down':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'alert':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = getIcon(insight.trend);
          return (
            <div
              key={insight.id}
              className={cn(
                'p-4 rounded-lg border transition-colors hover:bg-secondary/30',
                getColors(insight.trend)
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{insight.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                  {insight.value && (
                    <p className="text-lg font-bold mt-2">{insight.value}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
