/**
 * Curated country list used by the `CountrySelect` component.
 *
 * Every entry has:
 *   - `code`   : the ISO 3166-1 alpha-2 code (used only as a stable key)
 *   - `nameEn` : the canonical English name that gets sent to the model.
 *                Standardising on English here is critical — "日本" vs
 *                "Japan" vs "JP" is exactly the sort of drift we want to
 *                eliminate so GPT-4o gets a single, unambiguous value.
 *   - `nameJa` : the Japanese display label shown in the dropdown.
 *
 * This is intentionally a hand-curated common list, not the full 249
 * entries of ISO 3166-1. It's easy to extend later; for the MVP we just
 * need the countries our target users are most likely to fill forms for.
 */
export interface Country {
  code: string;
  nameEn: string;
  nameJa: string;
}

export const COUNTRIES: readonly Country[] = [
  { code: 'JP', nameEn: 'Japan', nameJa: '日本' },
  { code: 'US', nameEn: 'United States', nameJa: 'アメリカ合衆国' },
  { code: 'GB', nameEn: 'United Kingdom', nameJa: 'イギリス' },
  { code: 'CA', nameEn: 'Canada', nameJa: 'カナダ' },
  { code: 'AU', nameEn: 'Australia', nameJa: 'オーストラリア' },
  { code: 'NZ', nameEn: 'New Zealand', nameJa: 'ニュージーランド' },
  { code: 'DE', nameEn: 'Germany', nameJa: 'ドイツ' },
  { code: 'FR', nameEn: 'France', nameJa: 'フランス' },
  { code: 'IT', nameEn: 'Italy', nameJa: 'イタリア' },
  { code: 'ES', nameEn: 'Spain', nameJa: 'スペイン' },
  { code: 'PT', nameEn: 'Portugal', nameJa: 'ポルトガル' },
  { code: 'NL', nameEn: 'Netherlands', nameJa: 'オランダ' },
  { code: 'BE', nameEn: 'Belgium', nameJa: 'ベルギー' },
  { code: 'CH', nameEn: 'Switzerland', nameJa: 'スイス' },
  { code: 'AT', nameEn: 'Austria', nameJa: 'オーストリア' },
  { code: 'SE', nameEn: 'Sweden', nameJa: 'スウェーデン' },
  { code: 'NO', nameEn: 'Norway', nameJa: 'ノルウェー' },
  { code: 'DK', nameEn: 'Denmark', nameJa: 'デンマーク' },
  { code: 'FI', nameEn: 'Finland', nameJa: 'フィンランド' },
  { code: 'IE', nameEn: 'Ireland', nameJa: 'アイルランド' },
  { code: 'PL', nameEn: 'Poland', nameJa: 'ポーランド' },
  { code: 'CZ', nameEn: 'Czech Republic', nameJa: 'チェコ' },
  { code: 'CN', nameEn: 'China', nameJa: '中国' },
  { code: 'TW', nameEn: 'Taiwan', nameJa: '台湾' },
  { code: 'KR', nameEn: 'South Korea', nameJa: '韓国' },
  { code: 'HK', nameEn: 'Hong Kong', nameJa: '香港' },
  { code: 'SG', nameEn: 'Singapore', nameJa: 'シンガポール' },
  { code: 'MY', nameEn: 'Malaysia', nameJa: 'マレーシア' },
  { code: 'TH', nameEn: 'Thailand', nameJa: 'タイ' },
  { code: 'VN', nameEn: 'Vietnam', nameJa: 'ベトナム' },
  { code: 'PH', nameEn: 'Philippines', nameJa: 'フィリピン' },
  { code: 'ID', nameEn: 'Indonesia', nameJa: 'インドネシア' },
  { code: 'IN', nameEn: 'India', nameJa: 'インド' },
  { code: 'AE', nameEn: 'United Arab Emirates', nameJa: 'アラブ首長国連邦' },
  { code: 'BR', nameEn: 'Brazil', nameJa: 'ブラジル' },
  { code: 'MX', nameEn: 'Mexico', nameJa: 'メキシコ' },
  { code: 'ZA', nameEn: 'South Africa', nameJa: '南アフリカ' },
];

/** Looks up a country by its canonical English name. */
export function findCountryByEnglishName(name: string): Country | undefined {
  const target = name.trim().toLowerCase();
  if (!target) return undefined;
  return COUNTRIES.find((c) => c.nameEn.toLowerCase() === target);
}

/** Returns true when `name` is one of the canonical English names. */
export function isValidCountryName(name: string): boolean {
  return findCountryByEnglishName(name) !== undefined;
}
