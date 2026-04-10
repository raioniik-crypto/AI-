'use client';

import { useId } from 'react';
import type { StructuredInput } from '@/lib/structured-input/canonical';
import type { StructuredInputErrors } from '@/lib/structured-input/validation';
import CountrySelect from './country-select';

interface StructuredInputFormProps {
  value: StructuredInput;
  onChange: (next: StructuredInput) => void;
  errors: StructuredInputErrors;
  disabled?: boolean;
}

interface TextFieldProps {
  label: string;
  placeholder?: string;
  value: string | undefined;
  onChange: (next: string) => void;
  error?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'tel';
  autoComplete?: string;
}

function TextField({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  type = 'text',
  autoComplete,
}: TextFieldProps): JSX.Element {
  const inputId = useId();
  const errorId = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-xl border bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
            : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/30'
        }`}
      />
      {error ? (
        <p id={errorId} className="text-[11px] text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Controlled "項目ごと入力" form. Rendering logic only — validation and
 * canonical-text conversion live in `lib/structured-input/*` so they can
 * be unit tested without the DOM.
 *
 * Grid layout collapses to a single column on narrow screens (Tailwind
 * `sm:` breakpoint), so the form stays usable on mobile.
 */
export default function StructuredInputForm({
  value,
  onChange,
  errors,
  disabled,
}: StructuredInputFormProps): JSX.Element {
  const update = <K extends keyof StructuredInput>(
    key: K,
    next: StructuredInput[K],
  ): void => {
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-slate-500">
        分かる項目だけ埋めてください。空欄は送信されません。
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="姓 (Last name)"
          placeholder="例: Yamaguchi"
          value={value.lastName}
          onChange={(next) => update('lastName', next)}
          disabled={disabled}
          autoComplete="family-name"
        />
        <TextField
          label="名 (First name)"
          placeholder="例: Tamon"
          value={value.firstName}
          onChange={(next) => update('firstName', next)}
          disabled={disabled}
          autoComplete="given-name"
        />
        <TextField
          label="メールアドレス"
          placeholder="例: taro@example.com"
          value={value.email}
          onChange={(next) => update('email', next)}
          error={errors.email}
          disabled={disabled}
          type="email"
          autoComplete="email"
        />
        <TextField
          label="電話番号"
          placeholder="例: +81 90-1234-5678"
          value={value.phone}
          onChange={(next) => update('phone', next)}
          error={errors.phone}
          disabled={disabled}
          type="tel"
          autoComplete="tel"
        />
        <TextField
          label="住所1 (Address line 1)"
          placeholder="例: 1-2-3 Shibuya"
          value={value.addressLine1}
          onChange={(next) => update('addressLine1', next)}
          disabled={disabled}
          autoComplete="address-line1"
        />
        <TextField
          label="住所2 (Address line 2)"
          placeholder="例: Apt 5B"
          value={value.addressLine2}
          onChange={(next) => update('addressLine2', next)}
          disabled={disabled}
          autoComplete="address-line2"
        />
        <TextField
          label="市区町村 / City"
          placeholder="例: Shibuya"
          value={value.city}
          onChange={(next) => update('city', next)}
          disabled={disabled}
          autoComplete="address-level2"
        />
        <TextField
          label="都道府県 / State / Province"
          placeholder="例: Tokyo"
          value={value.state}
          onChange={(next) => update('state', next)}
          disabled={disabled}
          autoComplete="address-level1"
        />
        <TextField
          label="郵便番号 / Postal code"
          placeholder="例: 150-0002"
          value={value.postalCode}
          onChange={(next) => update('postalCode', next)}
          error={errors.postalCode}
          disabled={disabled}
          autoComplete="postal-code"
        />
        <CountrySelect
          value={value.country ?? ''}
          onChange={(next) => update('country', next)}
          disabled={disabled}
          label="国 / Country"
          helperText="内部では英語表記で扱われます"
        />
        <div className="sm:col-span-2">
          <TextField
            label="職業 (Occupation)"
            placeholder="例: Software Engineer"
            value={value.occupation}
            onChange={(next) => update('occupation', next)}
            disabled={disabled}
            autoComplete="organization-title"
          />
        </div>
      </div>
    </div>
  );
}
