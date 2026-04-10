'use client';

import { useEffect, useRef, useState } from 'react';
import type { OperationStep } from '@/types/operation-guide';
import OperationOverlay from './operation-overlay';

interface OperationScreenshotProps {
  src: string;
  steps: OperationStep[];
  alt?: string;
}

interface RenderedSize {
  width: number;
  height: number;
}

/**
 * Screenshot + operation overlay wrapper. Same ResizeObserver dance as
 * `AnnotatedImage` so the overlay stays pixel-aligned when the image is
 * scaled down or the window is resized — just renders a different kind
 * of overlay (orange numbered badges instead of blue field badges).
 *
 * Kept separate from `AnnotatedImage` because the two overlays consume
 * different data shapes (`Annotation[]` vs `OperationStep[]`) and
 * fusing them would push the shared wrapper toward a generic type that
 * adds complexity for no real win at this stage.
 */
export default function OperationScreenshot({
  src,
  steps,
  alt = '画面操作ガイドのスクリーンショット',
}: OperationScreenshotProps): JSX.Element {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [renderedSize, setRenderedSize] = useState<RenderedSize | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const measure = (): void => {
      const rect = img.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setRenderedSize({ width: rect.width, height: rect.height });
      }
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(() => measure());
    observer.observe(img);
    return () => observer.disconnect();
  }, [src]);

  return (
    <figure className="relative inline-block max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="block h-auto max-w-full"
        onLoad={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setRenderedSize({ width: rect.width, height: rect.height });
          }
        }}
      />
      {renderedSize ? (
        <OperationOverlay
          width={renderedSize.width}
          height={renderedSize.height}
          steps={steps}
        />
      ) : null}
    </figure>
  );
}
