import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface VoiceCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onResults?: (results: string[]) => void;
  onError?: (error: string) => void;
  onPartialResults?: (results: string[]) => void;
}

class VoiceService {
  private isInitialized = false;
  private callbacks: VoiceCallbacks = {};

  async initialize(callbacks: VoiceCallbacks): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      this.callbacks = callbacks;

      Voice.onSpeechStart = this.handleSpeechStart;
      Voice.onSpeechEnd = this.handleSpeechEnd;
      Voice.onSpeechResults = this.handleSpeechResults;
      Voice.onSpeechPartialResults = this.handleSpeechPartialResults;
      Voice.onSpeechError = this.handleSpeechError;

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Voice service initialization error:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for voice recognition.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  async startListening(locale: string = 'en-US'): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('Voice service not initialized');
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission required');
      }

      await Voice.start(locale);
      return true;
    } catch (error) {
      console.error('Start listening error:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to start voice recognition');
      return false;
    }
  }

  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Stop listening error:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      Voice.removeAllListeners();
      this.isInitialized = false;
      this.callbacks = {};
    } catch (error) {
      console.error('Destroy voice service error:', error);
    }
  }

  private handleSpeechStart = (e: SpeechStartEvent) => {
    this.callbacks.onStart?.();
  };

  private handleSpeechEnd = (e: SpeechEndEvent) => {
    this.callbacks.onEnd?.();
  };

  private handleSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      this.callbacks.onResults?.(e.value);
    }
  };

  private handleSpeechPartialResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      this.callbacks.onPartialResults?.(e.value);
    }
  };

  private handleSpeechError = (e: SpeechErrorEvent) => {
    const errorMessage = e.error?.message || e.error?.code || 'Voice recognition error';
    this.callbacks.onError?.(errorMessage);
  };
}

export const voiceService = new VoiceService();