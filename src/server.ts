import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { loadQuran } from "./data/loadQuran";
import surahsRouter from "./routes/surahs";
import ayahsRouter from "./routes/ayahs";
import searchRouter from "./routes/search";
import juzRouter from "./routes/juz";
import pagesRouter from "./routes/pages";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import type { HealthResponse } from "./types/api";

// ─── Validate environment ────────────────────────────────────────────────────
const PORT = parseInt(process.env["PORT"] ?? "8000", 10);

// Support comma-separated origins in CORS_ORIGIN env var
// e.g. CORS_ORIGIN=https://quran-mazid-rose.vercel.app,http://localhost:3000
const CORS_ORIGIN = process.env["CORS_ORIGIN"]
  ? process.env["CORS_ORIGIN"].split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

if (isNaN(PORT)) {
  console.error("Invalid PORT in environment");
  process.exit(1);
}

// ─── Pre-load data into memory ───────────────────────────────────────────────
try {
  loadQuran();
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
  origin: true, // reflect request origin — works for all origins including localhost
  methods: ["GET", "OPTIONS"],
  credentials: true,
}));
app.use(morgan(process.env["NODE_ENV"] === "production" ? "combined" : "dev"));
app.use(express.json());

app.get("/",(req,res)=>{
  res.status(200).json({
    success : true,
    message : "Server is running"
  });
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const body: HealthResponse = { status: "ok", timestamp: new Date().toISOString() };
  res.json(body);
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/surahs", surahsRouter);
app.use("/api/ayahs", ayahsRouter);
app.use("/api/search", searchRouter);
app.use("/api/juz", juzRouter);
app.use("/api/pages", pagesRouter);

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
