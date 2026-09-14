import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extract } from "@/lib/extract";
import { claudeCost } from "@/lib/pricing";
import type { Transcript } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { transcript?: Transcript } | null;
  const transcript = body?.transcript;
  if (!transcript || !Array.isArray(transcript.turns)) {
    return NextResponse.json({ error: "Немає розшифровки" }, { status: 400 });
  }
  if (transcript.turns.length === 0) {
    return NextResponse.json({
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
    const r = await extract(transcript);
    const ms = Date.now() - t0;
    return NextResponse.json({
      extraction: r.extraction,
      metrics: {
        ms,
        usd: claudeCost(r.usage.inputTokens, r.usage.outputTokens),
        inputTokens: r.usage.inputTokens,
        outputTokens: r.usage.outputTokens,
        detail: `${r.model}, structured output, adaptive thinking`,
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
