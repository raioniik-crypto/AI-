'use client';

import { useState } from 'react';
import {
  Camera,
  Crop,
  Keyboard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * Small collapsible guide card shown near the image upload area.
 *
 * The goal is not to teach screenshot theory — it's to give new users a
 * 5-second "これを避ければ精度が上がる" checklist they can scan before
 * they upload. Rendered as a pair of tiny cards + an OS shortcut row so
 * users can skim it without reading a wall of text.
 */
export default function ScreenshotGuideCard(): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      aria-labelledby="screenshot-guide-title"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-brand-500" aria-hidden="true" />
          <h2
            id="screenshot-guide-title"
            className="text-sm font-semibold text-slate-800"
          >
            スクショの撮り方ガイド
          </h2>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600">
            精度アップ
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
        )}
      </button>

      {expanded ? (
        <div className="mt-3 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <StepCard
              step="1"
              title="入力欄だけを切り取る"
              body="広告・メニュー・サイドバー・コード欄・余白はできるだけ除外してください。"
              icon={<Crop className="h-4 w-4" aria-hidden="true" />}
            />
            <StepCard
              step="2"
              title="ラベルと欄をセットで写す"
              body="入力欄の上や左にある説明文字を必ず一緒に入れてください。"
              icon={<Camera className="h-4 w-4" aria-hidden="true" />}
            />
            <StepCard
              step="3"
              title="1画面に詰め込みすぎない"
              body="長いフォームは上下で分けて複数回に送るほうが精度が上がります。"
              icon={<Crop className="h-4 w-4" aria-hidden="true" />}
            />
            <StepCard
              step="4"
              title="文字がはっきり見える拡大で"
              body="極端に縮小したスクショだと AI がラベルを読み違えやすくなります。"
              icon={<Camera className="h-4 w-4" aria-hidden="true" />}
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Keyboard className="h-3 w-3" aria-hidden="true" />
              範囲指定スクショのショートカット
            </div>
            <ul className="flex flex-col gap-1 text-xs text-slate-600">
              <li>
                <span className="font-medium text-slate-800">Windows:</span>{' '}
                <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px]">
                  Win
                </kbd>{' '}
                +{' '}
                <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px]">
                  Shift
                </kbd>{' '}
                +{' '}
                <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px]">
                  S
                </kbd>
              </li>
              <li>
                <span className="font-medium text-slate-800">Mac:</span>{' '}
                <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px]">
                  Shift
                </kbd>{' '}
                +{' '}
                <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px]">
                  Command
                </kbd>{' '}
                +{' '}
                <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px]">
                  4
                </kbd>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-slate-500">
          入力欄だけを切り取り、ラベルと一緒に撮ると精度が上がります。タップで詳細を表示。
        </p>
      )}
    </section>
  );
}

interface StepCardProps {
  step: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}

function StepCard({ step, title, body, icon }: StepCardProps): JSX.Element {
  return (
    <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
        {step}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          {icon}
          {title}
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
          {body}
        </p>
      </div>
    </div>
  );
}
