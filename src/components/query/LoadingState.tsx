import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  currentStep: number;
  className?: string;
}

const steps = [
  { id: 1, label: 'Understanding query' },
  { id: 2, label: 'Generating SQL' },
  { id: 3, label: 'Executing query' },
  { id: 4, label: 'Formatting results' },
];

export function LoadingState({ currentStep, className }: LoadingStateProps) {
  return (
    <div className={cn('p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border-0 shadow-xl animate-fade-in', className)}>
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-indigo-300 dark:border-indigo-800 animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-center text-2xl font-bold mb-8 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
        Processing your query...
      </h3>

      <div className="space-y-4">
        {steps.map((step) => {
          const isComplete = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border-2',
                isComplete && 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-800 shadow-sm',
                isActive && 'bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 border-indigo-300 dark:border-indigo-800 shadow-md',
                !isComplete && !isActive && 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-full transition-all shadow-md',
                  isComplete && 'bg-gradient-to-br from-green-500 to-emerald-600',
                  isActive && 'bg-gradient-to-br from-indigo-600 to-blue-600 animate-pulse',
                  !isComplete && !isActive && 'bg-slate-300 dark:bg-slate-700'
                )}
              >
                {isComplete ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-bold">{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-base font-semibold transition-colors',
                  isComplete && 'text-green-900 dark:text-green-200',
                  isActive && 'text-indigo-900 dark:text-indigo-200',
                  !isComplete && !isActive && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
