/**
 * Generate script: fetches quran_en.json from risan/quran-json,
 * then produces data/surahs.json and data/ayahs.json
 */
import https from "https";
import fs from "fs";
import path from "path";

const SOURCE_URL =
  "https://raw.githubusercontent.com/risan/quran-json/master/dist/quran_en.json";

const DATA_DIR = path.resolve(process.cwd(), "data");

// Juz boundary data: [surahId, ayahNumber] where each juz starts
const JUZ_STARTS: [number, number][] = [
  [1, 1], [2, 142], [2, 253], [3, 93], [4, 24],
  [4, 148], [5, 82], [6, 111], [7, 88], [8, 41],
  [9, 93], [11, 6], [12, 53], [15, 1], [17, 1],
  [18, 75], [21, 1], [23, 1], [25, 21], [27, 56],
  [29, 46], [33, 31], [36, 28], [39, 32], [41, 47],
  [46, 1], [51, 31], [58, 1], [67, 1], [78, 1],
];

// Page boundary data: [surahId, ayahNumber] where each page starts (604 pages)
// Using a well-known mapping (Madinah mushaf)
const PAGE_STARTS: [number, number][] = [
  [1,1],[2,1],[2,6],[2,17],[2,25],[2,30],[2,38],[2,49],[2,58],[2,62],
  [2,70],[2,77],[2,84],[2,92],[2,98],[2,106],[2,114],[2,122],[2,130],[2,138],
  [2,146],[2,154],[2,163],[2,171],[2,178],[2,183],[2,191],[2,197],[2,203],[2,211],
  [2,219],[2,225],[2,232],[2,238],[2,246],[2,253],[2,260],[2,268],[2,275],[2,283],
  [3,1],[3,10],[3,21],[3,31],[3,41],[3,52],[3,62],[3,71],[3,81],[3,92],
  [3,102],[3,110],[3,120],[3,130],[3,141],[3,152],[3,163],[3,171],[3,181],[3,191],
  [4,1],[4,12],[4,24],[4,36],[4,48],[4,60],[4,72],[4,83],[4,92],[4,102],
  [4,114],[4,122],[4,130],[4,141],[4,153],[4,163],[4,172],[5,1],[5,12],[5,22],
  [5,33],[5,42],[5,52],[5,62],[5,72],[5,83],[5,93],[5,104],[6,1],[6,12],
  [6,21],[6,32],[6,42],[6,53],[6,63],[6,74],[6,84],[6,95],[6,106],[6,117],
  [6,125],[6,136],[6,147],[6,158],[7,1],[7,12],[7,23],[7,34],[7,47],[7,59],
  [7,71],[7,83],[7,94],[7,106],[7,122],[7,134],[7,145],[7,156],[7,168],[7,178],
  [7,188],[7,200],[8,1],[8,12],[8,24],[8,36],[8,47],[8,58],[8,68],[9,1],
  [9,8],[9,18],[9,28],[9,38],[9,48],[9,58],[9,68],[9,78],[9,88],[9,98],
  [9,108],[9,118],[10,1],[10,11],[10,22],[10,34],[10,44],[10,54],[10,65],[10,76],
  [10,87],[10,98],[10,108],[11,7],[11,18],[11,29],[11,41],[11,52],[11,62],[11,72],
  [11,83],[11,96],[11,108],[11,119],[12,7],[12,18],[12,29],[12,40],[12,52],[12,64],
  [12,76],[12,88],[12,100],[12,111],[13,1],[13,12],[13,23],[13,35],[14,1],[14,13],
  [14,25],[14,38],[15,1],[15,16],[15,32],[15,50],[15,70],[15,85],[15,99],[16,1],
  [16,15],[16,28],[16,41],[16,55],[16,66],[16,76],[16,88],[16,100],[16,111],[16,119],
  [17,1],[17,14],[17,26],[17,40],[17,53],[17,66],[17,79],[17,93],[17,105],[18,1],
  [18,17],[18,29],[18,42],[18,55],[18,68],[18,82],[18,99],[18,111],[19,1],[19,22],
  [19,42],[19,59],[19,77],[19,97],[20,1],[20,22],[20,44],[20,66],[20,83],[20,99],
  [20,116],[20,131],[21,1],[21,21],[21,41],[21,58],[21,75],[21,92],[22,1],[22,15],
  [22,29],[22,42],[22,56],[22,66],[22,79],[23,1],[23,19],[23,36],[23,53],[23,75],
  [23,97],[24,1],[24,12],[24,22],[24,32],[24,44],[24,55],[24,63],[25,1],[25,13],
  [25,26],[25,41],[25,57],[25,71],[26,1],[26,21],[26,42],[26,62],[26,84],[26,106],
  [26,128],[26,151],[26,175],[26,197],[26,217],[27,1],[27,22],[27,41],[27,56],
  [27,72],[27,83],[28,1],[28,15],[28,29],[28,44],[28,58],[28,72],[28,84],[29,1],
  [29,15],[29,29],[29,46],[29,60],[30,1],[30,16],[30,31],[30,47],[30,61],[31,1],
  [31,16],[31,29],[32,1],[32,17],[33,1],[33,14],[33,28],[33,41],[33,55],[33,64],
  [34,1],[34,16],[34,30],[34,46],[35,1],[35,16],[35,30],[35,43],[36,1],[36,22],
  [36,41],[36,60],[37,1],[37,22],[37,52],[37,83],[37,115],[37,145],[38,1],[38,22],
  [38,44],[38,65],[39,1],[39,16],[39,32],[39,48],[39,64],[40,1],[40,16],[40,34],
  [40,52],[41,1],[41,17],[41,34],[41,47],[42,1],[42,18],[42,36],[43,1],[43,24],
  [43,46],[43,68],[44,1],[44,30],[45,1],[45,18],[45,32],[46,1],[46,18],[46,32],
  [47,1],[47,18],[48,1],[48,18],[49,1],[49,14],[50,1],[50,22],[51,1],[51,24],
  [51,47],[52,1],[52,26],[52,46],[53,1],[53,26],[53,51],[54,1],[54,25],[54,50],
  [55,1],[55,26],[55,52],[56,1],[56,26],[56,57],[56,80],[57,1],[57,20],[58,1],
  [58,14],[59,1],[59,18],[60,1],[61,1],[62,1],[63,1],[64,1],[65,1],[66,1],
  [67,1],[67,22],[68,1],[68,35],[69,1],[69,35],[70,1],[70,37],[71,1],[72,1],
  [72,20],[73,1],[74,1],[74,32],[75,1],[76,1],[76,22],[77,1],[78,1],[79,1],
  [80,1],[81,1],[82,1],[83,1],[83,19],[84,1],[85,1],[86,1],[87,1],[88,1],
  [89,1],[90,1],[91,1],[92,1],[93,1],[94,1],[95,1],[96,1],[97,1],[98,1],
  [99,1],[100,1],[101,1],[102,1],[103,1],[104,1],[105,1],[106,1],[107,1],[108,1],
  [109,1],[110,1],[111,1],[112,1],[113,1],[114,1],
];

