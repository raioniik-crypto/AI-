'use client';

import { useState } from 'react';
import type { Annotation } from '@/types/form-guide';
import AnnotationOverlay from './annotation-overlay';

interface AnnotatedImageProps {
  src: string;
  annotations: Annotation[];
  initialWidth?: number;
  initialHeight?: number;
  alt?: string;
}

export default function AnnotatedImage({
  src,
  annotations,
  initialWidth,
  initialHeight,
  alt = '注釈付きスクリーンショット',
}: AnnotatedImageProps): JSX.Element {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(
    initialWidth && initialHeight
      ? { width: initialWidth, height: initialHeight }
      : null,
  );

  return (
    <figure className="relative inline-block max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="block h-auto max-w-full"
        onLoad={(event) => {
          const target = event.currentTarget;
          setDimensions({
            width: target.naturalWidth,
            height: target.naturalHeight,
          });
        }}
      />
      {dimensions ? (
        <AnnotationOverlay
          width={dimensions.width}
          height={dimensions.height}
          annotations={annotations}
        />
      ) : null}
    </figure>
  );
}
