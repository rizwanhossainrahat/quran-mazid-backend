import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getAyahById } from "../services/quranService";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/ayahs/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id) || id < 1 || id > 6236) {
      throw new AppError(400, "Invalid ayah id. Must be between 1 and 6236.");
    }
    res.json(getAyahById(id));
  } catch (err) {
    next(err);
  }
});

export default router;
