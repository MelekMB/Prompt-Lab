import { openai } from "@workspace/integrations-openai-ai-server";
import { ai } from "@workspace/integrations-gemini-ai";
import { logger } from "./logger";

const OPENAI_SYSTEM_PROMPT = `You are an elite prompt engineer. Your job is to transform rough user prompts into clear, precise, high-performing prompts. Improve the prompt by adding role/persona, context, task definition, constraints, output format, evaluation criteria, and any missing assumptions. Do not add fake facts. Do not make the prompt unnecessarily long. Preserve the user's original intent. Return JSON with: improved_prompt, improvement_summary.`;

const GEMINI_SYSTEM_PROMPT = `You are a strict prompt evaluator. Review the prompt for clarity, specificity, completeness, ambiguity, constraints, output format, and likelihood of producing a useful result. Give constructive critique and a score from 1 to 10. Return JSON with: critique, missing_details, score, suggested_next_changes.`;

const FINAL_SYNTHESIS_PROMPT = `You are an elite prompt engineer finalizing the best version of a prompt. Using all the iterative improvements and critiques, produce the definitive optimized prompt. Structure it with clearly labeled sections:

Role: [Define the AI persona/role]
Context: [Background information and situation]
Task: [Clear description of what needs to be done]
Inputs: [What information/data the AI will receive]
Requirements: [Specific requirements and constraints]
Output Format: [Exact format of the expected output]
Quality Bar / Success Criteria: [How to evaluate a good response]

Return JSON with: final_prompt (the full structured prompt with these sections), improvement_summary (what changed most from the original).`;

interface RoundResult {
  round: number;
  chatgptPrompt: string;
  geminiCritique: string;
  geminiScore: number;
  improvementSummary: string;
}

interface ImprovementResult {
  originalPrompt: string;
  rounds: RoundResult[];
  finalPrompt: string;
  finalScore: number;
}

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
    improvement_summary?: string;
  };

  return {
    improvedPrompt: parsed.improved_prompt ?? prompt,
    summary: parsed.improvement_summary ?? "Prompt improved for clarity and specificity.",
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

export async function runImprovementLoop(params: {
  prompt: string;
  goal?: string;
  audience?: string;
  tone?: string;
  constraints?: string;
  rounds?: number;
}): Promise<ImprovementResult> {
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

    const { improvedPrompt, summary } = await improveWithChatGPT(
      currentPrompt,
      i === 1 ? context : "",
      lastCritique
    );

    const { critique, score } = await critiqueWithGemini(improvedPrompt);

    rounds.push({
      round: i,
      chatgptPrompt: improvedPrompt,
      geminiCritique: critique,
      geminiScore: score,
      improvementSummary: summary,
    });

    currentPrompt = improvedPrompt;
    lastCritique = critique;
  }

  const finalPrompt = await synthesizeFinal(params.prompt, rounds);
  const finalScore = rounds[rounds.length - 1]?.geminiScore ?? 0;

  return {
    originalPrompt: params.prompt,
    rounds,
    finalPrompt,
    finalScore,
  };
}
