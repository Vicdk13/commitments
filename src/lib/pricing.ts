// Ціни розпізнавання. Ціни моделей аналізу — у src/lib/models.ts.
// ElevenLabs Scribe: $0.22 / год аудіо → https://elevenlabs.io/pricing/api
// Хостинг (Vercel Hobby) — окремо, не входить у вартість операції.

export const SCRIBE_USD_PER_HOUR = 0.22;

export function scribeCost(durationSec: number): number {
  return (durationSec / 3600) * SCRIBE_USD_PER_HOUR;
}
