import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-accent border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-muted/50" />
        <div className="flex-1">
          <div className="h-4 bg-muted/50 rounded w-1/4 mb-2" />
          <div className="h-3 bg-muted/50 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted/50 rounded w-full" />
        <div className="h-3 bg-muted/50 rounded w-5/6" />
        <div className="h-3 bg-muted/50 rounded w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border/50 bg-card animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/50" />
            <div className="flex-1">
              <div className="h-3 bg-muted/50 rounded w-3/4 mb-2" />
              <div className="h-2 bg-muted/50 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
