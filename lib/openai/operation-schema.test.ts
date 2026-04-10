import { describe, it, expect } from 'vitest';
import {
  AREA_HARD_MULTIPLIER,
  AREA_SOFT_MULTIPLIER,
  MAX_OPERATION_STEPS,
  OperationGuideResultSchema,
  sanitizeOperationGuideResult,
  sanitizeOperationGuideResultWithTrace,
  type ValidatedOperationGuideResult,
} from './operation-schema';

const baseStep = {
  id: 's1',
  x: 100,
  y: 200,
  width: 150,
  height: 60,
  targetType: 'button' as const,
  titleJa: '保存ボタン',
  actionJa: '画面右下の保存ボタンをクリック',
  detailJa: 'クリックすると保存が完了します',
  confidence: 0.9,
};

function makeResult(
  override: Partial<ValidatedOperationGuideResult> = {},
): ValidatedOperationGuideResult {
  return {
    summaryJa: '保存ボタンは右下にあります。',
    steps: [baseStep],
    unresolved: [],
    safetyWarnings: [],
    ...override,
  };
}

describe('OperationGuideResultSchema', () => {
  it('accepts a well-formed result', () => {
    const result = OperationGuideResultSchema.parse(makeResult());
    expect(result.steps).toHaveLength(1);
  });

  it('rejects a step with a missing field', () => {
    expect(() =>
      OperationGuideResultSchema.parse({
        summaryJa: '',
        steps: [{ ...baseStep, titleJa: undefined }],
        unresolved: [],
        safetyWarnings: [],
      }),
    ).toThrow();
  });

  it('rejects an unknown targetType', () => {
    expect(() =>
      OperationGuideResultSchema.parse(
        makeResult({
          steps: [
            // @ts-expect-error — testing runtime rejection
            { ...baseStep, targetType: 'submit' },
          ],
        }),
      ),
    ).toThrow();
  });
});

describe('sanitizeOperationGuideResult', () => {
  it('clamps bbox coordinates into the 0-1000 canvas', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, x: -50, y: 900, width: 9999, height: 500 },
        ],
      }),
    );
    expect(result.steps).toHaveLength(1);
    const step = result.steps[0];
    expect(step).toBeDefined();
    if (!step) return;
    expect(step.x).toBe(0);
    expect(step.y).toBe(900);
    expect(step.x + step.width).toBeLessThanOrEqual(1000);
    expect(step.y + step.height).toBeLessThanOrEqual(1000);
  });

  it('drops steps that become degenerate after clamping', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, width: 0, height: 50 },
          { ...baseStep, id: 's2', height: 0 },
          { ...baseStep, id: 's3' },
        ],
      }),
    );
    expect(result.steps.map((s) => s.id)).toEqual(['s3']);
  });

  it('caps steps at MAX_OPERATION_STEPS', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, id: 's1' },
          { ...baseStep, id: 's2' },
          { ...baseStep, id: 's3' },
          { ...baseStep, id: 's4' },
          { ...baseStep, id: 's5' },
        ],
      }),
    );
    expect(result.steps).toHaveLength(MAX_OPERATION_STEPS);
    expect(result.steps.map((s) => s.id)).toEqual(['s1', 's2', 's3']);
  });

  it('clamps confidence into [0, 1]', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, confidence: 2.5 },
          { ...baseStep, id: 's2', confidence: -0.3 },
        ],
      }),
    );
    const confidences = result.steps.map((s) => s.confidence);
    expect(confidences[0]).toBe(1);
    expect(confidences[1]).toBe(0);
  });

  it('passes unresolved and safetyWarnings through unchanged', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        unresolved: [
          { id: 'u1', reason: '画像にありません', question: '現在の画面を再確認してください' },
        ],
        safetyWarnings: ['退会ボタンを押すとアカウントが削除されます'],
      }),
    );
    expect(result.unresolved).toHaveLength(1);
    expect(result.safetyWarnings).toHaveLength(1);
  });

  it('returns an empty steps array if every step is degenerate', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, width: 0 },
          { ...baseStep, id: 's2', height: 0 },
        ],
      }),
    );
    expect(result.steps).toEqual([]);
  });

  it('rescales 0-1 normalized bbox values into 0-1000', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
        ],
      }),
    );
    expect(result.steps).toHaveLength(1);
    const step = result.steps[0];
    expect(step).toBeDefined();
    if (!step) return;
    expect(step.x).toBe(100);
    expect(step.y).toBe(200);
    expect(step.width).toBe(300);
    expect(step.height).toBe(400);
  });

  it('rescales even when values sit at the 1.0 edge', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, x: 0, y: 0, width: 1, height: 1 },
        ],
      }),
    );
    const step = result.steps[0];
    expect(step).toBeDefined();
    if (!step) return;
    expect(step.x).toBe(0);
    expect(step.y).toBe(0);
    expect(step.width).toBe(1000);
    expect(step.height).toBe(1000);
  });

  it('rescales across multiple steps when all stay in 0-1', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, id: 's1', x: 0.05, y: 0.1, width: 0.2, height: 0.15 },
          { ...baseStep, id: 's2', x: 0.5, y: 0.5, width: 0.3, height: 0.25 },
        ],
      }),
    );
    expect(result.steps).toHaveLength(2);
    const [first, second] = result.steps;
    expect(first?.x).toBe(50);
    expect(first?.width).toBe(200);
    expect(second?.x).toBe(500);
    expect(second?.height).toBe(250);
  });

  it('does not rescale when at least one value exceeds 1', () => {
    // 800 is a valid 0-1000 value; presence of any > 1 value means the
    // model is using the 0-1000 scale and the 0.5 is just a literal
    // half-pixel (which will then be treated as regular clamping input).
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, x: 0.5, y: 0.5, width: 800, height: 0.5 },
        ],
      }),
    );
    // width=800 survives, height=0.5 is dropped by degenerate check? No,
    // 0.5 > 0 so it passes. The step is kept as-is (no scaling applied).
    expect(result.steps).toHaveLength(1);
    const step = result.steps[0];
    expect(step).toBeDefined();
    if (!step) return;
    expect(step.x).toBe(0.5);
    expect(step.y).toBe(0.5);
    expect(step.width).toBe(800);
    expect(step.height).toBe(0.5);
  });

  it('does not rescale already 0-1000 values', () => {
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, x: 100, y: 200, width: 300, height: 150 },
        ],
      }),
    );
    const step = result.steps[0];
    expect(step).toBeDefined();
    if (!step) return;
    expect(step.x).toBe(100);
    expect(step.y).toBe(200);
    expect(step.width).toBe(300);
    expect(step.height).toBe(150);
  });

  it('leaves confidence alone for small (tight) bboxes', () => {
    // 300 × 200 at (100, 200) → area = 0.06 ← well under 0.3 threshold
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, x: 100, y: 200, width: 300, height: 200, confidence: 0.9 },
        ],
      }),
    );
    expect(result.steps[0]?.confidence).toBe(0.9);
  });

  it('applies soft confidence downgrade when area > 0.3', () => {
    // 600 × 600 → area = 0.36 ← in soft band (0.3 < area ≤ 0.5)
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, x: 100, y: 100, width: 600, height: 600, confidence: 0.9 },
        ],
      }),
    );
    expect(result.steps[0]?.confidence).toBeCloseTo(0.9 * AREA_SOFT_MULTIPLIER);
  });

  it('applies hard confidence downgrade when area > 0.5', () => {
    // 800 × 800 → area = 0.64 ← hard band
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          { ...baseStep, x: 0, y: 0, width: 800, height: 800, confidence: 0.9 },
        ],
      }),
    );
    expect(result.steps[0]?.confidence).toBeCloseTo(0.9 * AREA_HARD_MULTIPLIER);
  });

  it('does not downgrade a typical thin row bbox', () => {
    // 500 × 25 row (GitHub file list shape) → area = 0.0125
    const result = sanitizeOperationGuideResult(
      makeResult({
        steps: [
          {
            ...baseStep,
            x: 250,
            y: 315,
            width: 500,
            height: 25,
            confidence: 0.8,
          },
        ],
      }),
    );
    expect(result.steps[0]?.confidence).toBe(0.8);
  });
});

