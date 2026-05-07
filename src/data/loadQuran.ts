import fs from "fs";
import path from "path";
import type { Surah, Ayah } from "../types/api";

const DATA_DIR = path.resolve(process.cwd(), "data");

interface QuranStore {
  surahs: Surah[];
  ayahs: Ayah[];
  /** ayahs indexed by surahId for O(1) lookup */
  ayahsBySurah: Map<number, Ayah[]>;
  /** ayahs indexed by juz */
  ayahsByJuz: Map<number, Ayah[]>;
  /** ayahs indexed by page */
  ayahsByPage: Map<number, Ayah[]>;
  /** surahs indexed by id */
  surahById: Map<number, Surah>;
}

let store: QuranStore | null = null;

export function loadQuran(): QuranStore {
  if (store) return store;

  const surahsPath = path.join(DATA_DIR, "surahs.json");
  const ayahsPath = path.join(DATA_DIR, "ayahs.json");

  if (!fs.existsSync(surahsPath) || !fs.existsSync(ayahsPath)) {
    throw new Error(
      'Data files not found. Run "npm run generate" first to generate data/surahs.json and data/ayahs.json'
    );
  }

  const surahs: Surah[] = JSON.parse(fs.readFileSync(surahsPath, "utf-8"));
  const ayahs: Ayah[] = JSON.parse(fs.readFileSync(ayahsPath, "utf-8"));

  const surahById = new Map<number, Surah>();
  for (const s of surahs) surahById.set(s.id, s);

  const ayahsBySurah = new Map<number, Ayah[]>();
  const ayahsByJuz = new Map<number, Ayah[]>();
  const ayahsByPage = new Map<number, Ayah[]>();

  for (const a of ayahs) {
    // by surah
    const bySurah = ayahsBySurah.get(a.surahId) ?? [];
    bySurah.push(a);
    ayahsBySurah.set(a.surahId, bySurah);

    // by juz
    const byJuz = ayahsByJuz.get(a.juz) ?? [];
    byJuz.push(a);
    ayahsByJuz.set(a.juz, byJuz);

    // by page
    const byPage = ayahsByPage.get(a.page) ?? [];
    byPage.push(a);
    ayahsByPage.set(a.page, byPage);
  }

  store = { surahs, ayahs, surahById, ayahsBySurah, ayahsByJuz, ayahsByPage };
  console.log(
    `Loaded ${surahs.length} surahs and ${ayahs.length} ayahs into memory.`
  );
  return store;
}
