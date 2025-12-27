export interface ConversionResult {
  html: string;
  rawText: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  type: 'image' | 'pdf';
}