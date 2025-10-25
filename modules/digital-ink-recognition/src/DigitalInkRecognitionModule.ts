
// File: modules/digital-ink-recognition/src/DigitalInkRecognitionModule.ts

import { NativeModule, requireNativeModule } from 'expo-modules-core';

declare class DigitalInkRecognitionModuleClass extends NativeModule {
  initializeRecognizer(languageTag: string): Promise<boolean>;
  downloadModel(languageTag: string): Promise<boolean>;
  isModelDownloaded(languageTag: string): Promise<boolean>;
  recognizeInk(strokes: any[]): Promise<any[]>;
  deleteModel(languageTag: string): Promise<boolean>;
}

export default requireNativeModule<DigitalInkRecognitionModuleClass>('DigitalInkRecognition');
 