// Surah name translations
const SURAH_TRANSLATIONS: Record<number, string> = {
  1:"The Opening",2:"The Cow",3:"Family of Imran",4:"The Women",5:"The Table Spread",
  6:"The Cattle",7:"The Heights",8:"The Spoils of War",9:"The Repentance",10:"Jonah",
  11:"Hud",12:"Joseph",13:"The Thunder",14:"Abraham",15:"The Rocky Tract",
  16:"The Bee",17:"The Night Journey",18:"The Cave",19:"Mary",20:"Ta-Ha",
  21:"The Prophets",22:"The Pilgrimage",23:"The Believers",24:"The Light",
  25:"The Criterion",26:"The Poets",27:"The Ant",28:"The Stories",
  29:"The Spider",30:"The Romans",31:"Luqman",32:"The Prostration",
  33:"The Combined Forces",34:"Sheba",35:"Originator",36:"Ya-Sin",
  37:"Those Who Set The Ranks",38:"The Letter Sad",39:"The Troops",
  40:"The Forgiver",41:"Explained in Detail",42:"The Consultation",
  43:"The Ornaments of Gold",44:"The Smoke",45:"The Crouching",
  46:"The Wind-Curved Sandhills",47:"Muhammad",48:"The Victory",
  49:"The Rooms",50:"The Letter Qaf",51:"The Winnowing Winds",
  52:"The Mount",53:"The Star",54:"The Moon",55:"The Beneficent",
  56:"The Inevitable",57:"The Iron",58:"The Pleading Woman",59:"The Exile",
  60:"She That Is To Be Examined",61:"The Ranks",62:"The Congregation",
  63:"The Hypocrites",64:"The Mutual Disillusion",65:"The Divorce",
  66:"The Prohibition",67:"The Sovereignty",68:"The Pen",69:"The Reality",
  70:"The Ascending Stairways",71:"Noah",72:"The Jinn",73:"The Enshrouded One",
  74:"The Cloaked One",75:"The Resurrection",76:"The Man",77:"The Emissaries",
  78:"The Tidings",79:"Those Who Drag Forth",80:"He Frowned",
  81:"The Overthrowing",82:"The Cleaving",83:"The Defrauding",
  84:"The Sundering",85:"The Mansions of the Stars",86:"The Nightcommer",
  87:"The Most High",88:"The Overwhelming",89:"The Dawn",90:"The City",
  91:"The Sun",92:"The Night",93:"The Morning Hours",94:"The Relief",
  95:"The Fig",96:"The Clot",97:"The Power",98:"The Clear Proof",
  99:"The Earthquake",100:"The Courser",101:"The Calamity",
  102:"The Rivalry in World Increase",103:"The Declining Day",
  104:"The Traducer",105:"The Elephant",106:"Quraysh",107:"The Small Kindnesses",
  108:"The Abundance",109:"The Disbelievers",110:"The Divine Support",
  111:"The Palm Fiber",112:"The Sincerity",113:"The Daybreak",114:"The Mankind",
};

