import { bboxToPixelRect } from '@/lib/annotations/coords';
import type { Annotation } from '@/types/form-guide';

interface AnnotationOverlayProps {
  /** Rendered image width in CSS pixels. Must match the `<img>` element. */
  width: number;
  /** Rendered image height in CSS pixels. Must match the `<img>` element. */
  height: number;
  annotations: Annotation[];
}

const BADGE_RADIUS = 14;
const BADGE_GAP = 6;

export default function AnnotationOverlay({
  width,
  height,
  annotations,
}: AnnotationOverlayProps): JSX.Element | null {
  if (width <= 0 || height <= 0) return null;

  return (
    <svg
      // Matching viewBox and width/height attributes + preserveAspectRatio="none"
      // guarantees 1 SVG unit = 1 CSS pixel of the rendered image. Any other
      // combination can introduce letterboxing/offset when aspect ratios don't
      // perfectly match and is the source of the rightward shift bug.
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-0 top-0"
      role="img"
      aria-label="入力欄の注釈オーバーレイ"
    >
      <defs>
        <marker
          id="arrow-head"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(37, 99, 235)" />
        </marker>
      </defs>
      {annotations.map((annotation) => {
        if (!annotation.bbox) return null;
        const rect = bboxToPixelRect(annotation.bbox, width, height);
        if (!rect) return null;

        // Prefer placing the badge to the left of the bbox so it never
        // overlaps the form field. Fall back to the right side if there's
        // not enough room on the left.
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
          <g key={annotation.id}>
            <rect
              data-annotation
              x={rect.x}
              y={rect.y}
              width={rect.w}
              height={rect.h}
              rx={4}
              fill="rgba(37, 99, 235, 0.15)"
              stroke="rgb(37, 99, 235)"
              strokeWidth={2}
            />
            <line
              x1={arrowStartX}
              y1={badgeCy}
              x2={arrowEndX}
              y2={badgeCy}
              stroke="rgb(37, 99, 235)"
              strokeWidth={2}
              markerEnd="url(#arrow-head)"
            />
            <circle
              cx={badgeCx}
              cy={badgeCy}
              r={BADGE_RADIUS}
              fill="rgb(37, 99, 235)"
            />
            <text
              x={badgeCx}
              y={badgeCy}
              dy="0.35em"
              textAnchor="middle"
              fontSize={16}
              fontWeight={700}
              fill="white"
            >
              {annotation.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
