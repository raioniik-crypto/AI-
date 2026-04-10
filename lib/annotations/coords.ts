import type { BBox } from '@/types/form-guide';

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Converts a normalized [0, 1] bbox into pixel coordinates relative to the
 * image's actual **rendered** rectangle (not its natural resolution).
 *
 * The overlay must share the exact same rectangle as the rendered `<img>`
 * element for the result to align visually — that is, the SVG's `viewBox`
 * and its `width`/`height` attributes should both equal the rendered image
 * size, with `preserveAspectRatio="none"`. Under those conditions one SVG
 * unit equals one CSS pixel, so this helper's output can be used directly
 * as rect coordinates.
 *
 * Values outside [0, 1] are clamped, and `w`/`h` are further clamped so the
 * rectangle never extends past the image edge (`x + w` ≤ 1, `y + h` ≤ 1).
 * Returns `null` for degenerate (zero-area) rectangles so the caller can
 * skip drawing them.
 */
export function bboxToPixelRect(
  bbox: BBox,
  renderedWidth: number,
  renderedHeight: number,
): PixelRect | null {
  if (renderedWidth <= 0 || renderedHeight <= 0) return null;

  const x = Math.max(0, Math.min(1, bbox.x));
  const y = Math.max(0, Math.min(1, bbox.y));
  const w = Math.max(0, Math.min(1 - x, bbox.w));
  const h = Math.max(0, Math.min(1 - y, bbox.h));
  if (w <= 0 || h <= 0) return null;

  return {
    x: x * renderedWidth,
    y: y * renderedHeight,
    w: w * renderedWidth,
    h: h * renderedHeight,
  };
}
