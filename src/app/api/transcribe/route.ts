import { NextResponse } from "next/server";
import { transcribe } from "@/lib/stt";
import { scribeCost } from "@/lib/pricing";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 4.5 * 1024 * 1024; // ліміт тіла запиту на Vercel; 3 хв mp3 128 kbps ≈ 2,9 МБ
const MAX_SECONDS = 3 * 60 + 15; // бриф: до 3 хвилин; невеликий запас на хвіст

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Файл не отримано" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл більший за 4,5 МБ. Стисніть у mp3/m4a — 3 хвилини у mp3 важать близько 3 МБ." }, { status: 413 });
  }

  const t0 = Date.now();
  try {
    const transcript = await transcribe(file, (file as File).name ?? "audio");
    const ms = Date.now() - t0;
    if (transcript.durationSec > MAX_SECONDS) {
      return NextResponse.json(
        { error: `Запис триває ${Math.round(transcript.durationSec / 60)} хв. Прототип обробляє записи до 3 хвилин.` },
        { status: 422 },
      );
    }
    return NextResponse.json({
      transcript,
      metrics: { ms, usd: scribeCost(transcript.durationSec), detail: "ElevenLabs Scribe v1, діаризація на 2 спікери" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Розпізнавання не вдалося: ${message}` }, { status: 502 });
  }
}
