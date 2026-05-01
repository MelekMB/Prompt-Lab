import { randomUUID } from "crypto";
import { type Request, type Response, type NextFunction } from "express";

const QUOTA_WINDOW_MS = 60 * 60 * 1000;
const QUOTA_MAX_REQUESTS = 20;
export const SESSION_COOKIE = "_sid";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface QuotaEntry {
  count: number;
  windowStart: number;
}

const quotaStore = new Map<string, QuotaEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of quotaStore) {
    if (now - entry.windowStart > QUOTA_WINDOW_MS * 2) {
      quotaStore.delete(id);
    }
  }
}, QUOTA_WINDOW_MS);

export function getRequestSid(req: Request): string | undefined {
  return (req as Request & { _sid?: string })._sid;
}

export function sessionIssuance(req: Request, res: Response, next: NextFunction): void {
  const existing = req.signedCookies?.[SESSION_COOKIE] as string | undefined;
  if (existing) {
    (req as Request & { _sid?: string })._sid = existing;
  } else {
    const newId = randomUUID();
    res.cookie(SESSION_COOKIE, newId, {
      httpOnly: true,
      sameSite: "strict",
      signed: true,
      maxAge: SESSION_MAX_AGE_MS,
    });
    (req as Request & { _sid?: string })._sid = newId;
  }
  next();
}

export function requireSessionWithQuota(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.signedCookies?.[SESSION_COOKIE] as string | undefined;

  if (!sessionId) {
    res.status(401).json({ error: "No valid session. Please load the app in a browser first." });
    return;
  }

  const now = Date.now();
  const entry = quotaStore.get(sessionId);

  if (!entry || now - entry.windowStart > QUOTA_WINDOW_MS) {
    quotaStore.set(sessionId, { count: 1, windowStart: now });
    next();
    return;
  }

  if (entry.count >= QUOTA_MAX_REQUESTS) {
    res.status(429).json({
      error: "Hourly usage limit reached. Please try again later.",
    });
    return;
  }

  entry.count += 1;
  next();
}
