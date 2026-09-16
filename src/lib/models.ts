// Реєстр моделей для кроку «аналіз». Ціни — $ за 1M токенів, з публічних прайсів на вересень 2026.
// Додати провайдера = додати запис сюди + гілку в src/lib/extract.ts (runExtraction).

export type Effort = "low" | "medium" | "high";
export type Provider = "anthropic"; // завтра: | "openai" | "google" | "deepseek"

export type ModelSpec = {
  id: string;
  label: string;
  provider: Provider;
  inputUsdPerMTok: number;
  outputUsdPerMTok: number;
  defaultEffort: Effort;
  supportsEffort: boolean;
  note: string;
};

export const MODELS: ModelSpec[] = [
  {
    id: "claude-opus-5",
    label: "Claude Opus 5",
    provider: "anthropic",
    inputUsdPerMTok: 5,
    outputUsdPerMTok: 25,
    defaultEffort: "high",
    supportsEffort: true,
    note: "найстабільніший на тестовому наборі, ≈$0,04/хв",
  },
  {
    id: "claude-sonnet-5",
    label: "Claude Sonnet 5",
    provider: "anthropic",
    inputUsdPerMTok: 2,
    outputUsdPerMTok: 10,
    defaultEffort: "high",
    supportsEffort: true,
    note: "у 2 рази дешевше, але іноді губить пункти, ≈$0,02/хв",
  },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;

export function getModel(id: string | undefined | null): ModelSpec {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}

export function isEffort(v: unknown): v is Effort {
  return v === "low" || v === "medium" || v === "high";
}

export function modelCost(spec: ModelSpec, inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * spec.inputUsdPerMTok + (outputTokens / 1_000_000) * spec.outputUsdPerMTok;
}
