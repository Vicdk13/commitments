// Повний прогін: mp3 → Scribe → Claude. Зберігає *.scribe.json і *.extract.json поруч із файлом.
//   npx tsx scripts/run_pipeline.ts samples/02-variant.mp3
import { config } from "dotenv";
config({ override: true }); // ключі проєкту важливіші за системні змінні
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { transcribe } from "../src/lib/stt";
import { extract } from "../src/lib/extract";
import { scribeCost } from "../src/lib/pricing";
import { getModel, modelCost } from "../src/lib/models";

async function main() {
  const path = process.argv[2];
  const audio = new Blob([readFileSync(path)], { type: "audio/mpeg" });

  const t0 = Date.now();
  const transcript = await transcribe(audio, basename(path));
  const tMs = Date.now() - t0;
  writeFileSync(path.replace(/\.mp3$/, ".transcript.json"), JSON.stringify(transcript, null, 2), "utf8");
  console.log(`STT: ${tMs} ms, ${transcript.turns.length} реплік, ${transcript.durationSec.toFixed(0)} с, $${scribeCost(transcript.durationSec).toFixed(4)}`);

  const t1 = Date.now();
  const r = await extract(transcript);
  const eMs = Date.now() - t1;
  writeFileSync(path.replace(/\.mp3$/, ".extract.json"), JSON.stringify({ ...r, ms: eMs }, null, 2), "utf8");

  const e = r.extraction;
  console.log(`\nstatus=${e.status} truncated=${e.recordingTruncated} — ${e.statusReason}`);
  console.log("speakers:", e.speakers.map((s) => `${s.label}=${s.name}`).join(", "));
  for (const c of e.commitments) {
    console.log(`\n[${c.status}] ${c.task}`);
    console.log(`   owner=${c.owner ?? "—"}${c.ownerNote ? ` (${c.ownerNote})` : ""}`);
    console.log(`   deadline=${c.deadline.text ?? "—"}${c.deadline.note ? ` (${c.deadline.note})` : ""}`);
    if (c.history) console.log(`   history: ${c.history}`);
    console.log(`   ${c.confidence} · «${c.quote.text}» — ${c.quote.speaker} @ ${c.quote.start.toFixed(1)}–${c.quote.end.toFixed(1)}s`);
  }
  console.log("\nopen questions:");
  for (const q of e.openQuestions) console.log(`  ? ${q.question} — «${q.quote.text}» @ ${q.quote.start.toFixed(1)}s`);
  const usd = modelCost(getModel(r.model), r.usage.inputTokens, r.usage.outputTokens);
  console.log(`\nLLM: ${eMs} ms · ${r.usage.inputTokens} in / ${r.usage.outputTokens} out · $${usd.toFixed(4)}`);
  console.log(`Разом: ${((tMs + eMs) / 1000).toFixed(1)} с · $${(usd + scribeCost(transcript.durationSec)).toFixed(4)} · $${((usd + scribeCost(transcript.durationSec)) / (transcript.durationSec / 60)).toFixed(4)}/хв аудіо`);
}
main().catch((e) => { console.error(e); process.exit(1); });
