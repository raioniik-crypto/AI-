import type { OperationGuideResult } from './operation-guide';

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

/**
 * Which "guide" the user is asking for:
 *   - `form`      : the original FormGuide — fill a foreign-language form
 *   - `operation` : the new 画面操作ガイド — point at buttons/menus/files
 *
 * Stored in the Zustand store and passed to `/api/analyze` so the server
 * can dispatch to the matching system prompt + response schema.
 */
export type GuideMode = 'form' | 'operation';

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string;
      role: 'assistant';
      imageDataUrl: string;
      annotations: Annotation[];
      explanation: string;
    }
  | {
      id: string;
      role: 'assistant-operation';
      imageDataUrl: string;
      result: OperationGuideResult;
    }
  | { id: string; role: 'system-warning'; detectedCategories: string[] }
  | { id: string; role: 'system-error'; message: string };

export interface AnalyzeRequestBody {
  imageDataUrl: string;
  userText: string;
  /** Defaults to `'form'` on the server when omitted. */
  guideMode?: GuideMode;
  history: Array<
    | { role: 'user'; text: string }
    | { role: 'assistant'; explanation: string }
  >;
}

export interface AnalyzeFormSuccessResponse {
  ok: true;
  mode: 'form';
  annotations: Annotation[];
  explanation: string;
}

export interface AnalyzeOperationSuccessResponse {
  ok: true;
  mode: 'operation';
  result: OperationGuideResult;
}

export interface AnalyzeSensitiveResponse {
  ok: false;
  reason: 'sensitive';
  detectedCategories: string[];
}

export interface AnalyzeErrorResponse {
  ok: false;
  reason: 'invalid' | 'no-form' | 'no-target' | 'upstream' | 'timeout';
  message: string;
}

export type AnalyzeResponse =
  | AnalyzeFormSuccessResponse
  | AnalyzeOperationSuccessResponse
  | AnalyzeSensitiveResponse
  | AnalyzeErrorResponse;

export interface SensitiveDetectionResult {
  hasSensitive: boolean;
  categories: string[];
}
