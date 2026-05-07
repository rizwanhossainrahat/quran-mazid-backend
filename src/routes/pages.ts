import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getAyahsByPage } from "../services/quranService";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/pages/:number
router.get("/:number", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const num = parseInt(req.params["number"] as string, 10);
    if (isNaN(num) || num < 1 || num > 604) {
      throw new AppError(400, "Invalid page number. Must be between 1 and 604.");
    }
    res.json(getAyahsByPage(num));
  } catch (err) {
    next(err);
  }
});

export default router;
