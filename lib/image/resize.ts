export interface ResizeDimensions {
  width: number;
  height: number;
  scale: number;
}

/**
 * Computes the target dimensions for a resize operation that keeps the
 * longest edge at most `maxEdge` pixels, preserving aspect ratio. Returns
 * the original dimensions unchanged if the image already fits.
 *
 * Rounds width/height to integers and reports the effective scale factor.
 */
export function computeResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  maxEdge: number,
): ResizeDimensions {
  if (originalWidth <= 0 || originalHeight <= 0 || maxEdge <= 0) {
    throw new Error('computeResizeDimensions requires positive dimensions');
  }

  const longest = Math.max(originalWidth, originalHeight);
  if (longest <= maxEdge) {
    return { width: originalWidth, height: originalHeight, scale: 1 };
  }

  const scale = maxEdge / longest;
  const width = Math.round(originalWidth * scale);
  const height = Math.round(originalHeight * scale);
  return { width, height, scale };
}

/**
 * Resizes a File or Blob image into a data: URL whose longest edge is at
 * most `maxEdge` pixels. Runs entirely in the browser via canvas. Only call
 * this from client components.
 */
export async function resizeImageFileToDataUrl(
  file: File,
  maxEdge = 2048,
  mimeType = 'image/jpeg',
  quality = 0.9,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = computeResizeDimensions(
    bitmap.width,
    bitmap.height,
    maxEdge,
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Failed to acquire 2D context for image resize');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL(mimeType, quality);
  return { dataUrl, width, height };
}
