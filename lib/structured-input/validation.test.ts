import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateStructuredInput,
} from './validation';

describe('validateEmail', () => {
  it('accepts an empty value (optional field)', () => {
    expect(validateEmail('')).toEqual({ valid: true });
  });

  it('accepts common addresses', () => {
    expect(validateEmail('test@example.com').valid).toBe(true);
    expect(validateEmail('a.b+tag@sub.example.co.jp').valid).toBe(true);
  });

  it('rejects addresses without @ or TLD', () => {
    expect(validateEmail('not-an-email').valid).toBe(false);
    expect(validateEmail('a@b').valid).toBe(false);
  });

  it('rejects addresses containing whitespace', () => {
    expect(validateEmail('a b@example.com').valid).toBe(false);
  });
});

describe('validatePhone', () => {
  it('accepts an empty value', () => {
    expect(validatePhone('')).toEqual({ valid: true });
  });

  it('accepts international and local formats', () => {
    expect(validatePhone('+81 90-1234-5678').valid).toBe(true);
    expect(validatePhone('090-1234-5678').valid).toBe(true);
    expect(validatePhone('(212) 555-0100').valid).toBe(true);
  });

  it('rejects too-short or too-long inputs', () => {
    expect(validatePhone('123').valid).toBe(false);
    expect(validatePhone('1'.repeat(26)).valid).toBe(false);
  });

  it('rejects letters', () => {
    expect(validatePhone('call-me').valid).toBe(false);
  });
});

describe('validatePostalCode', () => {
  it('accepts empty value', () => {
    expect(validatePostalCode('')).toEqual({ valid: true });
  });

  it('accepts JP/US/UK-style codes', () => {
    expect(validatePostalCode('150-0002').valid).toBe(true);
    expect(validatePostalCode('94103').valid).toBe(true);
    expect(validatePostalCode('SW1A 1AA').valid).toBe(true);
  });

  it('rejects codes with symbols', () => {
    expect(validatePostalCode('150/0002').valid).toBe(false);
  });

  it('rejects codes that are too short or too long', () => {
    expect(validatePostalCode('ab').valid).toBe(false);
    expect(validatePostalCode('1234567890123').valid).toBe(false);
  });
});

describe('validateStructuredInput', () => {
  it('returns no errors for a valid input', () => {
    expect(
      validateStructuredInput({
        lastName: 'Yamaguchi',
        firstName: 'Tamon',
        email: 'test@example.com',
        phone: '+81 90-1234-5678',
        postalCode: '150-0002',
      }),
    ).toEqual({});
  });

  it('returns per-field messages when formats are wrong', () => {
    const errors = validateStructuredInput({
      email: 'bad',
      phone: '!!!',
      postalCode: 'a',
    });
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.postalCode).toBeTruthy();
  });
});
