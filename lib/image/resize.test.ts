import { describe, it, expect } from 'vitest';
import { computeResizeDimensions } from './resize';

describe('computeResizeDimensions', () => {
  it('returns the original dimensions when the image is already within limits', () => {
    const result = computeResizeDimensions(800, 600, 2048);
    expect(result).toEqual({ width: 800, height: 600, scale: 1 });
  });

  it('scales down a wide image so its longest edge matches maxEdge', () => {
    const result = computeResizeDimensions(4096, 2048, 2048);
    expect(result.width).toBe(2048);
    expect(result.height).toBe(1024);
    expect(result.scale).toBeCloseTo(0.5);
  });

  it('scales down a tall image so its longest edge matches maxEdge', () => {
    const result = computeResizeDimensions(1000, 5000, 2000);
    expect(result.width).toBe(400);
    expect(result.height).toBe(2000);
    expect(result.scale).toBeCloseTo(0.4);
  });

  it('preserves aspect ratio within integer rounding', () => {
    const result = computeResizeDimensions(1920, 1080, 1024);
    const ratioOriginal = 1920 / 1080;
    const ratioResult = result.width / result.height;
    expect(Math.abs(ratioOriginal - ratioResult)).toBeLessThan(0.01);
  });

  it('throws on non-positive dimensions', () => {
    expect(() => computeResizeDimensions(0, 100, 1024)).toThrow();
    expect(() => computeResizeDimensions(100, 0, 1024)).toThrow();
    expect(() => computeResizeDimensions(100, 100, 0)).toThrow();
  });
});
