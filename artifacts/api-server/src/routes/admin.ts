import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, sessionsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_COOKIE = "_admin_sid";
const ADMIN_TOKEN = "granted";

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const cookie = req.signedCookies?.[ADMIN_COOKIE];
  if (cookie === ADMIN_TOKEN) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/admin/login", (req: Request, res: Response): void => {
  const { password } = req.body as { password?: string };

  if (!ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin access not configured." });
    return;
  }

  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }

  res.cookie(ADMIN_COOKIE, ADMIN_TOKEN, {
    httpOnly: true,
    sameSite: "strict",
    signed: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });

  res.json({ ok: true });
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.post("/admin/logout", (_req: Request, res: Response): void => {
  res.clearCookie(ADMIN_COOKIE);
  res.json({ ok: true });
});

// ── Stats overview ────────────────────────────────────────────────────────────
router.get("/admin/stats", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const [totals] = await db.execute(sql`
      SELECT
        COUNT(*)::int                              AS total_sessions,
        COUNT(DISTINCT owner_sid)::int            AS unique_users,
        ROUND(AVG(final_score)::numeric, 2)       AS avg_score,
        ROUND(AVG(round_count)::numeric, 2)       AS avg_rounds,
        ROUND(AVG(final_score - COALESCE(initial_score, 0))::numeric, 2) AS avg_improvement
      FROM sessions
    `);

    const daily = await db.execute(sql`
      SELECT
        DATE(created_at)::text AS day,
        COUNT(*)::int          AS sessions,
        COUNT(DISTINCT owner_sid)::int AS users
      FROM sessions
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);

    const scoreBreakdown = await db.execute(sql`
      SELECT
        CASE
          WHEN final_score >= 9   THEN 'Excellent (9–10)'
          WHEN final_score >= 7   THEN 'Good (7–9)'
          WHEN final_score >= 5   THEN 'Fair (5–7)'
          ELSE                         'Poor (<5)'
        END AS bucket,
        COUNT(*)::int AS count
      FROM sessions
      GROUP BY bucket
      ORDER BY MIN(final_score) DESC
    `);

    res.json({
      totals: totals,
      daily: daily.rows ?? daily,
      scoreBreakdown: scoreBreakdown.rows ?? scoreBreakdown,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats query failed");
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// ── Recent sessions ───────────────────────────────────────────────────────────
router.get("/admin/sessions", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const rows = await db
      .select({
        id: sessionsTable.id,
        ownerSid: sessionsTable.ownerSid,
        originalPrompt: sessionsTable.originalPrompt,
        finalScore: sessionsTable.finalScore,
        initialScore: sessionsTable.initialScore,
        roundCount: sessionsTable.roundCount,
        goal: sessionsTable.goal,
        createdAt: sessionsTable.createdAt,
      })
      .from(sessionsTable)
      .orderBy(desc(sessionsTable.createdAt))
      .limit(limit);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Admin sessions query failed");
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

export default router;
