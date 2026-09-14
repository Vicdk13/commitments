// Ручний прогін витягу на збереженій відповіді Scribe:
//   npx tsx scripts/run_extract.ts samples/01-main.scribe.json
import { config } from "dotenv";
config({ override: true }); // ключі проєкту важливіші за системні змінні
import { readFileSync, writeFileSync } from "node:fs";
import { toTranscript } from "../src/lib/stt";
import { extract } from "../src/lib/extract";
import { claudeCost } from "../src/lib/pricing";

async function main() {
const path = process.argv[2];
const raw = JSON.parse(readFileSync(path, "utf8"));
const transcript = path.endsWith(".transcript.json") ? raw : toTranscript(raw);
const t0 = Date.now();
const r = await extract(transcript);
const ms = Date.now() - t0;
const out = path.replace(/\.(scribe|transcript)\.json$/, ".extract.json");
writeFileSync(out, JSON.stringify({ ...r, ms }, null, 2), "utf8");

const { extraction: e } = r;
console.log(`status=${e.status} truncated=${e.recordingTruncated} — ${e.statusReason}`);
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
console.log(`\n${ms} ms · ${r.usage.inputTokens} in / ${r.usage.outputTokens} out · $${claudeCost(r.usage.inputTokens, r.usage.outputTokens).toFixed(4)}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
