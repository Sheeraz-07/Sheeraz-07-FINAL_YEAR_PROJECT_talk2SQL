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
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Generated SQL</span>
            </div>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedSQL}
                  onChange={(e) => setEditedSQL(e.target.value)}
                  className="font-mono text-sm min-h-[120px] bg-secondary/30"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <pre className="p-4 rounded-lg bg-secondary/30 overflow-x-auto">
                  <code className="text-sm font-mono text-foreground whitespace-pre-wrap">
                    {sql}
                  </code>
                </pre>
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
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
                          className="h-7 w-7"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit SQL</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}

            {showExplanation && !isEditing && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 text-sm">
                <Info className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                <p className="text-accent-foreground">{getExplanation(sql)}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