describe('sanitizeOperationGuideResultWithTrace', () => {
  it('reports bboxRescaled=false for a normal 0-1000 input', () => {
    const { trace } = sanitizeOperationGuideResultWithTrace(makeResult());
    expect(trace.bboxRescaled).toBe(false);
  });

  it('reports bboxRescaled=true when autodetect fires', () => {
    const { trace } = sanitizeOperationGuideResultWithTrace(
      makeResult({
        steps: [{ ...baseStep, x: 0.1, y: 0.2, width: 0.3, height: 0.4 }],
      }),
    );
    expect(trace.bboxRescaled).toBe(true);
  });

  it('records a notes entry when the soft downgrade fires', () => {
    const { trace } = sanitizeOperationGuideResultWithTrace(
      makeResult({
        steps: [
          { ...baseStep, x: 0, y: 0, width: 600, height: 600, confidence: 0.9 },
        ],
      }),
    );
    const adj = trace.stepAdjustments[0];
    expect(adj).toBeDefined();
    if (!adj) return;
    expect(adj.notes.length).toBeGreaterThan(0);
    expect(adj.originalConfidence).toBe(0.9);
    expect(adj.adjustedConfidence).toBeCloseTo(0.9 * AREA_SOFT_MULTIPLIER);
    expect(adj.dropped).toBe(false);
  });

  it('records dropped=true for degenerate steps', () => {
    const { trace } = sanitizeOperationGuideResultWithTrace(
      makeResult({
        steps: [
          { ...baseStep, width: 0, height: 50 },
          { ...baseStep, id: 's2' },
        ],
      }),
    );
    expect(trace.stepAdjustments[0]?.dropped).toBe(true);
    expect(trace.stepAdjustments[1]?.dropped).toBe(false);
  });

  it('carries the raw area in stepAdjustments for each surviving step', () => {
    const { trace } = sanitizeOperationGuideResultWithTrace(
      makeResult({
        steps: [
          { ...baseStep, x: 0, y: 0, width: 500, height: 25 },
        ],
      }),
    );
    // 500/1000 * 25/1000 = 0.0125
    expect(trace.stepAdjustments[0]?.rawArea).toBeCloseTo(0.0125);
  });
});
