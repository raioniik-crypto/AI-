import { Compass } from 'lucide-react';

/**
 * Small hint card explaining the 画面操作ガイド mode. Shown under the
 * dropzone so first-time users know the tool isn't just for form
 * filling — they can flip the top toggle to get clickable-element
 * guidance instead.
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
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium uppercase text-amber-700">
            beta
          </span>
        </div>
        <p className="mt-0.5">
          外国語サイトや開発ツール画面で「どこを押すか」「どのファイルを開くか」「次に何をするか」を案内します。上の
          <span className="mx-1 font-medium text-slate-700">画面操作ガイド</span>
          に切り替えてお試しください。
        </p>
      </div>
    </aside>
  );
}
