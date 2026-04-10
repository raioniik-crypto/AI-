'use client';

import { ClipboardList, MousePointerClick } from 'lucide-react';
import type { GuideMode } from '@/types/form-guide';

interface GuideModeToggleProps {
  mode: GuideMode;
  onChange: (next: GuideMode) => void;
  disabled?: boolean;
}

/**
 * Top-level segmented control that swaps between the two guide
 * features: `入力ガイド` (classic FormGuide) and `画面操作ガイド` (new
 * operation guide). Kept stateless — parent owns `guideMode` in the
 * Zustand store so the ChatInput and ChatMessage components can read it
 * without prop drilling.
 */
export default function GuideModeToggle({
  mode,
  onChange,
  disabled,
}: GuideModeToggleProps): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label="ガイドモード切り替え"
      className="inline-flex rounded-xl border border-slate-300 bg-white p-1 text-sm shadow-sm"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'form'}
        disabled={disabled}
        onClick={() => onChange('form')}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
          mode === 'form'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <ClipboardList className="h-4 w-4" aria-hidden="true" />
        入力ガイド
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'operation'}
        disabled={disabled}
        onClick={() => onChange('operation')}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
          mode === 'operation'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <MousePointerClick className="h-4 w-4" aria-hidden="true" />
        画面操作ガイド
      </button>
    </div>
  );
}
