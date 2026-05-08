#Live link:https://quran-mazid-server.vercel.app

# Quran API

REST API for the Quran built with Express.js + TypeScript. Uses local JSON files — no database required.

## Setup

```bash
npm install
npm run generate   # fetch & build data/surahs.json + data/ayahs.json
npm run dev        # development server with hot reload
```

Copy `.env.example` to `.env` and adjust as needed.

## Scripts

| Command | Description |
|---|---|
| `npm run generate` | Fetch Quran data from GitHub and generate local JSON files |
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |

## API Reference

Base URL: `http://localhost:8000/api`

---

### Health

**GET** `/api/health`

```json
{ "status": "ok", "timestamp": "2026-01-01T00:00:00.000Z" }
```

---

### Surahs

**GET** `/api/surahs`

Returns all 114 surahs.

```json
[
  {
    "id": 1,
    "nameArabic": "الفاتحة",
    "nameEnglish": "Al-Fatihah",
    "nameTranslation": "The Opening",
    "revelationPlace": "Makkah",
    "ayahCount": 7
  }
]
```

**GET** `/api/surahs/:id`

Returns surah info + all its ayahs. `id` must be 1–114.

```json
{
  "surah": { "id": 1, "nameArabic": "...", ... },
  "ayahs": [
    {
      "id": 1,
      "surahId": 1,
      "ayahNumber": 1,
      "arabicText": "بِسۡمِ ٱللَّهِ...",
      "translationEn": "In the name of Allah...",
      "juz": 1,
      "page": 1,
      "audioUrl": "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3"
    }
  ]
}
```

---

### Ayahs

**GET** `/api/ayahs/:id`

Returns a single ayah by global ID (1–6236) with surah info.

```json
{
  "id": 1,
  "surahId": 1,
  "ayahNumber": 1,
  "arabicText": "...",
  "translationEn": "...",
  "juz": 1,
  "page": 1,
  "audioUrl": "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
  "surah": { "nameEnglish": "Al-Fatihah", "nameArabic": "الفاتحة" }
}
```

---

### Search

**GET** `/api/search?q={query}&limit={n}&offset={n}`

- Searches `translationEn` (always)
- Also searches `arabicText` if query contains Arabic characters
- `limit` default: 20, max: 50
- `offset` default: 0

```json
{
  "results": [
    {
      "globalId": 71,
      "surahId": 2,
      "surahName": "Al-Baqarah",
      "ayahNumber": 64,
      "arabicText": "...",
      "translationEn": "...",
      "audioUrl": "...",
      "highlight": "...excerpt with matched text..."
    }
  ],
  "total": 143,
  "hasMore": true
}
```

---

### Juz

**GET** `/api/juz/:number`

Returns all ayahs in a juz. `number` must be 1–30.

---

### Pages

**GET** `/api/pages/:number`

Returns all ayahs on a Quran page. `number` must be 1–604.

---

## Error Responses

| Status | Example |
|---|---|
| 400 | `{ "error": "Invalid surah id. Must be between 1 and 114." }` |
| 404 | `{ "error": "Surah 200 not found" }` |
| 500 | `{ "error": "Internal server error" }` |

## Data Source

- Quran text + Saheeh International translation: [risan/quran-json](https://github.com/risan/quran-json)
- Audio: [cdn.islamic.network](https://cdn.islamic.network) (Al-Afasy recitation)
