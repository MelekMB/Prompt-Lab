import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  ownerSid: text("owner_sid").notNull(),
  originalPrompt: text("original_prompt").notNull(),
  goal: text("goal"),
  audience: text("audience"),
  tone: text("tone"),
  constraints: text("constraints"),
  finalPrompt: text("final_prompt").notNull(),
  finalScore: real("final_score").notNull(),
  initialScore: real("initial_score"),
  transformationScore: real("transformation_score"),
  roundCount: integer("round_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessionsTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;
