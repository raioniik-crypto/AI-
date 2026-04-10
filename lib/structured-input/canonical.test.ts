import { describe, it, expect } from 'vitest';
import {
  buildCanonicalInstructionText,
  collectFilledFields,
} from './canonical';

describe('collectFilledFields', () => {
  it('returns an empty array when nothing is filled', () => {
    expect(collectFilledFields({})).toEqual([]);
  });

  it('drops fields that contain only whitespace', () => {
    expect(
      collectFilledFields({
        lastName: '   ',
        firstName: '\n\t',
        email: '',
      }),
    ).toEqual([]);
  });

  it('preserves canonical field order regardless of input order', () => {
    const filled = collectFilledFields({
      country: 'Japan',
      email: 'a@b.co',
      lastName: 'Yamaguchi',
      firstName: 'Tamon',
    });
    expect(filled.map((f) => f.key)).toEqual([
      'lastName',
      'firstName',
      'email',
      'country',
    ]);
  });

  it('trims surrounding whitespace on values', () => {
    const filled = collectFilledFields({ lastName: '  Yamaguchi  ' });
    expect(filled).toHaveLength(1);
    expect(filled[0]?.value).toBe('Yamaguchi');
  });
});

describe('buildCanonicalInstructionText', () => {
  it('returns an empty string when nothing is filled', () => {
    expect(buildCanonicalInstructionText({})).toBe('');
  });

  it('produces a bilingual bullet list', () => {
    const text = buildCanonicalInstructionText({
      lastName: 'Yamaguchi',
      firstName: 'Tamon',
      email: 'test@example.com',
      country: 'Japan',
    });
    expect(text).toContain('姓 (last name');
    expect(text).toContain('): Yamaguchi');
    expect(text).toContain('名 (first name');
    expect(text).toContain('): Tamon');
    expect(text).toContain('メールアドレス (email address): test@example.com');
    expect(text).toContain('国 (country): Japan');
  });

  it('orders lines canonically (lastName → firstName → email → ... → country)', () => {
    const text = buildCanonicalInstructionText({
      country: 'Japan',
      firstName: 'Tamon',
      lastName: 'Yamaguchi',
    });
    const lastIdx = text.indexOf('Yamaguchi');
    const firstIdx = text.indexOf('Tamon');
    const countryIdx = text.indexOf('Japan');
    expect(lastIdx).toBeGreaterThan(-1);
    expect(firstIdx).toBeGreaterThan(-1);
    expect(countryIdx).toBeGreaterThan(-1);
    expect(lastIdx).toBeLessThan(firstIdx);
    expect(firstIdx).toBeLessThan(countryIdx);
  });

  it('skips empty and whitespace-only fields', () => {
    const text = buildCanonicalInstructionText({
      lastName: 'Yamaguchi',
      firstName: '   ',
      email: '',
    });
    expect(text).toContain('Yamaguchi');
    expect(text).not.toContain('名 (');
    expect(text).not.toContain('メールアドレス (');
  });

  it('keeps every filled value on its own line', () => {
    const text = buildCanonicalInstructionText({
      lastName: 'Yamaguchi',
      firstName: 'Tamon',
      email: 'test@example.com',
    });
    const bulletLines = text.split('\n').filter((line) => line.startsWith('- '));
    expect(bulletLines).toHaveLength(3);
  });
});
