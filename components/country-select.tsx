'use client';

import { useId } from 'react';
import { COUNTRIES } from '@/lib/structured-input/countries';

interface CountrySelectProps {
  /** Canonical English country name, or empty string when unselected. */
  value: string;
  onChange: (nextEnglishName: string) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
}

/**
 * A plain `<select>` that stores the canonical English country name as
 * its underlying value but shows `日本名 / English name` in the dropdown
 * so users can spot their country by either spelling.
 *
 * Storing the English name — not the ISO code — keeps the "one value ==
 * what the model sees" invariant simple: the exact text the user picks
 * is the exact text that reaches the prompt.
 */
export default function CountrySelect({
  value,
  onChange,
  disabled,
  label = '国',
  helperText,
}: CountrySelectProps): JSX.Element {
  const selectId = useId();
  const helperId = useId();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-describedby={helperText ? helperId : undefined}
        className="rounded-xl border border-slate-300 bg-white p-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">— 選択してください —</option>
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.nameEn}>
            {country.nameJa} / {country.nameEn}
          </option>
        ))}
      </select>
      {helperText ? (
        <p id={helperId} className="text-[11px] text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
