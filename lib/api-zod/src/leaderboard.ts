import * as zod from "zod";

export const AVATAR_COLORS = [
  "#e05252",
  "#e07d52",
  "#e0c452",
  "#52e07d",
  "#52b8e0",
  "#7d52e0",
  "#e052b8",
  "#a0a0a0",
] as const;

export const LEADERBOARD_SUBJECTS = [
  "Marketing",
  "Technical",
  "Creative",
  "Business",
  "Education",
  "Career",
  "Product",
  "Other",
] as const;

export const SubmitLeaderboardBody = zod.object({
  sessionId: zod.number(),
  handle: zod.string().min(2).max(30),
  avatarColor: zod.string(),
  subject: zod.enum(LEADERBOARD_SUBJECTS),
});

export const LeaderboardEntrySchema = zod.object({
  id: zod.number(),
  sessionId: zod.number().nullable(),
  handle: zod.string(),
  avatarColor: zod.string(),
  subject: zod.string(),
  score: zod.number(),
  originalPromptPreview: zod.string(),
  finalPromptPreview: zod.string(),
  createdAt: zod.coerce.date(),
});

export const LeaderboardResponseSchema = zod.array(LeaderboardEntrySchema);

export type LeaderboardSubject = typeof LEADERBOARD_SUBJECTS[number];
export type LeaderboardEntryType = zod.infer<typeof LeaderboardEntrySchema>;
