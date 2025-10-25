import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

export interface VoiceRecognitionCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onResults?: (results: string[]) => void;
  onError?: (error: string) => void;
  onPartialResults?: (results: string[]) => void;
}

export interface SpeechToTextOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface TextToSpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
}

class VoiceRecognitionService {
  private isInitialized = false;
  private callbacks: VoiceRecognitionCallbacks = {};

  /**
   * Check if voice recognition is supported on the device
   */
  async checkSupport(): Promise<boolean> {
    try {
      // Check if Voice module is available
      if (!Voice) {
        console.error('Voice module is not available');
        return false;
      }

      // Check if the native module is properly linked
      try {
        // Try to access a method to verify native module is available
        const available = await Voice.isAvailable();
        if (!available) {
          console.error('Voice recognition is not available on this device');
          return false;
        }
        return true;
      } catch (error) {
        console.error('Native module not properly linked:', error);
        // If we get "startSpeech of null" error, the native module isn't linked
        if (error instanceof Error && error.message.includes('null')) {
          console.error('Native Voice module is not linked. Please rebuild the app.');
          return false;
        }
        return false;
      }
    } catch (error) {
      console.error('Error checking voice support:', error);
      return false;
    }
  }

  /**
   * Request microphone permission (Android only)
   */
  async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        // Check if permission is already granted
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );

        if (hasPermission) {
          return true;
        }

        // Request permission
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

    // iOS permissions are handled automatically
    return true;
  }

  /**
   * Initialize voice recognition with callbacks
   */
  async initialize(callbacks: VoiceRecognitionCallbacks): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.warn('Voice recognition already initialized');
        return true;
      }

      // Check support first
      const isSupported = await this.checkSupport();
      if (!isSupported) {
        const errorMsg = 'Voice recognition is not supported. The native module may not be properly linked. Please rebuild the app.';
        console.error(errorMsg);
        callbacks.onError?.(errorMsg);
        return false;
      }

      this.callbacks = callbacks;

      // Set up event listeners with error handling
      try {
        Voice.onSpeechStart = this.handleSpeechStart;
        Voice.onSpeechEnd = this.handleSpeechEnd;
        Voice.onSpeechResults = this.handleSpeechResults;
        Voice.onSpeechPartialResults = this.handleSpeechPartialResults;
        Voice.onSpeechError = this.handleSpeechError;
      } catch (error) {
        console.error('Error setting up Voice listeners:', error);
        callbacks.onError?.('Failed to set up voice recognition listeners');
        return false;
      }

      this.isInitialized = true;
      console.log('Voice recognition initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing voice recognition:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to initialize voice recognition';
      callbacks.onError?.(errorMsg);
      return false;
    }
  }

  /**
   * Start voice recognition
   */
  async start(locale: string = 'en-US'): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('Voice recognition not initialized. Call initialize() first.');
      }

      // Request permission
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission is required for voice recognition');
      }

      // Start voice recognition with error handling
      try {
        await Voice.start(locale);
        console.log('Voice recognition started');
        return true;
      } catch (error) {
        // Check if this is the native module error
        if (error instanceof Error && error.message.includes('null')) {
          throw new Error('Native Voice module not linked. Please rebuild the app after running: cd ios && pod install && cd ..');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start voice recognition';
      this.callbacks.onError?.(errorMessage);
      Alert.alert('Voice Recognition Error', errorMessage);
      return false;
    }
  }

  /**
   * Stop voice recognition
   */
  async stop(): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('Voice recognition not initialized');
        return;
      }
      await Voice.stop();
      console.log('Voice recognition stopped');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  /**
   * Cancel voice recognition
   */
  async cancel(): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('Voice recognition not initialized');
        return;
      }
      await Voice.cancel();
      console.log('Voice recognition cancelled');
    } catch (error) {
      console.error('Error cancelling voice recognition:', error);
    }
  }

  /**
   * Destroy voice recognition and clean up
   */
  async destroy(): Promise<void> {
    try {
      if (!this.isInitialized) {
        return;
      }
      await Voice.destroy();
      Voice.removeAllListeners();
      this.isInitialized = false;
      this.callbacks = {};
      console.log('Voice recognition destroyed');
    } catch (error) {
      console.error('Error destroying voice recognition:', error);
    }
  }

  /**
   * Check if currently recognizing
   */
  async isRecognizing(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }
      const recognizingVal = await Voice.isRecognizing();
      return Boolean(recognizingVal);
    } catch (error) {
      console.error('Error checking recognition status:', error);
      return false;
    }
  }

  /**
   * Enhanced speech recognition with options
   */
  async startWithOptions(options: SpeechToTextOptions = {}): Promise<boolean> {
    const {
      language = 'en-US',
      continuous = false,
      interimResults = true,
      maxAlternatives = 1
    } = options;

    try {
      if (!this.isInitialized) {
        throw new Error('Voice recognition not initialized. Call initialize() first.');
      }

      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission is required for voice recognition');
      }

      await Voice.start(language, {
        EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
        EXTRA_CALLING_PACKAGE: 'com.anonymous.digitalinkrecognitionapp',
        EXTRA_PARTIAL_RESULTS: interimResults,
        EXTRA_MAX_RESULTS: maxAlternatives,
        REQUEST_PERMISSIONS_AUTO: true,
      });

      console.log('Enhanced voice recognition started with options:', options);
      return true;
    } catch (error) {
      console.error('Error starting enhanced voice recognition:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start voice recognition';
      this.callbacks.onError?.(errorMessage);
      return false;
    }
  }

  /**
   * Text-to-speech functionality
   */
  async speak(text: string, options: TextToSpeechOptions = {}): Promise<void> {
    const {
      language = 'en-US',
      pitch = 1.0,
      rate = 1.0,
      voice
    } = options;

    try {
      const speechOptions: Speech.SpeechOptions = {
        language,
        pitch,
        rate,
        voice,
      };

      await Speech.speak(text, speechOptions);
      console.log('Text-to-speech completed:', text);
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  /**
   * Stop text-to-speech
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
      console.log('Text-to-speech stopped');
    } catch (error) {
      console.error('Error stopping text-to-speech:', error);
    }
  }

  /**
   * Get available voices for text-to-speech
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  /**
   * Check if text-to-speech is currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('Error checking speech status:', error);
      return false;
    }
  }

  // Event handlers
  private handleSpeechStart = (e: SpeechStartEvent) => {
    console.log('Speech started:', e);
    this.callbacks.onStart?.();
  };

  private handleSpeechEnd = (e: SpeechEndEvent) => {
    console.log('Speech ended:', e);
    this.callbacks.onEnd?.();
  };

  private handleSpeechResults = (e: SpeechResultsEvent) => {
    console.log('Speech results:', e.value);
    if (e.value && e.value.length > 0) {
      this.callbacks.onResults?.(e.value);
    }
  };

  private handleSpeechPartialResults = (e: SpeechResultsEvent) => {
    console.log('Partial results:', e.value);
    if (e.value && e.value.length > 0) {
      this.callbacks.onPartialResults?.(e.value);
    }
  };

  private handleSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech error:', e.error);
    const errorMessage = e.error?.message || e.error?.code || 'Unknown voice recognition error';
    this.callbacks.onError?.(errorMessage);
  };
}

// Export singleton instance
export const voiceRecognitionService = new VoiceRecognitionService();