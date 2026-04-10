/**
 * Types for the 「画面操作ガイド」 (screen-operation guide) feature.
 *
 * The shapes in this file are deliberately separate from the form-guide
 * `Annotation` types so the two features can evolve independently. They
 * only converge at the UI layer, where the overlay renders both via the
 * same `bboxToPixelRect` helper after normalizing the bbox units.
 */

export type OperationTargetType =
  | 'button'
  | 'menu'
  | 'tab'
  | 'link'
  | 'file'
  | 'icon'
  | 'unknown';

/**
 * One step the user should perform. All bbox coordinates are in the
 * **0–1000 normalized space** required by the operation-guide spec —
 * NOT the 0–1 space used by `Annotation` / `BBox`. The overlay layer
 * divides by 1000 before reusing `bboxToPixelRect`.
 */
export interface OperationStep {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetType: OperationTargetType;
  titleJa: string;
  actionJa: string;
  detailJa: string;
  /** 0–1 confidence estimate supplied by the model. */
  confidence: number;
}

/** Things the model could not locate with confidence. */
export interface OperationUnresolved {
  id: string;
  reason: string;
  question: string;
}

export interface OperationGuideResult {
  summaryJa: string;
  steps: OperationStep[];
  unresolved: OperationUnresolved[];
  safetyWarnings: string[];
}
