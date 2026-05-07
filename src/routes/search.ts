import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { searchAyahs } from "../services/quranService";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/search?q=...&limit=20&offset=0
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query["q"] as string | undefined)?.trim();
    if (!q || q.length < 2) {
      throw new AppError(400, "Query param 'q' is required and must be at least 2 characters.");
    }

    const rawLimit = parseInt((req.query["limit"] as string | undefined) ?? "20", 10);
    const rawOffset = parseInt((req.query["offset"] as string | undefined) ?? "0", 10);

    const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 50);
    const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

    res.json(searchAyahs(q, limit, offset));
  } catch (err) {
    next(err);
  }
});

export default router;
