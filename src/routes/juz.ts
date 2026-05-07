import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getAyahsByJuz } from "../services/quranService";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/juz/:number
router.get("/:number", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const num = parseInt(req.params["number"] as string, 10);
    if (isNaN(num) || num < 1 || num > 30) {
      throw new AppError(400, "Invalid juz number. Must be between 1 and 30.");
    }
    res.json(getAyahsByJuz(num));
  } catch (err) {
    next(err);
  }
});

export default router;
