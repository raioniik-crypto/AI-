import { Compass } from 'lucide-react';

/**
 * Tiny "coming soon" teaser for the planned 画面操作ガイド feature.
 *
 * This is intentionally not interactive and doesn't own any state — it
 * just plants a flag so users know the tool's direction is broader than
 * form-filling. Replace with the real entry point when the follow-on
 * feature lands.
 */
export default function FutureOperationGuideNote(): JSX.Element {
  return (
    <aside className="flex items-start gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
      <Compass
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500"
        aria-hidden="true"
      />
      <div className="flex-1 text-[11px] leading-relaxed text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-700">画面操作ガイド</span>
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-medium uppercase text-slate-600">
            beta / 準備中
          </span>
        </div>
        <p className="mt-0.5">
          外国語サイトや開発ツール画面で、「どこを押すか」「どのファイルを開くか」「次に何をするか」を案内するモードを準備中です。
        </p>
      </div>
    </aside>
  );
}
