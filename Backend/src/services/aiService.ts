import OpenAI from "openai";

// Support either OpenAI or OpenRouter (Drop-in via baseURL)
const openaiKey = process.env.OPENAI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;

if (!openaiKey && !openRouterKey) {
  console.warn(
    "No OPENAI_API_KEY or OPENROUTER_API_KEY set. AI features will fail until an API key is provided."
  );
}

// If OpenRouter key is present, configure the OpenAI client to use OpenRouter's base URL.
const openai = openRouterKey
  ? new OpenAI({ apiKey: openRouterKey, baseURL: process.env.OPENROUTER_BASE_URL || "https://r2.openrouter.ai/v1" })
  : new OpenAI({ apiKey: openaiKey });

type Subtask = {
  title: string;
  description?: string;
  estimatedMinutes?: number;
  suggestedXp?: number;
};

type BreakDownResult = {
  aiSummary: string;
  difficultyScore: number; // 1-10
  difficultyLabel: string; // very-easy|easy|medium|hard|very-hard
  subtasks: Subtask[];
  xpTotal?: number;
};

function extractJson(text: string): any | null {
  // Try to find a JSON block within the model output
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) return null;
  const jsonStr = text.slice(first, last + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

function clamp(n: number, min = 1, max = 10) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function difficultyLabel(score: number) {
  if (score <= 2) return "very-easy";
  if (score <= 4) return "easy";
  if (score <= 6) return "medium";
  if (score <= 8) return "hard";
  return "very-hard";
}

function computeXp(estimatedMinutes = 10, difficultyScore = 5) {
  const baseXPPerMinute = 0.2; // configurable
  const difficultyMultiplier = 1 + (difficultyScore - 5) / 5; // range ~ [0.2..2]
  const raw = estimatedMinutes * baseXPPerMinute * difficultyMultiplier;
  return Math.max(1, Math.round(raw));
}

export async function generateTaskBreakdown(opts: {
  title: string;
  description?: string;
  maxParts?: number;
  targetTimeMinutes?: number;
}): Promise<BreakDownResult> {
  const { title, description = "", maxParts = 6 } = opts;

  const systemPrompt = `You are a pragmatic productivity assistant. Return ONLY valid JSON (no surrounding text) following this schema:\n{\n  "aiSummary": string,\n  "difficultyScore": number, // 1-10\n  "subtasks": [ { "title": string, "description": string, "estimatedMinutes": number } ]\n}\nMake subtasks actionable, short titles, and estimates in whole minutes. Do not invent unrealistic estimates.`;

  const userPrompt = `Task title: ${title}\nDescription: ${description}\nRequirements: Break the task into up to ${maxParts} actionable steps. Return strictly valid JSON.`;

  const modelName = process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_MODEL || "r1" : process.env.OPENAI_MODEL || "gpt-4o-mini";

  const resp = await openai.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 800,
  });

  // Robustly extract text from different SDK response shapes
  let text = "";
  try {
    const anyResp: any = resp;
    // prefer choices[0]
    const choice = anyResp.choices?.[0] || anyResp.data?.choices?.[0] || anyResp;
    const messageAny: any = choice?.message ?? choice;

    if (!messageAny) {
      text = JSON.stringify(anyResp);
    } else {
      const content = messageAny.content;
      if (typeof content === "string") {
        text = content;
      } else if (Array.isArray(content)) {
        text = content.map((c: any) => c?.text ?? c?.payload ?? "").join("");
      } else if (content && typeof content === "object") {
        text = typeof content.text === "string" ? content.text : JSON.stringify(content);
      } else {
        text = JSON.stringify(messageAny);
      }
    }
  } catch (e) {
    text = "";
  }
  const parsed = extractJson(text);

  if (!parsed || !Array.isArray(parsed.subtasks)) {
    // Fallback minimal response
    const fallback: BreakDownResult = {
      aiSummary: `Couldn't parse AI response reliably.`,
      difficultyScore: 5,
      difficultyLabel: difficultyLabel(5),
      subtasks: [
        {
          title: title,
          description: description,
          estimatedMinutes: Math.max(10, Math.round((opts.targetTimeMinutes || 30) / 3)),
        },
      ],
    };
    fallback.subtasks.forEach((s) => (s.suggestedXp = computeXp(s.estimatedMinutes, fallback.difficultyScore)));
    fallback.xpTotal = fallback.subtasks.reduce((s, t) => s + (t.suggestedXp || 0), 0);
    return fallback;
  }

  // Normalize parsed fields
  const score = clamp(Number(parsed.difficultyScore ?? parsed.difficulty ?? 5));
  const aiSummary = String(parsed.aiSummary || parsed.summary || "");
  const subtasks: Subtask[] = (parsed.subtasks || []).slice(0, maxParts).map((st: any) => {
    const est = Number(st.estimatedMinutes ?? st.estimated_minutes ?? st.time ?? 10) || 10;
    return {
      title: String(st.title || st.name || "Untitled step").trim(),
      description: String(st.description || st.desc || "").trim(),
      estimatedMinutes: Math.max(1, Math.round(est)),
    };
  });

  subtasks.forEach((s) => (s.suggestedXp = computeXp(s.estimatedMinutes, score)));
  const xpTotal = subtasks.reduce((s, t) => s + (t.suggestedXp || 0), 0);

  return {
    aiSummary,
    difficultyScore: score,
    difficultyLabel: difficultyLabel(score),
    subtasks,
    xpTotal,
  };
}

export type { Subtask, BreakDownResult };
