import { pgTable, serial, integer, text, real } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";

export const sessionRoundsTable = pgTable("session_rounds", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessionsTable.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  chatgptPrompt: text("chatgpt_prompt").notNull(),
  geminiCritique: text("gemini_critique").notNull(),
  geminiScore: real("gemini_score").notNull(),
  improvementSummary: text("improvement_summary").notNull(),
});

export type SessionRound = typeof sessionRoundsTable.$inferSelect;
export type InsertSessionRound = typeof sessionRoundsTable.$inferInsert;
