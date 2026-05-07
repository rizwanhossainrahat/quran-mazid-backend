// ─── Data Models (matches data/surahs.json & data/ayahs.json) ───────────────

export interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationPlace: "Makkah" | "Madinah";
  ayahCount: number;
}

export interface Ayah {
  id: number;
  surahId: number;
  ayahNumber: number;
  arabicText: string;
  translationEn: string;
  juz: number;
  page: number;
}

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface AyahResponse extends Ayah {
  audioUrl: string;
}

export interface SurahListItem {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationPlace: "Makkah" | "Madinah";
  ayahCount: number;
}

export interface SurahDetailResponse {
  surah: Surah;
  ayahs: AyahResponse[];
}

export interface AyahDetailResponse extends AyahResponse {
  surah: Pick<Surah, "nameEnglish" | "nameArabic">;
}

export interface SearchResult {
  globalId: number;
  surahId: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translationEn: string;
  audioUrl: string;
  highlight: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
}
