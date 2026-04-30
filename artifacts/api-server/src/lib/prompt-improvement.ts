import { openai } from "@workspace/integrations-openai-ai-server";
import { ai } from "@workspace/integrations-gemini-ai";
import { logger } from "./logger";

const OPENAI_SYSTEM_PROMPT = `You are an elite prompt engineer. Your job is to transform rough user prompts into clear, precise, high-performing prompts.

First, identify the workflow type: single-shot, multi-turn conversation, tool-assisted, or reasoning-chain. Tailor your improvements to fit — do not force a standalone output format onto a prompt designed for multi-turn use, and do not add unnecessary structure to a simple single-shot request.

If the prompt contains template placeholders like [NAME], {topic}, or <audience>, preserve them. Evaluate whether they are clearly labelled and constrained, and improve the placeholder definitions if needed rather than filling them in.

Improve the prompt by adding where appropriate: role/persona, intended audience, context, task definition, positive constraints, negative constraints (explicit "do not" guards), output format, and a quality bar or success criteria section so the AI can self-evaluate its output.

Do not reward polished wording over substance — if the core instructions are vague, fix the instructions, not just the formatting. Do not add fake facts. Do not make the prompt unnecessarily long. Preserve the user's original intent. Return JSON with: improved_prompt, improvement_summary.`;

const GEMINI_SYSTEM_PROMPT = `You are an expert prompt quality judge. Your scores must follow a strict, calibrated rubric — most prompts should score between 4 and 7. High scores are rare and must be earned.

BEFORE SCORING — assess these three things first:
1. Workflow type: Is this prompt designed for single-shot use, multi-turn conversation, tool-assisted workflows, or reasoning chains? Calibrate accordingly. A multi-turn prompt does not need a fully standalone output spec — penalising it for that is an error.
2. Placeholders / variables: If the prompt contains template fields like [NAME], {topic}, or <audience>, do not treat those as failures. Evaluate whether the variables are clearly labelled, constrained enough, and leave the prompt unambiguous after substitution.
3. Polish vs. substance: Do not reward well-formatted wording if the underlying instructions are vague or weak. A prompt that looks structured but gives the model no real constraints is a 5, not a 7.

SCORING RUBRIC (follow this exactly):
1–2: Broken or nonsensical. Provides no useful direction whatsoever.
3: Very vague. A one-liner with no role, no context, no structure. Would produce wildly inconsistent results.
4: Minimal. Has some intent but lacks specificity, constraints, or output format. Below average.
5: Functional but generic. Passable prompt that a casual user might write. Missing at least 2 of: role, context, constraints, output format.
6: Decent. Clear task, some context. Missing 1 meaningful element (e.g., no output format, vague constraints).
7: Solid. Has role, context, clear task, and at least one constraint. A competent prompt engineer would approve this. Most optimized prompts should land here.
8: Professional grade. All key elements present and well-specified. Defines the intended audience or reader. Includes negative constraints (explicit "do not" guards). Tight and unambiguous. Hard to improve meaningfully.
9: Exceptional. Includes a quality bar or success criteria section so the AI can self-evaluate its own output. A prompt engineer would struggle to find anything to improve.
10: Flawless. Extremely rare — perfect in every dimension. Do not award 10 unless the prompt is genuinely the best possible version of itself.

IMPORTANT: Be skeptical. Even well-structured prompts usually have something to improve. Scores of 9 or 10 should be awarded less than 5% of the time. If you are tempted to score above 8, ask yourself: "Could a prompt engineer improve this at all?" If yes, score lower.

Evaluate these dimensions: clarity, specificity, role definition, audience definition, context, task clarity, constraints (positive and negative), output format, quality bar / success criteria, and workflow fit.

Return JSON with: critique, missing_details, score, suggested_next_changes.`;

const FINAL_SYNTHESIS_PROMPT = `You are an elite prompt engineer finalizing the best version of a prompt. Using all the iterative improvements and critiques, produce the definitive optimized prompt. Structure it with clearly labeled sections:

Role: [Define the AI persona/role]
Context: [Background information and situation]
Task: [Clear description of what needs to be done]
Inputs: [What information/data the AI will receive]
Requirements: [Specific requirements and constraints]
Output Format: [Exact format of the expected output]
Quality Bar / Success Criteria: [How to evaluate a good response]

Return JSON with: final_prompt (the full structured prompt with these sections), improvement_summary (what changed most from the original).`;

export interface RoundResult {
  round: number;
  chatgptPrompt: string;
  geminiCritique: string;
  geminiScore: number;
  improvementSummary: string;
}

export interface ImprovementResult {
  originalPrompt: string;
  rounds: RoundResult[];
  finalPrompt: string;
  rawScore: number;
  roundPenalty: number;
  finalScore: number;
  initialScore: number;
  transformationScore: number;
}

export type ProgressEvent =
  | { type: "initial_scored"; initialScore: number }
  | { type: "round_start"; round: number; totalRounds: number }
  | { type: "chatgpt_done"; round: number }
  | { type: "round_done"; round: number; data: RoundResult }
  | { type: "synthesizing" }
  | { type: "complete"; data: ImprovementResult }
  | { type: "error"; message: string };

function buildContextString(opts: {
  goal?: string;
  audience?: string;
  tone?: string;
  constraints?: string;
}): string {
  const parts: string[] = [];
  if (opts.goal) parts.push(`Goal: ${opts.goal}`);
  if (opts.audience) parts.push(`Target Audience: ${opts.audience}`);
  if (opts.tone) parts.push(`Tone/Style: ${opts.tone}`);
  if (opts.constraints) parts.push(`Constraints: ${opts.constraints}`);
  return parts.length > 0 ? `\n\nAdditional context:\n${parts.join("\n")}` : "";
}

