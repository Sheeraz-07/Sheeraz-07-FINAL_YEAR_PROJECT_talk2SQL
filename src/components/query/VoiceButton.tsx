import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  language: 'en' | 'ur';
  className?: string;
}

export function VoiceButton({ onTranscript, language, className }: VoiceButtonProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceInput(language);

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn('h-8 w-8 rounded-full opacity-50 cursor-not-allowed', className)}
            disabled
          >
            <MicOff className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voice input not supported in this browser</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isListening ? 'destructive' : 'outline'}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-full transition-all duration-200',
              isListening && 'animate-pulse shadow-lg shadow-destructive/30',
              className
            )}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? (
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-destructive-foreground rounded-full voice-bar"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? 'Stop listening' : 'Start voice input'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs font-medium text-destructive animate-pulse">
            Listening...
          </span>
        </div>
      )}

      {/* Show interim transcript */}
      {(isListening && interimTranscript) && (
        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg p-2 shadow-lg min-w-[200px] max-w-[300px]">
          <p className="text-sm text-muted-foreground italic">"{interimTranscript}"</p>
        </div>
      )}
    </div>
  );
}
