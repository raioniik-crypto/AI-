'use client';

import { useEffect, useRef, useState } from 'react';
import type { Annotation } from '@/types/form-guide';
import AnnotationOverlay from './annotation-overlay';

interface AnnotatedImageProps {
  src: string;
  annotations: Annotation[];
  alt?: string;
}

interface RenderedSize {
  width: number;
  height: number;
}

export default function AnnotatedImage({
  src,
  annotations,
  alt = '注釈付きスクリーンショット',
}: AnnotatedImageProps): JSX.Element {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [renderedSize, setRenderedSize] = useState<RenderedSize | null>(null);

  // Track the <img>'s actual rendered rect — not its natural resolution — so
  // the overlay always aligns with what the user sees, regardless of the
  // image being scaled down to fit its container or the window being resized.
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
        <AnnotationOverlay
          width={renderedSize.width}
          height={renderedSize.height}
          annotations={annotations}
        />
      ) : null}
    </figure>
  );
}
