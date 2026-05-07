import { loadQuran } from "../data/loadQuran";
import { getAudioUrl } from "../utils/audio";
import { filterAyahs, buildHighlight } from "../utils/search";
import type {
  Surah,
  Ayah,
  AyahResponse,
  SurahListItem,
  SurahDetailResponse,
  AyahDetailResponse,
  SearchResponse,
  SearchResult,
} from "../types/api";
import { AppError } from "../middleware/errorHandler";

// Simple in-memory cache for the surahs list (never changes)
let surahListCache: SurahListItem[] | null = null;

function toAyahResponse(ayah: Ayah): AyahResponse {
  return { ...ayah, audioUrl: getAudioUrl(ayah.id) };
}

// ─── Surahs ──────────────────────────────────────────────────────────────────

export function getAllSurahs(): SurahListItem[] {
  if (surahListCache) return surahListCache;
  const { surahs } = loadQuran();
  surahListCache = surahs.map((s): SurahListItem => ({
    id: s.id,
    nameArabic: s.nameArabic,
    nameEnglish: s.nameEnglish,
    nameTranslation: s.nameTranslation,
    revelationPlace: s.revelationPlace,
    ayahCount: s.ayahCount,
  }));
  return surahListCache;
}

export function getSurahById(id: number): SurahDetailResponse {
  const { surahById, ayahsBySurah } = loadQuran();
  const surah = surahById.get(id);
  if (!surah) throw new AppError(404, `Surah ${id} not found`);

  const ayahs = (ayahsBySurah.get(id) ?? []).map(toAyahResponse);
  return { surah, ayahs };
}

// ─── Ayahs ───────────────────────────────────────────────────────────────────

export function getAyahById(globalId: number): AyahDetailResponse {
  const { ayahs, surahById } = loadQuran();
  const ayah = ayahs[globalId - 1]; // ayahs are 1-indexed, array is 0-indexed
  if (!ayah || ayah.id !== globalId) {
    throw new AppError(404, `Ayah ${globalId} not found`);
  }

  const surah = surahById.get(ayah.surahId);
  if (!surah) throw new AppError(404, `Surah for ayah ${globalId} not found`);

  return {
    ...toAyahResponse(ayah),
    surah: { nameEnglish: surah.nameEnglish, nameArabic: surah.nameArabic },
  };
}

// ─── Search ──────────────────────────────────────────────────────────────────

export function searchAyahs(
  query: string,
  limit: number,
  offset: number
): SearchResponse {
  const { ayahs, surahById } = loadQuran();
  const matched = filterAyahs(ayahs, query);
  const total = matched.length;
  const page = matched.slice(offset, offset + limit);

  const results: SearchResult[] = page.map((a) => {
    const surah = surahById.get(a.surahId) as Surah;
    return {
      globalId: a.id,
      surahId: a.surahId,
      surahName: surah.nameEnglish,
      ayahNumber: a.ayahNumber,
      arabicText: a.arabicText,
      translationEn: a.translationEn,
      audioUrl: getAudioUrl(a.id),
      highlight: buildHighlight(a.translationEn, query),
    };
  });

  return { results, total, hasMore: offset + limit < total };
}

// ─── Juz ─────────────────────────────────────────────────────────────────────

export function getAyahsByJuz(juzNumber: number): AyahDetailResponse[] {
  const { ayahsByJuz, surahById } = loadQuran();
  const ayahs = ayahsByJuz.get(juzNumber);
  if (!ayahs || ayahs.length === 0) {
    throw new AppError(404, `Juz ${juzNumber} not found`);
  }

  return ayahs.map((a) => {
    const surah = surahById.get(a.surahId) as Surah;
    return {
      ...toAyahResponse(a),
      surah: { nameEnglish: surah.nameEnglish, nameArabic: surah.nameArabic },
    };
  });
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export function getAyahsByPage(pageNumber: number): AyahDetailResponse[] {
  const { ayahsByPage, surahById } = loadQuran();
  const ayahs = ayahsByPage.get(pageNumber);
  if (!ayahs || ayahs.length === 0) {
    throw new AppError(404, `Page ${pageNumber} not found`);
  }

  return ayahs.map((a) => {
    const surah = surahById.get(a.surahId) as Surah;
    return {
      ...toAyahResponse(a),
      surah: { nameEnglish: surah.nameEnglish, nameArabic: surah.nameArabic },
    };
  });
}
