import { bboxToPixelRect } from '@/lib/annotations/coords';
import type { OperationStep } from '@/types/operation-guide';

interface OperationOverlayProps {
  /** Rendered image width in CSS pixels. Must match the `<img>` element. */
  width: number;
  /** Rendered image height in CSS pixels. Must match the `<img>` element. */
  height: number;
  steps: OperationStep[];
}

const BADGE_RADIUS = 16;
const BADGE_GAP = 6;

/**
 * SVG overlay that renders `OperationStep`s as numbered markers on top of
 * the screenshot. Mirrors the structure of `AnnotationOverlay` so the
 * same viewBox / preserveAspectRatio invariant keeps operation badges
 * pixel-aligned with the image, but:
 *
 *   1. Steps come in with **0–1000 normalized bbox units** (not 0–1),
 *      so we divide by 1000 before calling `bboxToPixelRect`.
 *   2. Badges show the 1-based step number in display order, with an
 *      orange accent to visually distinguish them from the blue form
 *      annotations.
 */
export default function OperationOverlay({
  width,
  height,
  steps,
}: OperationOverlayProps): JSX.Element | null {
  if (width <= 0 || height <= 0) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-0 top-0"
      role="img"
      aria-label="画面操作ガイドのオーバーレイ"
    >
      <defs>
        <marker
          id="operation-arrow-head"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(234, 88, 12)" />
        </marker>
      </defs>
      {steps.map((step, index) => {
        const rect = bboxToPixelRect(
          {
            x: step.x / 1000,
            y: step.y / 1000,
            w: step.width / 1000,
            h: step.height / 1000,
          },
          width,
          height,
        );
        if (!rect) return null;

        const stepNumber = index + 1;
        const leftCandidate = rect.x - BADGE_RADIUS - BADGE_GAP;
        const rightCandidate = rect.x + rect.w + BADGE_RADIUS + BADGE_GAP;
        const placeOnLeft = leftCandidate - BADGE_RADIUS >= 0;
        const badgeCx = placeOnLeft ? leftCandidate : rightCandidate;
        const badgeCy = rect.y + rect.h / 2;

        const arrowStartX = placeOnLeft
          ? badgeCx + BADGE_RADIUS
          : badgeCx - BADGE_RADIUS;
        const arrowEndX = placeOnLeft ? rect.x : rect.x + rect.w;

        return (
          <g key={step.id}>
            <rect
              data-operation-step
              x={rect.x}
              y={rect.y}
              width={rect.w}
              height={rect.h}
              rx={6}
              fill="rgba(234, 88, 12, 0.18)"
              stroke="rgb(234, 88, 12)"
              strokeWidth={2.5}
            />
            <line
              x1={arrowStartX}
              y1={badgeCy}
              x2={arrowEndX}
              y2={badgeCy}
              stroke="rgb(234, 88, 12)"
              strokeWidth={2}
              markerEnd="url(#operation-arrow-head)"
            />
            <circle
              cx={badgeCx}
              cy={badgeCy}
              r={BADGE_RADIUS}
              fill="rgb(234, 88, 12)"
            />
            <text
              x={badgeCx}
              y={badgeCy}
              dy="0.35em"
              textAnchor="middle"
              fontSize={18}
              fontWeight={700}
              fill="white"
            >
              {stepNumber}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
