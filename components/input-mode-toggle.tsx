'use client';

import { Pencil, ListChecks } from 'lucide-react';

export type InputMode = 'free' | 'structured';

interface InputModeToggleProps {
  mode: InputMode;
  onChange: (next: InputMode) => void;
  disabled?: boolean;
}

/**
 * Segmented control that flips `ChatInput` between the legacy free-text
 * mode (`free`) and the new structured field form (`structured`).
 *
 * Kept intentionally tiny — parent owns the state so switching modes
 * doesn't clear either form's contents.
 */
export default function InputModeToggle({
  mode,
  onChange,
  disabled,
}: InputModeToggleProps): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label="入力モード切り替え"
      className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs shadow-sm"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'free'}
        disabled={disabled}
        onClick={() => onChange('free')}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
          mode === 'free'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <Pencil className="h-3 w-3" aria-hidden="true" />
        かんたん入力
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'structured'}
        disabled={disabled}
        onClick={() => onChange('structured')}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
          mode === 'structured'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <ListChecks className="h-3 w-3" aria-hidden="true" />
        項目ごと入力
      </button>
    </div>
  );
}
