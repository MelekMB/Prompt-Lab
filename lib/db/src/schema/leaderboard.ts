import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";

export const leaderboardEntriesTable = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessionsTable.id, { onDelete: "set null" }),
  handle: text("handle").notNull(),
  avatarColor: text("avatar_color").notNull().default("#e05252"),
  subject: text("subject").notNull(),
  score: real("score").notNull(),
  originalPromptPreview: text("original_prompt_preview").notNull(),
  finalPromptPreview: text("final_prompt_preview").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LeaderboardEntry = typeof leaderboardEntriesTable.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboardEntriesTable.$inferInsert;
