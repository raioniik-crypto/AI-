/**
 * Shape of the structured "項目ごと入力" form. Every field is optional so
 * users can fill only what they know; unfilled fields are dropped rather
 * than sent as blanks.
 *
 * `country` holds the canonical English country name (see
 * ./countries.ts). All other fields are free strings that we trim but
 * otherwise pass through to the model.
 */
export interface StructuredInput {
  lastName?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  occupation?: string;
}

/**
 * Internal field descriptor used to render the bilingual canonical text.
 * The `labelJa` is what shows up in the UI; `labelEn` is a hint the model
 * uses to disambiguate foreign-language form fields.
 */
interface FieldSpec {
  key: keyof StructuredInput;
  labelJa: string;
  labelEn: string;
}

const FIELD_ORDER: readonly FieldSpec[] = [
  { key: 'lastName', labelJa: '姓', labelEn: 'last name / family name / surname' },
  { key: 'firstName', labelJa: '名', labelEn: 'first name / given name' },
  { key: 'email', labelJa: 'メールアドレス', labelEn: 'email address' },
  { key: 'phone', labelJa: '電話番号', labelEn: 'phone number' },
  { key: 'addressLine1', labelJa: '住所1', labelEn: 'address line 1 / street address' },
  { key: 'addressLine2', labelJa: '住所2', labelEn: 'address line 2 / apartment / suite' },
  { key: 'city', labelJa: '市区町村', labelEn: 'city' },
  { key: 'state', labelJa: '都道府県', labelEn: 'state / province / region' },
  { key: 'postalCode', labelJa: '郵便番号', labelEn: 'postal code / zip code' },
  { key: 'country', labelJa: '国', labelEn: 'country' },
  { key: 'occupation', labelJa: '職業', labelEn: 'occupation / job title' },
];

function normalize(value: string | undefined): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

/**
 * Collects the non-empty fields of a `StructuredInput` in canonical order.
 * Useful for previewing what will be sent and for asserting emptiness.
 */
export function collectFilledFields(
  input: StructuredInput,
): Array<{ key: keyof StructuredInput; labelJa: string; labelEn: string; value: string }> {
  const filled: Array<{
    key: keyof StructuredInput;
    labelJa: string;
    labelEn: string;
    value: string;
  }> = [];
  for (const spec of FIELD_ORDER) {
    const value = normalize(input[spec.key]);
    if (value.length > 0) {
      filled.push({ ...spec, value });
    }
  }
  return filled;
}

/**
 * Converts a structured input into a single instruction text that the
 * existing `/api/analyze` endpoint can consume unchanged.
 *
 * The output is a bilingual bullet list — Japanese labels make the values
 * feel natural to the user, while the English hints in parentheses give
 * GPT-4o strong semantic cues (e.g. which field is "last name" vs
 * "first name" or what "state / province / region" means on a JP form).
 *
 * Returns an empty string when no field is filled, so callers can decide
 * whether to block submission or fall back to free-text mode.
 */
export function buildCanonicalInstructionText(input: StructuredInput): string {
  const filled = collectFilledFields(input);
  if (filled.length === 0) return '';

  const lines: string[] = [
    '以下の項目を、スクリーンショット内の対応する入力欄に入れてください。',
    '',
  ];
  for (const field of filled) {
    lines.push(`- ${field.labelJa} (${field.labelEn}): ${field.value}`);
  }
  return lines.join('\n');
}
