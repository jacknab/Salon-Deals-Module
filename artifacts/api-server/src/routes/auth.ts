import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!getAuth(req).userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

export function userIdFromRequest(req: Request): string {
  return getAuth(req).userId as string;
}