async function improveWithChatGPT(
  prompt: string,
  context: string,
  geminiCritique?: string
): Promise<{ improvedPrompt: string; summary: string }> {
  const userContent = geminiCritique
    ? `Here is a prompt that needs improvement:\n\n${prompt}${context}\n\nThe previous version received this critique from an evaluator:\n${geminiCritique}\n\nPlease improve the prompt based on this critique.`
    : `Here is a prompt that needs improvement:\n\n${prompt}${context}\n\nPlease improve it to be clearer, more specific, and more effective.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: OPENAI_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as {
    improved_prompt?: string;
    improvement_summary?: string | string[];
  };

  const rawSummary = parsed.improvement_summary;
  const summary = Array.isArray(rawSummary)
    ? rawSummary.join(" ")
    : rawSummary ?? "Prompt improved for clarity and specificity.";

  return {
    improvedPrompt: parsed.improved_prompt ?? prompt,
    summary,
  };
}

async function critiqueWithGemini(
  prompt: string
): Promise<{ critique: string; score: number }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${GEMINI_SYSTEM_PROMPT}\n\nEvaluate this prompt:\n\n${prompt}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });

  const text = response.text ?? "{}";
  const parsed = JSON.parse(text) as {
    critique?: string;
    missing_details?: string;
    score?: number;
    suggested_next_changes?: string;
  };

  const critiqueParts: string[] = [];
  if (parsed.critique) critiqueParts.push(parsed.critique);
  if (parsed.missing_details) critiqueParts.push(`Missing: ${parsed.missing_details}`);
  if (parsed.suggested_next_changes)
    critiqueParts.push(`Suggestions: ${parsed.suggested_next_changes}`);

  return {
    critique: critiqueParts.join("\n\n") || "Prompt reviewed.",
    score: typeof parsed.score === "number" ? Math.min(10, Math.max(1, parsed.score)) : 5,
  };
}

async function synthesizeFinal(
  originalPrompt: string,
  rounds: RoundResult[]
): Promise<string> {
  const roundsSummary = rounds
    .map(
      (r) =>
        `Round ${r.round}:\nImproved Prompt: ${r.chatgptPrompt}\nGemini Critique: ${r.geminiCritique}\nScore: ${r.geminiScore}/10`
    )
    .join("\n\n---\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: FINAL_SYNTHESIS_PROMPT },
      {
        role: "user",
        content: `Original prompt:\n${originalPrompt}\n\nIterative improvements:\n${roundsSummary}\n\nCreate the final, definitively optimized prompt with the labeled sections.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { final_prompt?: string };
  return parsed.final_prompt ?? rounds[rounds.length - 1]?.chatgptPrompt ?? originalPrompt;
}

export async function runImprovementLoop(
  params: {
    prompt: string;
    goal?: string;
    audience?: string;
    tone?: string;
    constraints?: string;
    rounds?: number;
  },
  onProgress?: (event: ProgressEvent) => void
): Promise<ImprovementResult> {
  const emit = (event: ProgressEvent) => onProgress?.(event);
  const roundCount = Math.min(5, Math.max(1, params.rounds ?? 3));
  const context = buildContextString({
    goal: params.goal,
    audience: params.audience,
    tone: params.tone,
    constraints: params.constraints,
  });

  // Score the original prompt before any rewriting begins
  logger.info("Scoring original prompt");
  const { score: initialScore } = await critiqueWithGemini(params.prompt);
  emit({ type: "initial_scored", initialScore });

  const rounds: RoundResult[] = [];
  let currentPrompt = params.prompt;
  let lastCritique: string | undefined;

  for (let i = 1; i <= roundCount; i++) {
    logger.info({ round: i, totalRounds: roundCount }, "Running improvement round");
    emit({ type: "round_start", round: i, totalRounds: roundCount });

    const { improvedPrompt, summary } = await improveWithChatGPT(
      currentPrompt,
      i === 1 ? context : "",
      lastCritique
    );

    emit({ type: "chatgpt_done", round: i });

    const { critique, score } = await critiqueWithGemini(improvedPrompt);

    const roundResult: RoundResult = {
      round: i,
      chatgptPrompt: improvedPrompt,
      geminiCritique: critique,
      geminiScore: score,
      improvementSummary: summary,
    };
    rounds.push(roundResult);
    emit({ type: "round_done", round: i, data: roundResult });

    currentPrompt = improvedPrompt;
    lastCritique = critique;
  }

  emit({ type: "synthesizing" });
  const finalPrompt = await synthesizeFinal(params.prompt, rounds);
  const rawScore = rounds[rounds.length - 1]?.geminiScore ?? 0;

  // Round penalty: each extra round beyond 1 costs 0.3 points.
  // Incentivises getting a high score in fewer iterations.
  const roundPenalty = parseFloat(((roundCount - 1) * 0.3).toFixed(1));
  const finalScore = parseFloat(Math.max(1, rawScore - roundPenalty).toFixed(1));

  // Transformation score: how much headroom was recovered from original to best round score.
  // Formula: (bestScore - initialScore) / (10 - initialScore) * 100
  // Normalised so that starting from a worse prompt isn't penalised.
  const bestScore = Math.max(...rounds.map((r) => r.geminiScore));
  const headroom = 10 - initialScore;
  const transformationScore = headroom > 0
    ? parseFloat(((bestScore - initialScore) / headroom * 100).toFixed(1))
    : 0;

  const result: ImprovementResult = {
    originalPrompt: params.prompt,
    rounds,
    finalPrompt,
    rawScore,
    roundPenalty,
    finalScore,
    initialScore,
    transformationScore,
  };

  emit({ type: "complete", data: result });
  return result;
}
