import { z } from 'zod';
import type { OperationGuideResult } from '@/types/operation-guide';

/**
 * Max number of steps the UI will render. The model is prompted to
 * return "1〜3" but we still clamp here defensively in case it returns
 * more.
 */
export const MAX_OPERATION_STEPS = 3;

export const OperationTargetTypeSchema = z.enum([
  'button',
  'menu',
  'tab',
  'link',
  'file',
  'icon',
  'unknown',
]);

export const OperationStepSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  targetType: OperationTargetTypeSchema,
  titleJa: z.string(),
  actionJa: z.string(),
  detailJa: z.string(),
  confidence: z.number(),
});

export const OperationUnresolvedSchema = z.object({
  id: z.string().min(1),
  reason: z.string(),
  question: z.string(),
});

export const OperationGuideResultSchema = z.object({
  summaryJa: z.string(),
  steps: z.array(OperationStepSchema),
  unresolved: z.array(OperationUnresolvedSchema),
  safetyWarnings: z.array(z.string()),
});

export type ValidatedOperationGuideResult = z.infer<
  typeof OperationGuideResultSchema
>;

/**
 * JSON Schema equivalent used with OpenAI's structured-output mode.
 * Strict mode requires every field in `required` and
 * `additionalProperties: false` on every object — mirrors how the
 * existing FormGuide schema is shaped.
 */
export const OPERATION_GUIDE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summaryJa: { type: 'string' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          targetType: {
            type: 'string',
            enum: ['button', 'menu', 'tab', 'link', 'file', 'icon', 'unknown'],
          },
          titleJa: { type: 'string' },
          actionJa: { type: 'string' },
          detailJa: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: [
          'id',
          'x',
          'y',
          'width',
          'height',
          'targetType',
          'titleJa',
          'actionJa',
          'detailJa',
          'confidence',
        ],
      },
    },
    unresolved: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          reason: { type: 'string' },
          question: { type: 'string' },
        },
        required: ['id', 'reason', 'question'],
      },
    },
    safetyWarnings: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['summaryJa', 'steps', 'unresolved', 'safetyWarnings'],
} as const;

/**
 * Clamps each step's bbox into the 0–1000 canvas and drops any step
 * whose rect becomes degenerate (zero area) after clamping. Also caps
 * the number of steps at `MAX_OPERATION_STEPS` and confidence into
 * [0, 1]. Unresolved and warnings pass through unchanged.
 *
 * Phase 1.5 hardening: if the model returns a 0–1 normalized bbox
 * (instead of the 0–1000 we asked for), `needsBboxRescale` detects it
 * and the values are multiplied by 1000 before clamping. Legit 0–1000
 * rects cannot all have max ≤ 1 without being broken zero-area boxes,
 * so the heuristic is safe.
 */
export function sanitizeOperationGuideResult(
  result: ValidatedOperationGuideResult,
): OperationGuideResult {
  const scale = needsBboxRescale(result.steps) ? 1000 : 1;

  const steps: OperationGuideResult['steps'] = [];
  for (const step of result.steps) {
    const x = clamp(step.x * scale, 0, 1000);
    const y = clamp(step.y * scale, 0, 1000);
    const maxW = Math.max(0, 1000 - x);
    const maxH = Math.max(0, 1000 - y);
    const width = clamp(step.width * scale, 0, maxW);
    const height = clamp(step.height * scale, 0, maxH);
    if (width <= 0 || height <= 0) continue;

    steps.push({
      id: step.id,
      x,
      y,
      width,
      height,
      targetType: step.targetType,
      titleJa: step.titleJa,
      actionJa: step.actionJa,
      detailJa: step.detailJa,
      confidence: clamp(step.confidence, 0, 1),
    });

    if (steps.length >= MAX_OPERATION_STEPS) break;
  }

  return {
    summaryJa: result.summaryJa,
    steps,
    unresolved: result.unresolved,
    safetyWarnings: result.safetyWarnings,
  };
}

/**
 * Detects whether the model returned bbox values in the 0–1 normalized
 * range instead of the requested 0–1000 range. We only rescale when
 * every finite bbox value across every step stays within [0, 1] — if
 * even one value exceeds 1, we assume the model is using 0–1000 and
 * let the regular clamp handle it.
 */
function needsBboxRescale(
  steps: ValidatedOperationGuideResult['steps'],
): boolean {
  if (steps.length === 0) return false;
  let maxValue = 0;
  for (const step of steps) {
    for (const value of [step.x, step.y, step.width, step.height]) {
      if (!Number.isFinite(value)) continue;
      const abs = Math.abs(value);
      if (abs > maxValue) maxValue = abs;
    }
  }
  return maxValue > 0 && maxValue <= 1;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
