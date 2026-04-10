import type { Annotation } from '@/types/form-guide';

interface AnnotationOverlayProps {
  width: number;
  height: number;
  annotations: Annotation[];
}

const BADGE_RADIUS = 14;

export default function AnnotationOverlay({
  width,
  height,
  annotations,
}: AnnotationOverlayProps): JSX.Element {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      role="img"
      aria-label="入力欄の注釈オーバーレイ"
    >
      {annotations.map((annotation) => {
        if (!annotation.bbox) return null;
        const x = annotation.bbox.x * width;
        const y = annotation.bbox.y * height;
        const w = annotation.bbox.w * width;
        const h = annotation.bbox.h * height;
        if (w <= 0 || h <= 0) return null;

        const badgeCx = x - BADGE_RADIUS - 4;
        const badgeCy = y + h / 2;
        const arrowStartX = badgeCx + BADGE_RADIUS;
        const arrowEndX = x;

        return (
          <g key={annotation.id}>
            <rect
              data-annotation
              x={x}
              y={y}
              width={w}
              height={h}
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
              cx={Math.max(BADGE_RADIUS + 2, badgeCx)}
              cy={badgeCy}
              r={BADGE_RADIUS}
              fill="rgb(37, 99, 235)"
            />
            <text
              x={Math.max(BADGE_RADIUS + 2, badgeCx)}
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
    </svg>
  );
}
