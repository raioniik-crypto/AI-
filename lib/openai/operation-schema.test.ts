import { describe, it, expect } from 'vitest';
import {
  MAX_OPERATION_STEPS,
  OperationGuideResultSchema,
  sanitizeOperationGuideResult,
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
});
