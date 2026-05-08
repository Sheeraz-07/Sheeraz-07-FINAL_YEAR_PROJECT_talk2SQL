'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ReportGenerationProgressBarProps {
  isGenerating: boolean;
  status?: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number; // 0-100
}

export function ReportGenerationProgressBar({
  isGenerating,
  status = 'idle',
  message = 'Generating report...',
  progress = 0,
}: ReportGenerationProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isGenerating) {
      // Simulate progress
      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          const next = prev + Math.random() * 25;
          return Math.min(next, 95); // Cap at 95 until complete
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      if (status === 'success') {
        setDisplayProgress(100);
        const timeout = setTimeout(() => setDisplayProgress(0), 2000);
        return () => clearTimeout(timeout);
      } else {
        setDisplayProgress(0);
      }
    }
  }, [isGenerating, status]);

  if (!isGenerating && status === 'idle') {
    return null;
  }

  const bgColor = status === 'error' ? 'bg-red-500' : status === 'success' ? 'bg-green-500' : 'bg-indigo-600';
  const textColor =
    status === 'error' ? 'text-red-700 dark:text-red-400' : status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-indigo-700 dark:text-indigo-400';
  const borderColor =
    status === 'error' ? 'border-red-200 dark:border-red-800' : status === 'success' ? 'border-green-200 dark:border-green-800' : 'border-indigo-200 dark:border-indigo-800';

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 border-b ${borderColor} bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm`}>
      <div className="max-w-full mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          {status === 'error' ? (
            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${textColor}`} />
          ) : status === 'success' ? (
            <CheckCircle className={`h-5 w-5 flex-shrink-0 ${textColor}`} />
          ) : (
            <Loader className={`h-5 w-5 flex-shrink-0 ${textColor} animate-spin`} />
          )}
          <p className={`text-sm font-semibold ${textColor}`}>{message}</p>
        </div>

        {/* Progress Bar */}
        {(isGenerating || status === 'success') && (
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${bgColor} rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${Math.round(displayProgress)}%` }}
            />
          </div>
        )}

        {isGenerating && (
          <p className="text-xs text-muted-foreground mt-2">
            This may take a few seconds. Please don't close this window.
          </p>
        )}
      </div>
    </div>
  );
}
