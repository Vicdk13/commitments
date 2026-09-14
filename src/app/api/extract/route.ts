import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extract } from "@/lib/extract";
import { getModel, isEffort, modelCost, MODELS } from "@/lib/models";
import type { Transcript } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = { transcript?: Transcript; model?: string; effort?: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const transcript = body?.transcript;
  if (!transcript || !Array.isArray(transcript.turns)) {
    return NextResponse.json({ error: "Немає розшифровки" }, { status: 400 });
  }
  if (body?.model && !MODELS.some((m) => m.id === body.model)) {
    return NextResponse.json({ error: `Невідома модель: ${body.model}` }, { status: 400 });
  }
  const spec = getModel(body?.model);
  const effort = isEffort(body?.effort) ? body!.effort : spec.defaultEffort;

  if (transcript.turns.length === 0) {
    return NextResponse.json({
      model: spec.id, modelLabel: spec.label, effort,
      extraction: {
        status: "cannot_conclude",
        statusReason: "У записі не розпізнано жодного слова.",
        recordingTruncated: false,
        speakers: [],
        commitments: [],
        openQuestions: [],
      },
      metrics: { ms: 0, usd: 0, inputTokens: 0, outputTokens: 0, detail: "модель не викликалась" },
    });
  }

  const t0 = Date.now();
  try {
    const r = await extract(transcript, { model: spec.id, effort });
    const ms = Date.now() - t0;
    return NextResponse.json({
      model: r.model, modelLabel: spec.label, effort: r.effort,
      extraction: r.extraction,
      metrics: {
        ms,
        usd: modelCost(spec, r.usage.inputTokens, r.usage.outputTokens),
        inputTokens: r.usage.inputTokens,
        outputTokens: r.usage.outputTokens,
        detail: `${spec.label} · effort ${r.effort} · structured output`,
      },
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Ліміт запитів до моделі. Спробуйте за хвилину." }, { status: 429 });
    }
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Невірний ключ Anthropic API." }, { status: 500 });
    }
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Аналіз не вдався: ${message}` }, { status: 502 });
  }
}
