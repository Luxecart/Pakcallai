// Speech recognition & synthesis service for Urdu, Punjabi, and English

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

// Check speech recognition support
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Check speech synthesis support
export const isSpeechSynthesisSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
};

// Map app language to BCP 47 language codes
export const getLanguageCode = (lang: string): string => {
  switch (lang) {
    case 'urdu':
      return 'ur-PK';
    case 'punjabi':
      return 'pa-PK';
    case 'english':
      return 'en-PK';
    case 'bilingual':
      return 'ur-PK';
    default:
      return 'en-US';
  }
};

export class SpeechAssistant {
  private recognition: any = null;
  private isListening = false;
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public startListening(
    language: string,
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser environment.');
      return false;
    }

    try {
      this.recognition.lang = getLanguageCode(language);
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }

        onResult({ transcript, isFinal });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'Failed to start microphone');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop errors
      }
      this.isListening = false;
    }
  }

  public speak(
    text: string,
    language: string,
    pitch: number = 1.0,
    rate: number = 1.0,
    onEnd?: () => void
  ): void {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    try {
      this.synth.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = Math.max(0.5, Math.min(2, pitch));
      utterance.rate = Math.max(0.6, Math.min(1.5, rate));

      const langCode = getLanguageCode(language);
      utterance.lang = langCode;

      // Find best available voice
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find(
        (v) =>
          v.lang.startsWith(langCode.substring(0, 2)) ||
          v.lang.includes('ur') ||
          v.lang.includes('hi') ||
          v.name.toLowerCase().includes('urdu') ||
          v.name.toLowerCase().includes('pakistan')
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        onEnd?.();
      };

      utterance.onerror = () => {
        onEnd?.();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      onEnd?.();
    }
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechAssistant = new SpeechAssistant();
