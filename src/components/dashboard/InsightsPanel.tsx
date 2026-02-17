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
    <Card className={cn('border hover:border-accent/50 hover:shadow-xl transition-all duration-300 overflow-hidden', className)}>
      <div className="flex items-center justify-between p-5 pb-4 border-b bg-gradient-to-br from-chart-4/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-chart-4/20 to-chart-4/10 shadow-sm">
            <Lightbulb className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <h3 className="font-bold text-base">AI Insights</h3>
            <p className="text-xs text-muted-foreground font-semibold">Smart recommendations</p>
          </div>
        </div>
      </div>
      <div className="p-5 pt-4 space-y-3">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.trend);
          return (
            <div
              key={insight.id}
              className={cn(
                'p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group hover:border-accent/50 dark:hover:border-accent/60',
                getColors(insight.trend)
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-semibold">
                    {insight.description}
                  </p>
                  {insight.value && (
                    <p className="text-xl font-bold mt-2.5 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{insight.value}</p>
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
