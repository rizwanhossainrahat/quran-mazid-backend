import type { Request, Response, NextFunction } from "express";
import type { ErrorResponse } from "../types/api";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" } satisfies ErrorResponse);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message } satisfies ErrorResponse);
    return;
  }
  console.error("[Error]", err);
  res.status(500).json({ error: "Internal server error" } satisfies ErrorResponse);
}
