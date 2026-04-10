import { z } from 'zod';

export const BBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

export const AnnotationSchema = z.object({
  id: z.number().int().min(1),
  label: z.string().min(1),
  value: z.string(),
  note: z.string(),
  bbox: BBoxSchema.nullable(),
});

export const AnalyzeResultSchema = z.object({
  annotations: z.array(AnnotationSchema),
  explanation: z.string(),
});

export type ValidatedAnalyzeResult = z.infer<typeof AnalyzeResultSchema>;

/**
 * JSON Schema (draft-07 compatible subset) equivalent of AnalyzeResultSchema,
 * shaped for OpenAI's `response_format: { type: 'json_schema', ... }` option.
 *
 * OpenAI's structured-output mode requires `additionalProperties: false` and
 * every field listed in `required`, so we cannot express `bbox: nullable`
 * directly — we use `anyOf` instead.
 */
export const ANALYZE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    annotations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'integer', minimum: 1 },
          label: { type: 'string' },
          value: { type: 'string' },
          note: { type: 'string' },
          bbox: {
            anyOf: [
              { type: 'null' },
              {
                type: 'object',
                additionalProperties: false,
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                  w: { type: 'number' },
                  h: { type: 'number' },
                },
                required: ['x', 'y', 'w', 'h'],
              },
            ],
          },
        },
        required: ['id', 'label', 'value', 'note', 'bbox'],
      },
    },
    explanation: { type: 'string' },
  },
  required: ['annotations', 'explanation'],
} as const;

/**
 * Clamps every bbox coordinate into [0, 1]. Any annotation whose bbox becomes
 * degenerate (width or height <= 0 after clamping) is turned into a null-bbox
 * entry so the client legend can still display it.
 */
export function clampAnnotations(
  result: ValidatedAnalyzeResult,
): ValidatedAnalyzeResult {
  return {
    explanation: result.explanation,
    annotations: result.annotations.map((annotation) => {
      if (!annotation.bbox) return annotation;
      const x = Math.min(Math.max(annotation.bbox.x, 0), 1);
      const y = Math.min(Math.max(annotation.bbox.y, 0), 1);
      const maxW = Math.max(0, 1 - x);
      const maxH = Math.max(0, 1 - y);
      const w = Math.min(Math.max(annotation.bbox.w, 0), maxW);
      const h = Math.min(Math.max(annotation.bbox.h, 0), maxH);
      if (w <= 0 || h <= 0) {
        return { ...annotation, bbox: null };
      }
      return { ...annotation, bbox: { x, y, w, h } };
    }),
  };
}
