import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validateRequest(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    response.status(400).json({ error: "Validation failed", details: errors.array() });
    return;
  }
  next();
}

export function errorHandler(
  error: Error & { code?: string; statusCode?: number },
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error.code === "P2002") {
    response.status(409).json({ error: "A record with that value already exists" });
    return;
  }
  if (error.code === "P2025") {
    response.status(404).json({ error: "Record not found" });
    return;
  }
  if (error.name === "PrismaClientInitializationError") {
    response.status(503).json({
      error: "Database unavailable",
      message: "Start MySQL and verify DATABASE_URL before using this endpoint",
    });
    return;
  }
  console.error(error);
  response.status(error.statusCode ?? 500).json({ error: "Internal server error" });
}

export function requestLogger(request: Request, _response: Response, next: NextFunction): void {
  console.info(`${new Date().toISOString()} ${request.method} ${request.path}`);
  next();
}
