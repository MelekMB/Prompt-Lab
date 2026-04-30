import { openai } from "@workspace/integrations-openai-ai-server";
import { ai } from "@workspace/integrations-gemini-ai";
import { logger } from "./logger";

const OPENAI_SYSTEM_PROMPT = `You are an elite prompt engineer. Your job is to transform rough user prompts into clear, precise, high-performing prompts.

First, identify the workflow type: single-shot, multi-turn conversation, tool-assisted, or reasoning-chain. Tailor your improvements to fit — do not force a standalone output format onto a prompt designed for multi-turn use, and do not add unnecessary structure to a simple single-shot request.

If the prompt contains template placeholders like [NAME], {topic}, or <audience>, preserve them. Evaluate whether they are clearly labelled and constrained, and improve the placeholder definitions if needed rather than filling them in.

Improve the prompt by adding where appropriate: role/persona, intended audience, context, task definition, positive constraints, negative constraints (explicit "do not" guards), output format, and a quality bar or success criteria section so the AI can self-evaluate its output.

Do not reward polished wording over substance — if the core instructions are vague, fix the instructions, not just the formatting. Do not add fake facts. Do not make the prompt unnecessarily long. Preserve the user's original intent. Return JSON with: improved_prompt, improvement_summary.`;

const GEMINI_CRITIQUE_PROMPT = `You are an expert prompt reviewer. Your job is to give specific, actionable feedback that will help an AI rewrite a prompt to be more effective.

Analyze the prompt and identify:
1. What role, context, constraints, output format, or audience definition is missing or unclear
2. What is vague or ambiguous and needs to be made more specific
3. Concrete changes that would make this prompt produce more consistent, useful results

Be direct and specific. Focus on substance over formatting. Do not write generic advice — point to exact weaknesses in this specific prompt.

Return JSON with: critique (the main analysis), missing_details (what's absent), suggested_next_changes (concrete action items for the next revision).`;

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
  improvementSummary: string;
}

export interface ImprovementResult {
  originalPrompt: string;
  rounds: RoundResult[];
  finalPrompt: string;
}

export type ProgressEvent =
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
    ? `Here is a prompt that needs improvement:\n\n${prompt}${context}\n\nAn expert reviewer gave this critique:\n${geminiCritique}\n\nPlease improve the prompt based on this critique.`
    : `Here is a prompt that needs improvement:\n\n${prompt}${context}\n\nPlease improve it to be clearer, more specific, and more effective.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 4096,
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

async function critiqueWithGemini(prompt: string): Promise<{ critique: string }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `${GEMINI_CRITIQUE_PROMPT}\n\nReview this prompt:\n\n${prompt}` }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
    },
  });

  const text = response.text ?? "{}";
  const parsed = JSON.parse(text) as {
    critique?: string;
    missing_details?: string;
    suggested_next_changes?: string;
  };

  const parts: string[] = [];
  if (parsed.critique) parts.push(parsed.critique);
  if (parsed.missing_details) parts.push(`Missing: ${parsed.missing_details}`);
  if (parsed.suggested_next_changes) parts.push(`Suggestions: ${parsed.suggested_next_changes}`);

  return { critique: parts.join("\n\n") || "Prompt reviewed." };
}

async function synthesizeFinal(
  originalPrompt: string,
  rounds: RoundResult[]
): Promise<string> {
  const roundsSummary = rounds
    .map(
      (r) =>
        `Round ${r.round}:\nImproved Prompt: ${r.chatgptPrompt}\nCritique: ${r.geminiCritique}`
    )
    .join("\n\n---\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 4096,
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

    const { critique } = await critiqueWithGemini(improvedPrompt);

    const roundResult: RoundResult = {
      round: i,
      chatgptPrompt: improvedPrompt,
      geminiCritique: critique,
      improvementSummary: summary,
    };
    rounds.push(roundResult);
    emit({ type: "round_done", round: i, data: roundResult });

    currentPrompt = improvedPrompt;
    lastCritique = critique;
  }

  emit({ type: "synthesizing" });
  const finalPrompt = await synthesizeFinal(params.prompt, rounds);

  const result: ImprovementResult = {
    originalPrompt: params.prompt,
    rounds,
    finalPrompt,
  };

  emit({ type: "complete", data: result });
  return result;
}
