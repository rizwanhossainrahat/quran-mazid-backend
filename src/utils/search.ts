import type { Ayah } from "../types/api";

const ARABIC_REGEX = /[\u0600-\u06FF]/;

/**
 * Returns true if the query contains Arabic characters.
 */
export function isArabicQuery(query: string): boolean {
  return ARABIC_REGEX.test(query);
}

/**
 * Case-insensitive substring match.
 */
export function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

/**
 * Filters ayahs by query string.
 * Searches translationEn always; also searches arabicText if query is Arabic.
 */
export function filterAyahs(ayahs: Ayah[], query: string): Ayah[] {
  const arabic = isArabicQuery(query);
  const lower = query.toLowerCase();

  return ayahs.filter((a) => {
    if (arabic && a.arabicText.includes(query)) return true;
    return a.translationEn.toLowerCase().includes(lower);
  });
}

/**
 * Builds a short excerpt around the matched text in translationEn.
 */
export function buildHighlight(text: string, query: string): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 120) + (text.length > 120 ? "..." : "");
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 40);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}
