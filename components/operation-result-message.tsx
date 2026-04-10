import { AlertTriangle, HelpCircle } from 'lucide-react';
import type {
  OperationGuideResult,
  OperationStep,
  OperationTargetType,
} from '@/types/operation-guide';
import OperationScreenshot from './operation-screenshot';

interface OperationResultMessageProps {
  imageDataUrl: string;
  result: OperationGuideResult;
}

const TARGET_TYPE_LABEL: Record<OperationTargetType, string> = {
  button: 'ボタン',
  menu: 'メニュー',
  tab: 'タブ',
  link: 'リンク',
  file: 'ファイル',
  icon: 'アイコン',
  unknown: 'その他',
};

/**
 * Steps below this confidence get a "自信度低め" badge so the user
 * knows to double-check the position before clicking. Matches the
 * thresholds used by `sanitizeOperationGuideResult` PP1 area downgrade.
 */
const LOW_CONFIDENCE_THRESHOLD = 0.5;

/**
 * Chat bubble for a successful operation-guide response. Renders:
 *   - the screenshot with numbered step badges
 *   - a summary blurb
 *   - a numbered 手順 list (1〜3 steps)
 *   - any safety warnings (orange) and unresolved items (gray) at the
 *     bottom so the user can ask a follow-up
 */
export default function OperationResultMessage({
  imageDataUrl,
  result,
}: OperationResultMessageProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <OperationScreenshot src={imageDataUrl} steps={result.steps} />

      {result.summaryJa ? (
        <p className="text-sm text-slate-700">{result.summaryJa}</p>
      ) : null}

      {result.steps.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {result.steps.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </ol>
      ) : null}

      {result.safetyWarnings.length > 0 ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="font-semibold">注意が必要な操作が含まれます</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {result.safetyWarnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {result.unresolved.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            確認できなかった項目
          </div>
          <ul className="mt-1 flex flex-col gap-1">
            {result.unresolved.map((item) => (
              <li key={item.id}>
                <span className="font-medium">{item.reason}</span>
                {item.question ? (
                  <>
                    {' — '}
                    <span className="text-slate-600">{item.question}</span>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

interface StepCardProps {
  step: OperationStep;
  index: number;
}

function StepCard({ step, index }: StepCardProps): JSX.Element {
  const isLowConfidence = step.confidence < LOW_CONFIDENCE_THRESHOLD;
  return (
    <li className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: 'rgb(234, 88, 12)' }}
        aria-label={`手順 ${index + 1}`}
      >
        {index + 1}
      </div>
      <div className="flex-1 text-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-800">{step.titleJa}</span>
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            {TARGET_TYPE_LABEL[step.targetType]}
          </span>
          {isLowConfidence ? (
            <span
              className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
              title="この位置はAIの自信度が低めです。実際の画面で位置を目視確認してください"
            >
              自信度低め
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-slate-700">{step.actionJa}</p>
        {step.detailJa ? (
          <p className="mt-0.5 text-[11px] text-slate-500">{step.detailJa}</p>
        ) : null}
        {isLowConfidence ? (
          <p className="mt-1 text-[11px] text-amber-700">
            ※ 位置が多少ずれている可能性があります。画像を見て正しい場所を確認してください。
          </p>
        ) : null}
      </div>
    </li>
  );
}
