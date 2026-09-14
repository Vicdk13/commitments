// Припущення по цінах. Джерела на момент написання (вересень 2026):
// ElevenLabs Scribe: $0.22 / год аудіо  → https://elevenlabs.io/pricing/api
// Claude Opus 5:     $5 / 1M вхідних, $25 / 1M вихідних токенів → https://docs.claude.com/en/docs/about-claude/pricing
// Хостинг (Vercel Hobby) — окремо, $0 при малих обсягах; не входить у вартість операції.

export const PRICING = {
  scribeUsdPerHour: 0.22,
  claude: {
    model: "claude-opus-5",
    inputUsdPerMTok: 5,
    outputUsdPerMTok: 25,
  },
} as const;

export function scribeCost(durationSec: number): number {
  return (durationSec / 3600) * PRICING.scribeUsdPerHour;
}

// Ціни інших моделей — лише для експериментів у scripts/eval.ts (EXTRACT_MODEL).
const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

export function claudeCost(inputTokens: number, outputTokens: number, model: string = PRICING.claude.model): number {
  const p = MODEL_PRICES[model] ?? { input: PRICING.claude.inputUsdPerMTok, output: PRICING.claude.outputUsdPerMTok };
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}