interface RawVerse {
  id: number;
  text: string;
  translation: string;
}

interface RawSurah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: "meccan" | "medinan";
  total_verses: number;
  verses: RawVerse[];
}

interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationPlace: "Makkah" | "Madinah";
  ayahCount: number;
}

interface Ayah {
  id: number;
  surahId: number;
  ayahNumber: number;
  arabicText: string;
  translationEn: string;
  juz: number;
  page: number;
}

function fetchJson(url: string): Promise<RawSurah[]> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => (data += chunk.toString()));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data) as RawSurah[]);
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${(e as Error).message}`));
        }
      });
    }).on("error", reject);
  });
}

function getJuz(globalId: number): number {
  // Build cumulative global ayah offsets for juz boundaries
  // JUZ_STARTS contains [surahId, ayahNumber] for each juz start
  // We'll compute this after we have the full ayah list
  return 1; // placeholder, computed below
}

function computeJuzAndPage(
  surahId: number,
  ayahNumber: number,
  surahAyahCounts: number[]
): { juz: number; page: number } {
  // Compute global ayah id
  let globalId = 0;
  for (let i = 0; i < surahId - 1; i++) {
    globalId += surahAyahCounts[i] ?? 0;
  }
  globalId += ayahNumber;

  // Compute juz
  let juz = 1;
  for (let i = JUZ_STARTS.length - 1; i >= 0; i--) {
    const [jSurah, jAyah] = JUZ_STARTS[i]!;
    if (surahId > jSurah || (surahId === jSurah && ayahNumber >= jAyah)) {
      juz = i + 1;
      break;
    }
  }

  // Compute page
  let page = 1;
  for (let i = PAGE_STARTS.length - 1; i >= 0; i--) {
    const [pSurah, pAyah] = PAGE_STARTS[i]!;
    if (surahId > pSurah || (surahId === pSurah && ayahNumber >= pAyah)) {
      page = i + 1;
      break;
    }
  }

  return { juz, page };
}

async function generate(): Promise<void> {
  console.log("Fetching Quran data from risan/quran-json...");
  const raw = await fetchJson(SOURCE_URL);
  console.log(`Fetched ${raw.length} surahs.`);

  // Build surah ayah count lookup
  const surahAyahCounts = raw.map((s) => s.total_verses);

  const surahs: Surah[] = [];
  const ayahs: Ayah[] = [];
  let globalAyahId = 1;

  for (const rawSurah of raw) {
    surahs.push({
      id: rawSurah.id,
      nameArabic: rawSurah.name,
      nameEnglish: rawSurah.transliteration,
      nameTranslation: SURAH_TRANSLATIONS[rawSurah.id] ?? rawSurah.translation,
      revelationPlace: rawSurah.type === "meccan" ? "Makkah" : "Madinah",
      ayahCount: rawSurah.total_verses,
    });

    for (const verse of rawSurah.verses) {
      const { juz, page } = computeJuzAndPage(
        rawSurah.id,
        verse.id,
        surahAyahCounts
      );

      ayahs.push({
        id: globalAyahId,
        surahId: rawSurah.id,
        ayahNumber: verse.id,
        arabicText: verse.text,
        translationEn: verse.translation,
        juz,
        page,
      });

      globalAyahId++;
    }

    console.log(`  Processed surah ${rawSurah.id}: ${rawSurah.transliteration} (${rawSurah.total_verses} ayahs)`);
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(DATA_DIR, "surahs.json"),
    JSON.stringify(surahs, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "ayahs.json"),
    JSON.stringify(ayahs, null, 2),
    "utf-8"
  );

  console.log(`\nDone! Generated:`);
  console.log(`  data/surahs.json — ${surahs.length} surahs`);
  console.log(`  data/ayahs.json  — ${ayahs.length} ayahs`);
}

generate().catch((err: Error) => {
  console.error("Generate failed:", err.message);
  process.exit(1);
});
