import { Router, type IRouter } from "express";
import { eq, sql, avg, max } from "drizzle-orm";
import { db, sessionsTable, sessionRoundsTable } from "@workspace/db";
import {
  ImprovePromptBody,
  CreateSessionBody,
  GetSessionParams,
  DeleteSessionParams,
} from "@workspace/api-zod";
import { runImprovementLoop } from "../../lib/prompt-improvement";

const router: IRouter = Router();

router.post("/improve-prompt", async (req, res): Promise<void> => {
  const parsed = ImprovePromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const result = await runImprovementLoop(parsed.data);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Prompt improvement failed");
    res.status(500).json({ error: "Prompt improvement failed. Please try again." });
  }
});

router.get("/sessions/stats", async (req, res): Promise<void> => {
  try {
    const [stats] = await db
      .select({
        totalSessions: sql<number>`count(*)::int`,
        averageFinalScore: avg(sessionsTable.finalScore),
        topFinalScore: max(sessionsTable.finalScore),
      })
      .from(sessionsTable);

    const allSessions = await db.select({ finalScore: sessionsTable.finalScore }).from(sessionsTable);
    const avgImprovement = allSessions.length > 0
      ? allSessions.reduce((acc, s) => acc + s.finalScore, 0) / allSessions.length
      : 0;

    res.json({
      totalSessions: Number(stats?.totalSessions ?? 0),
      averageFinalScore: Number(stats?.averageFinalScore ?? 0),
      averageScoreImprovement: Number(avgImprovement),
      topFinalScore: Number(stats?.topFinalScore ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch session stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/sessions", async (req, res): Promise<void> => {
  try {
    const sessions = await db
      .select()
      .from(sessionsTable)
      .orderBy(sql`${sessionsTable.createdAt} DESC`);

    res.json(
      sessions.map((s) => ({
        id: s.id,
        originalPrompt: s.originalPrompt,
        finalScore: s.finalScore,
        roundCount: s.roundCount,
        createdAt: s.createdAt,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list sessions");
    res.status(500).json({ error: "Failed to list sessions" });
  }
});

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { rounds, ...sessionData } = parsed.data;

    const [session] = await db
      .insert(sessionsTable)
      .values({
        originalPrompt: sessionData.originalPrompt,
        goal: sessionData.goal ?? null,
        audience: sessionData.audience ?? null,
        tone: sessionData.tone ?? null,
        constraints: sessionData.constraints ?? null,
        finalPrompt: sessionData.finalPrompt,
        finalScore: sessionData.finalScore,
        roundCount: rounds.length,
      })
      .returning();

    if (session && rounds.length > 0) {
      await db.insert(sessionRoundsTable).values(
        rounds.map((r) => ({
          sessionId: session.id,
          round: r.round,
          chatgptPrompt: r.chatgptPrompt,
          geminiCritique: r.geminiCritique,
          geminiScore: r.geminiScore,
          improvementSummary: r.improvementSummary,
        }))
      );
    }

    res.status(201).json({
      ...session,
      roundCount: rounds.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create session");
    res.status(500).json({ error: "Failed to save session" });
  }
});

router.get("/sessions/:id", async (req, res): Promise<void> => {
  const params = GetSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, params.data.id));

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const rounds = await db
      .select()
      .from(sessionRoundsTable)
      .where(eq(sessionRoundsTable.sessionId, params.data.id))
      .orderBy(sessionRoundsTable.round);

    res.json({ ...session, rounds });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch session");
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

router.delete("/sessions/:id", async (req, res): Promise<void> => {
  const params = DeleteSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [deleted] = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, params.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Failed to delete session");
    res.status(500).json({ error: "Failed to delete session" });
  }
});

export default router;
