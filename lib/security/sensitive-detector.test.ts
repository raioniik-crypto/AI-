import { describe, it, expect } from 'vitest';
import { detectSensitive } from './sensitive-detector';

describe('detectSensitive', () => {
  it('allows plain personal info (name, address) without flagging', () => {
    const result = detectSensitive('名前は山田太郎、住所は東京都渋谷区1-2-3、職業はエンジニア');
    expect(result.hasSensitive).toBe(false);
    expect(result.categories).toEqual([]);
  });

  it('flags a valid 16-digit credit card number (Luhn valid)', () => {
    // 4242 4242 4242 4242 is a common Stripe test Luhn-valid number.
    const result = detectSensitive('カード番号は 4242 4242 4242 4242 です');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('credit-card');
  });

  it('does NOT flag a 16-digit number that fails Luhn', () => {
    const result = detectSensitive('注文番号は 1234 5678 9012 3456 です');
    expect(result.hasSensitive).toBe(false);
  });

  it('flags the password keyword', () => {
    const result = detectSensitive('password: hunter2');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('password');
  });

  it('flags the Japanese パスワード keyword', () => {
    const result = detectSensitive('パスワードはabcdef');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('password');
  });

  it('flags My Number (12-digit Japanese individual number)', () => {
    const result = detectSensitive('マイナンバーは123456789012');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('my-number');
  });

  it('flags a US Social Security Number pattern', () => {
    const result = detectSensitive('SSN: 123-45-6789');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('ssn');
  });

  it('flags the CVV keyword', () => {
    const result = detectSensitive('cvv 123');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('cvv');
  });

  it('flags the PIN keyword with a numeric value', () => {
    const result = detectSensitive('PIN: 4321');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('pin');
  });

  it('flags bank account keywords', () => {
    const result = detectSensitive('銀行口座番号は1234567');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('bank-account');
  });

  it('returns multiple categories when several sensitive items coexist', () => {
    const result = detectSensitive('password: hunter2, カード番号 4242424242424242');
    expect(result.hasSensitive).toBe(true);
    expect(result.categories).toContain('password');
    expect(result.categories).toContain('credit-card');
  });

  it('deduplicates categories', () => {
    const result = detectSensitive('password: a, PASSWORD: b, パスワード: c');
    const passwordCount = result.categories.filter((c) => c === 'password').length;
    expect(passwordCount).toBe(1);
  });

  it('handles empty input safely', () => {
    const result = detectSensitive('');
    expect(result.hasSensitive).toBe(false);
    expect(result.categories).toEqual([]);
  });
});
