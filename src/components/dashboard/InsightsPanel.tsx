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
        return 'text-green-700 dark:text-green-400';
      case 'down':
        return 'text-red-700 dark:text-red-400';
      case 'alert':
        return 'text-orange-700 dark:text-orange-400';
      default:
        return 'text-indigo-700 dark:text-indigo-400';
    }
  };

  return (
    <Card className={cn('border border-[#E5E7EB] dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900 rounded-xl', className)}>
      <div className="flex items-center justify-between p-5 pb-3 border-b border-[#E5E7EB] dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-md">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 blur-md opacity-30" />
            <Lightbulb className="h-4 w-4 text-white relative z-10" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">AI Insights</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Smart recommendations</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-3">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.trend);
          return (
            <div
              key={insight.id}
              className={cn(
                'p-4 rounded-xl border border-[#E5E7EB] dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-700/50 cursor-pointer group bg-white dark:bg-slate-900/50',
                getColors(insight.trend)
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300',
                  insight.trend === 'up' && 'bg-gradient-to-br from-green-500 to-emerald-600',
                  insight.trend === 'down' && 'bg-gradient-to-br from-red-500 to-rose-600',
                  insight.trend === 'alert' && 'bg-gradient-to-br from-orange-500 to-amber-600',
                  insight.trend === 'neutral' && 'bg-gradient-to-br from-indigo-500 to-blue-600'
                )}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.value && (
                    <p className="text-xl font-bold mt-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{insight.value}</p>
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
