// File: modules/digital-ink-recognition/src/DigitalInkRecognition.ts

import { NativeModulesProxy } from 'expo-modules-core';
import DigitalInkRecognitionModule from './DigitalInkRecognitionModule';

export interface InkPoint {
  x: number;
  y: number;
  timestamp?: number;
}

export interface InkStroke {
  points: InkPoint[];
}

export interface RecognitionCandidate {
  text: string;
  score: number;
}

export class DigitalInkRecognition {
  static async initializeRecognizer(languageTag: string): Promise<boolean> {
    return await DigitalInkRecognitionModule.initializeRecognizer(languageTag);
  }

  static async downloadModel(languageTag: string): Promise<boolean> {
    return await DigitalInkRecognitionModule.downloadModel(languageTag);
  }

  static async isModelDownloaded(languageTag: string): Promise<boolean> {
    return await DigitalInkRecognitionModule.isModelDownloaded(languageTag);
  }

  static async recognizeInk(strokes: InkStroke[]): Promise<RecognitionCandidate[]> {
    return await DigitalInkRecognitionModule.recognizeInk(strokes);
  }

  static async deleteModel(languageTag: string): Promise<boolean> {
    return await DigitalInkRecognitionModule.deleteModel(languageTag);
  }
}


