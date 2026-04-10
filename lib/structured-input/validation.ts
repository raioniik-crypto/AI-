import type { StructuredInput } from './canonical';

/** Validation result for a single field. */
export interface FieldValidation {
  valid: boolean;
  message?: string;
}

/**
 * Simple, forgiving email check. We deliberately avoid "perfect" regexes
 * (they reject many valid production addresses) and only verify the
 * shape `local@domain.tld` with no whitespace.
 */
export function validateEmail(value: string): FieldValidation {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { valid: true };
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  return ok
    ? { valid: true }
    : { valid: false, message: 'メールアドレスの形式が正しくありません' };
}

/**
 * Phone numbers vary wildly around the world, so we only enforce:
 *   - at least 6 and at most 25 characters after trimming
 *   - only digits, spaces, and the common separators + ( ) -
 */
export function validatePhone(value: string): FieldValidation {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { valid: true };
  if (trimmed.length < 6 || trimmed.length > 25) {
    return { valid: false, message: '電話番号は6〜25文字で入力してください' };
  }
  if (!/^[\d+()\-\s]+$/.test(trimmed)) {
    return {
      valid: false,
      message: '電話番号に使える文字は数字と + ( ) - 空白のみです',
    };
  }
  return { valid: true };
}

/**
 * Postal / ZIP codes are also format-per-country, so we just accept
 * 3〜12 chars of letters, digits, spaces, and dashes.
 */
export function validatePostalCode(value: string): FieldValidation {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { valid: true };
  if (trimmed.length < 3 || trimmed.length > 12) {
    return { valid: false, message: '郵便番号は3〜12文字で入力してください' };
  }
  if (!/^[A-Za-z0-9\-\s]+$/.test(trimmed)) {
    return {
      valid: false,
      message: '郵便番号に使える文字は英数字と - 空白のみです',
    };
  }
  return { valid: true };
}

export type StructuredInputErrors = Partial<Record<keyof StructuredInput, string>>;

/**
 * Validates an entire `StructuredInput` and returns a flat record of
 * field-level error messages. Empty object means "no errors".
 */
export function validateStructuredInput(
  input: StructuredInput,
): StructuredInputErrors {
  const errors: StructuredInputErrors = {};
  const email = validateEmail(input.email ?? '');
  if (!email.valid && email.message) errors.email = email.message;
  const phone = validatePhone(input.phone ?? '');
  if (!phone.valid && phone.message) errors.phone = phone.message;
  const postal = validatePostalCode(input.postalCode ?? '');
  if (!postal.valid && postal.message) errors.postalCode = postal.message;
  return errors;
}
