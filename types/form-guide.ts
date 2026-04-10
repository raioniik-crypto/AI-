/**
 * Normalized bounding box for an annotation. All values are in the range
 * [0, 1] and represent fractions of the image's width/height.
 */
export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * One field annotation returned by GPT-4o. `bbox` may be null if the model
 * could not identify a specific field in the screenshot.
 */
export interface Annotation {
  id: number;
  label: string;
  value: string;
  note: string;
  bbox: BBox | null;
}

export interface AssistantResult {
  annotations: Annotation[];
  explanation: string;
}

export interface CurrentImage {
  dataUrl: string;
  width: number;
  height: number;
}

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string;
      role: 'assistant';
      imageDataUrl: string;
      imageWidth: number;
      imageHeight: number;
      annotations: Annotation[];
      explanation: string;
    }
  | { id: string; role: 'system-warning'; detectedCategories: string[] }
  | { id: string; role: 'system-error'; message: string };

export interface AnalyzeRequestBody {
  imageDataUrl: string;
  userText: string;
  history: Array<
    | { role: 'user'; text: string }
    | { role: 'assistant'; explanation: string }
  >;
}

export interface AnalyzeSuccessResponse {
  ok: true;
  annotations: Annotation[];
  explanation: string;
}

export interface AnalyzeSensitiveResponse {
  ok: false;
  reason: 'sensitive';
  detectedCategories: string[];
}

export interface AnalyzeErrorResponse {
  ok: false;
  reason: 'invalid' | 'no-form' | 'upstream' | 'timeout';
  message: string;
}

export type AnalyzeResponse =
  | AnalyzeSuccessResponse
  | AnalyzeSensitiveResponse
  | AnalyzeErrorResponse;

export interface SensitiveDetectionResult {
  hasSensitive: boolean;
  categories: string[];
}
