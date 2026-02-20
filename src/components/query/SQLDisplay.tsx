import { useState } from 'react';
import { ChevronDown, ChevronUp, Code, Copy, Check, Edit2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SQLDisplayProps {
  sql: string;
  editable?: boolean;
  onEdit?: (newSQL: string) => void;
  showExplanation?: boolean;
  className?: string;
}

export function SQLDisplay({ sql, editable = false, onEdit, showExplanation = true, className }: SQLDisplayProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSQL, setEditedSQL] = useState(sql);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onEdit?.(editedSQL);
    setIsEditing(false);
  };

  // Simple SQL explanation
  const getExplanation = (sql: string) => {
    if (sql.toLowerCase().includes('select')) {
      return 'This query retrieves data from the database matching your request.';
    }
    return 'SQL query generated from your natural language input.';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border-0 shadow-xl overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-950/30 dark:hover:to-blue-950/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-md">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold">Generated SQL</span>
            </div>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editedSQL}
                  onChange={(e) => setEditedSQL(e.target.value)}
                  className="font-mono text-sm min-h-[180px] bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-2 rounded-xl shadow-sm"
                />
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={handleSaveEdit} className="rounded-full px-5 font-semibold shadow-md hover:shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0 hover:scale-105 transition-all duration-200">
                    Save Changes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="rounded-full px-5 font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <pre className="p-5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 overflow-x-auto border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                  <code className="text-sm font-mono text-foreground whitespace-pre-wrap font-semibold">
                    {sql}
                  </code>
                </pre>
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy SQL</TooltipContent>
                  </Tooltip>
                  {editable && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit SQL</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}

            {showExplanation && !isEditing && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-sm border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                  <Info className="h-4 w-4 text-white flex-shrink-0" />
                </div>
                <p className="text-blue-900 dark:text-blue-200 font-medium">{getExplanation(sql)}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
