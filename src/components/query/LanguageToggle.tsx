import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  current: 'en' | 'ur';
  onChange: (lang: 'en' | 'ur') => void;
  className?: string;
}

export function LanguageToggle({ current, onChange, className }: LanguageToggleProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-secondary rounded-lg', className)}>
      <Button
        variant={current === 'en' ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'h-8 px-3 text-xs font-medium transition-all',
          current === 'en' ? 'shadow-sm' : 'hover:bg-secondary'
        )}
        onClick={() => onChange('en')}
      >
        English
      </Button>
      <Button
        variant={current === 'ur' ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'h-8 px-3 text-xs font-medium transition-all',
          current === 'ur' ? 'shadow-sm' : 'hover:bg-secondary'
        )}
        onClick={() => onChange('ur')}
      >
        Roman Urdu
      </Button>
    </div>
  );
}
