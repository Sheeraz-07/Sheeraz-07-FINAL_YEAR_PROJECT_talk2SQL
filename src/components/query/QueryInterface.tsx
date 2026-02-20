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
          'p-6 transition-all duration-300 border-0 shadow-xl hover:shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl',
          isFocused && 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20'
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main Input Area */}
          <div className="relative">
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
              className="min-h-[120px] max-h-[200px] text-base resize-none pr-14 focus-visible:ring-0 border-2 border-slate-200 dark:border-slate-700 shadow-sm bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl py-4 px-5 placeholder:text-muted-foreground/60 hover:border-indigo-300 dark:hover:border-indigo-700 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-200"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
                <Button type="button" variant="outline" size="sm" onClick={clearResults} className="h-11 rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 px-5">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <span className="text-sm">Clear</span>
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading || !currentQuery.trim()} 
                className="h-11 px-6 rounded-full font-bold shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0 hover:scale-105 transition-all duration-200"
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
                    <Send className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Example Queries */}
        {!results && !isLoading && (
          <div className="mt-5 pt-5 border-t-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">💡 Quick Start Examples</span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent"></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {exampleQueries[language].map((query, index) => (
                <Badge
                  key={query}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/50 dark:hover:to-blue-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:scale-105 transition-all duration-200 py-2 px-4 text-sm font-semibold shadow-sm hover:shadow-md border-2 rounded-full"
                  onClick={() => handleExampleClick(query)}
                >
                  <span className="opacity-60 mr-2 font-bold">{index + 1}.</span>
                  {query}
                </Badge>
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
