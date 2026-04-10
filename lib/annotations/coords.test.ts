import { describe, expect, it } from 'vitest';
import { bboxToPixelRect } from './coords';

describe('bboxToPixelRect', () => {
  it('maps a normalized bbox to pixel coordinates', () => {
    const rect = bboxToPixelRect(
      { x: 0.25, y: 0.5, w: 0.25, h: 0.1 },
      800,
      400,
    );
    expect(rect).toEqual({ x: 200, y: 200, w: 200, h: 40 });
  });

  it('preserves proportions when the rendered rect shrinks', () => {
    const big = bboxToPixelRect(
      { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
      1000,
      500,
    );
    const small = bboxToPixelRect(
      { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
      500,
      250,
    );
    expect(big).not.toBeNull();
    expect(small).not.toBeNull();
    // Halving the render size should halve every coordinate.
    expect(small!.x).toBeCloseTo(big!.x / 2);
    expect(small!.y).toBeCloseTo(big!.y / 2);
    expect(small!.w).toBeCloseTo(big!.w / 2);
    expect(small!.h).toBeCloseTo(big!.h / 2);
  });

  it('does not distort non-square rectangles', () => {
    // A portrait render area should not squash a bbox that is positioned in
    // the left half of the image.
    const rect = bboxToPixelRect(
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      300,
      900,
    );
    expect(rect).toEqual({ x: 0, y: 0, w: 150, h: 450 });
  });

  it('clamps x and y into [0, 1]', () => {
    const rect = bboxToPixelRect(
      { x: -0.2, y: 1.5, w: 0.1, h: 0.1 },
      200,
      200,
    );
    // y is clamped to 1 so h is then clamped to 0 → degenerate.
    expect(rect).toBeNull();
  });

  it('clamps width/height so the rect never extends past the edge', () => {
    const rect = bboxToPixelRect(
      { x: 0.9, y: 0.9, w: 0.5, h: 0.5 },
      100,
      100,
    );
    expect(rect).not.toBeNull();
    expect(rect!.x).toBeCloseTo(90);
    expect(rect!.y).toBeCloseTo(90);
    expect(rect!.w).toBeCloseTo(10);
    expect(rect!.h).toBeCloseTo(10);
    // And the clamped rect must fit strictly inside the rendered area.
    expect(rect!.x + rect!.w).toBeLessThanOrEqual(100 + 1e-9);
    expect(rect!.y + rect!.h).toBeLessThanOrEqual(100 + 1e-9);
  });

  it('returns null for a zero-area bbox', () => {
    expect(
      bboxToPixelRect({ x: 0.5, y: 0.5, w: 0, h: 0.2 }, 400, 400),
    ).toBeNull();
    expect(
      bboxToPixelRect({ x: 0.5, y: 0.5, w: 0.2, h: 0 }, 400, 400),
    ).toBeNull();
  });

  it('returns null when the rendered rect has zero size', () => {
    expect(
      bboxToPixelRect({ x: 0.1, y: 0.1, w: 0.2, h: 0.2 }, 0, 400),
    ).toBeNull();
    expect(
      bboxToPixelRect({ x: 0.1, y: 0.1, w: 0.2, h: 0.2 }, 400, 0),
    ).toBeNull();
  });
});
