import type { SensitiveDetectionResult } from '@/types/form-guide';

/**
 * Luhn algorithm check used to verify credit-card-like digit sequences.
 * Returns true when the digit string passes the Luhn checksum.
 */
function luhnCheck(digits: string): boolean {
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    const codePoint = digits.charCodeAt(i) - 48;
    if (codePoint < 0 || codePoint > 9) return false;
    let digit = codePoint;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

const PASSWORD_PATTERNS: RegExp[] = [
  /\bpassword\b/i,
  /\bpass[- ]?phrase\b/i,
  /パスワード/,
  /暗証番号/,
];

const CVV_PATTERNS: RegExp[] = [
  /\bcvv\b/i,
  /\bcvc\b/i,
  /セキュリティコード/,
];

const PIN_PATTERNS: RegExp[] = [/\bpin\s*(code)?\b[^a-z]*\d{3,}/i, /PINコード/];

const MY_NUMBER_PATTERN = /(^|[^\d])\d{12}([^\d]|$)/;
const MY_NUMBER_KEYWORD = /マイナンバー|個人番号/;

const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/;
const SSN_KEYWORD = /\bssn\b|\bsocial\s*security\b/i;

const BANK_ACCOUNT_KEYWORD = /銀行口座|口座番号|bank\s*account|routing\s*number|iban/i;

/**
 * Scans the given free-text for sensitive data categories that must never be
 * forwarded to the OpenAI API. Returns both a boolean flag and the list of
 * matched category identifiers (deduplicated, order of first match preserved).
 */
export function detectSensitive(text: string): SensitiveDetectionResult {
  if (!text) {
    return { hasSensitive: false, categories: [] };
  }

  const categories: string[] = [];
  const add = (category: string): void => {
    if (!categories.includes(category)) {
      categories.push(category);
    }
  };

  if (PASSWORD_PATTERNS.some((pattern) => pattern.test(text))) {
    add('password');
  }

  // Credit card: scan every digit run of length 13-19 and Luhn-check it.
  const digitRuns = text.match(/\d[\d\s-]{11,22}\d/g) ?? [];
  for (const run of digitRuns) {
    const digitsOnly = run.replace(/[\s-]/g, '');
    if (digitsOnly.length >= 13 && digitsOnly.length <= 19 && luhnCheck(digitsOnly)) {
      add('credit-card');
      break;
    }
  }

  if (CVV_PATTERNS.some((pattern) => pattern.test(text))) {
    add('cvv');
  }

  if (PIN_PATTERNS.some((pattern) => pattern.test(text))) {
    add('pin');
  }

  if (MY_NUMBER_KEYWORD.test(text) && MY_NUMBER_PATTERN.test(text)) {
    add('my-number');
  } else if (MY_NUMBER_KEYWORD.test(text)) {
    // keyword alone is still suspicious
    add('my-number');
  }

  if (SSN_PATTERN.test(text) || SSN_KEYWORD.test(text)) {
    add('ssn');
  }

  if (BANK_ACCOUNT_KEYWORD.test(text)) {
    add('bank-account');
  }

  return {
    hasSensitive: categories.length > 0,
    categories,
  };
}
