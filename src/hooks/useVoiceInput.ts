import { useState, useEffect, useCallback } from 'react';

interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export const useVoiceInput = (language: 'en' | 'ur' = 'en') => {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: false,
  });

  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setState((prev) => ({ ...prev, error: 'Speech recognition not supported in this browser', isSupported: false }));
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language === 'en' ? 'en-US' : 'ur-PK';

    recognitionInstance.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setState((prev) => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim,
      }));
    };

    recognitionInstance.onerror = (event) => {
      let errorMessage = 'An error occurred during speech recognition';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable in browser settings.';
          break;
      }
      setState((prev) => ({ ...prev, error: errorMessage, isListening: false }));
    };

    recognitionInstance.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
    };

    setRecognition(recognitionInstance);
    setState((prev) => ({ ...prev, isSupported: true }));

    return () => {
      recognitionInstance.stop();
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (recognition) {
      setState((prev) => ({ ...prev, isListening: true, error: null, transcript: '', interimTranscript: '' }));
      recognition.start();
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setState((prev) => ({ ...prev, isListening: false }));
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
};
