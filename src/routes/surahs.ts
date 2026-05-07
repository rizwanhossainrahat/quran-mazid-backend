import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getAllSurahs, getSurahById } from "../services/quranService";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/surahs
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(getAllSurahs());
  } catch (err) {
    next(err);
  }
});

// GET /api/surahs/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id) || id < 1 || id > 114) {
      throw new AppError(400, "Invalid surah id. Must be between 1 and 114.");
    }
    res.json(getSurahById(id));
  } catch (err) {
    next(err);
  }
});

export default router;
