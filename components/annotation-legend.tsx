import type { Annotation } from '@/types/form-guide';

interface AnnotationLegendProps {
  annotations: Annotation[];
}

export default function AnnotationLegend({
  annotations,
}: AnnotationLegendProps): JSX.Element {
  if (annotations.length === 0) {
    return (
      <p className="text-sm text-slate-500">解析結果はありません。</p>
    );
  }

  const located = annotations.filter((a) => a.bbox !== null);
  const unspecified = annotations.filter((a) => a.bbox === null);

  return (
    <div className="flex flex-col gap-3">
      {located.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {located.map((annotation) => (
            <li
              key={annotation.id}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <span
                aria-hidden="true"
                className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white"
              >
                {annotation.id}
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">{annotation.label}</span>
                <span className="text-sm font-medium text-slate-900">
                  {annotation.value}
                </span>
                {annotation.note ? (
                  <span className="text-xs text-slate-500">{annotation.note}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {unspecified.length > 0 ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
          <p className="mb-2 text-xs font-semibold text-amber-800">
            未特定: 以下の項目は画像から該当欄を特定できませんでした
          </p>
          <ul className="flex flex-col gap-1">
            {unspecified.map((annotation) => (
              <li key={annotation.id} className="text-xs text-amber-900">
                <span className="font-medium">{annotation.label}</span>:{' '}
                {annotation.value}
                {annotation.note ? ` (${annotation.note})` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
