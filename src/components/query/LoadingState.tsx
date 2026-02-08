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
    <div className={cn('p-6 bg-card rounded-xl border border-border animate-fade-in', className)}>
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary/20" />
        </div>
      </div>
      
      <h3 className="text-center text-lg font-semibold mb-6">
        Processing your query...
      </h3>

      <div className="space-y-3">
        {steps.map((step) => {
          const isComplete = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
                isComplete && 'bg-success/10',
                isActive && 'bg-primary/10'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center h-6 w-6 rounded-full transition-all',
                  isComplete && 'bg-success',
                  isActive && 'bg-primary animate-pulse',
                  !isComplete && !isActive && 'bg-secondary'
                )}
              >
                {isComplete ? (
                  <CheckCircle className="h-4 w-4 text-success-foreground" />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 text-primary-foreground animate-spin" />
                ) : (
                  <span className="text-xs text-muted-foreground">{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isComplete && 'text-success',
                  isActive && 'text-primary',
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
