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
 */
export function sanitizeOperationGuideResult(
  result: ValidatedOperationGuideResult,
): OperationGuideResult {
  const steps: OperationGuideResult['steps'] = [];
  for (const step of result.steps) {
    const x = clamp(step.x, 0, 1000);
    const y = clamp(step.y, 0, 1000);
    const maxW = Math.max(0, 1000 - x);
    const maxH = Math.max(0, 1000 - y);
    const width = clamp(step.width, 0, maxW);
    const height = clamp(step.height, 0, maxH);
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

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
