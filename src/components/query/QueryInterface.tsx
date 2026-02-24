import { useState, useCallback } from 'react';
import { Send, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { VoiceButton } from './VoiceButton';
import { LanguageToggle } from './LanguageToggle';
import { SQLDisplay } from './SQLDisplay';
import { LoadingState } from './LoadingState';
import { DataTable } from './DataTable';
import { useQueryStore } from '@/stores/queryStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BarChart3, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';

// Garment manufacturing industry example queries
const exampleQueries = {
  en: [
    'Show today\'s attendance report',
    'Top selling products this month',
    'Low stock materials alert',
    'Production orders in progress',
    'Employees on leave this week',
    'Monthly sales by category',
  ],
  ur: [
    'Aaj ki attendance report dikhao',
    'Is mahine ki top selling products',
    'Kam stock materials ki list',
    'Production orders jo chal rahe hain',
    'Is hafte chutti pe employees',
    'Category wise monthly sales',
  ],
};

export function QueryInterface() {
  const {
    currentQuery,
    results,
    isLoading,
    loadingStep,
    language,
    setQuery,
    setLanguage,
    executeQuery,
    clearResults,
  } = useQueryStore();

  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!currentQuery.trim() || isLoading) return;
      await executeQuery();
    },
    [currentQuery, isLoading, executeQuery]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      setQuery(text);
    },
    [setQuery]
  );

  const handleExampleClick = (query: string) => {
    setQuery(query);
  };

  const handleSaveQuery = () => {
    toast.success('Query saved to favorites');
  };

  return (
    <div className="space-y-6">
      {/* Query Input Card */}
      <Card
        className={cn(
          'p-6 transition-all duration-300 border border-[#edf2f7] dark:border-slate-700/60 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] bg-gradient-to-b from-white to-[#fafafa] dark:from-slate-900 dark:to-slate-900/95 backdrop-blur-sm rounded-2xl relative',
          isFocused && 'shadow-[0_0_0_3px_rgba(99,102,241,0.1),0_10px_30px_-5px_rgba(99,102,241,0.2)]'
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main Input Area */}
          <div className={cn(
            "relative rounded-xl transition-all duration-300",
            isFocused && "p-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          )}>
            <Textarea
              value={currentQuery}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                language === 'en'
                  ? "Ask about employees, attendance, inventory, production, or sales..."
                  : "Employees, attendance, inventory, production, ya sales k baray me pochain..."
              }
              className={cn(
                "min-h-[100px] max-h-[180px] text-base resize-none pr-14 shadow-sm rounded-xl py-3 px-4 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300 w-full focus-visible:ring-0 focus-visible:outline-none",
                isFocused 
                  ? "border-0 bg-white dark:bg-slate-900" 
                  : "border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700"
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 transition-all",
              isFocused && "right-3"
            )}>
              <VoiceButton onTranscript={handleVoiceTranscript} language={language} />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Language:</span>
              <LanguageToggle current={language} onChange={setLanguage} />
            </div>

            <div className="flex items-center gap-3">
              {results && (
                <Button type="button" variant="outline" size="sm" onClick={clearResults} className="h-10 rounded-full font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 px-4 border-slate-200 dark:border-slate-700">
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  <span className="text-sm">Clear</span>
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading || !currentQuery.trim()} 
                className="h-11 px-6 rounded-full font-bold shadow-[0_10px_30px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(99,102,241,0.5)] bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0 hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 relative z-10"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-bold">Ask AI</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Example Queries */}
        {!results && !isLoading && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quick Start Examples</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {exampleQueries[language].map((query, index) => (
                <div
                  key={query}
                  className="group cursor-pointer bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-950/30 dark:hover:to-blue-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-lg p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_-5px_rgba(99,102,241,0.2)]"
                  onClick={() => handleExampleClick(query)}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded px-1.5 py-0.5">{index + 1}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{query}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Loading State */}
      {isLoading && <LoadingState currentStep={loadingStep} />}

      {/* Results */}
      {results && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Results Summary */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-md">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-base py-2 px-4 font-bold rounded-full border-2 shadow-sm bg-white dark:bg-slate-900">
                📊 {results.rowCount} rows
              </Badge>
              <Badge variant="outline" className="text-base py-2 px-4 font-bold rounded-full border-2 shadow-sm bg-white dark:bg-slate-900">
                ⚡ {results.executionTime.toFixed(2)}s
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleSaveQuery} className="rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 px-5 h-10">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 px-5 h-10">
                <BarChart3 className="h-4 w-4 mr-2" />
                Visualize
              </Button>
              <Button variant="outline" size="sm" onClick={handleSubmit} className="rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 px-5 h-10">
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-run
              </Button>
            </div>
          </div>

          {/* SQL Display */}
          <SQLDisplay sql={results.generatedSQL} editable showExplanation />

          {/* Data Table */}
          <DataTable data={results.results} columns={results.columns} />
        </div>
      )}
    </div>
  );
}
