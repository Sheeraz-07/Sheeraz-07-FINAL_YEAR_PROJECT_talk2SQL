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
        return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'down':
        return 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'alert':
        return 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <Card className={cn('border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl', className)}>
      <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-pink-50/50 dark:from-purple-950/50 dark:to-pink-950/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Insights</h3>
            <p className="text-sm text-muted-foreground font-medium">Smart recommendations</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.trend);
          return (
            <div
              key={insight.id}
              className={cn(
                'p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer group',
                getColors(insight.trend)
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'p-2.5 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300',
                  insight.trend === 'up' && 'bg-gradient-to-br from-green-500 to-emerald-600',
                  insight.trend === 'down' && 'bg-gradient-to-br from-red-500 to-rose-600',
                  insight.trend === 'alert' && 'bg-gradient-to-br from-orange-500 to-amber-600',
                  insight.trend === 'neutral' && 'bg-gradient-to-br from-indigo-500 to-blue-600'
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-base">{insight.title}</p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.value && (
                    <p className="text-2xl font-bold mt-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{insight.value}</p>
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
