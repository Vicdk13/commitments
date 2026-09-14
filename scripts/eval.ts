// Автоматична перевірка на тестовому наборі.
//   npx tsx scripts/eval.ts            — повний прогін (STT + LLM) для всіх файлів із samples/expected.json
//   npx tsx scripts/eval.ts --cached   — лише LLM на збережених *.transcript.json (без витрат на Scribe)
//   npx tsx scripts/eval.ts 02         — лише файли, назва яких містить «02»
// Пише samples/eval-report.md і samples/NN-*.extract.json.
import { config } from "dotenv";
config({ override: true });
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { transcribe } from "../src/lib/stt";
import { extract } from "../src/lib/extract";
import { scribeCost } from "../src/lib/pricing";
import { getModel, modelCost } from "../src/lib/models";
import type { Commitment, Extraction, Transcript } from "../src/lib/types";

type Check = {
  id: string;
  status?: Commitment["status"];
  anyStatus?: boolean;
  keywords: string[];
  owner?: string | null;
  ownerNotNull?: boolean;
  deadlineContains?: string;
  deadlineResolvable?: boolean;
  note?: string;
};
type Expected = {
  status: Extraction["status"];
  statusAlt?: Extraction["status"];
  recordingTruncated: boolean;
  speakers: string[];
  must_include: Check[];
  must_include_questions: { id: string; keywords: string[] }[];
  must_exclude: Check[];
};

const lc = (s: string | null | undefined) => (s ?? "").toLowerCase();
const hasAll = (text: string, kws: string[]) => kws.every((k) => lc(text).includes(k.toLowerCase()));

function matches(c: Commitment, chk: Check): boolean {
  if (!chk.anyStatus && chk.status && c.status !== chk.status) return false;
  if (!hasAll(c.task, chk.keywords)) return false;
  if ("owner" in chk && chk.owner !== undefined) {
    if (chk.owner === null ? c.owner !== null : lc(c.owner) !== lc(chk.owner)) return false;
  }
  if (chk.ownerNotNull && c.owner === null) return false;
  if (chk.deadlineContains && !lc(c.deadline.text).includes(chk.deadlineContains.toLowerCase())) return false;
  if (chk.deadlineResolvable !== undefined && c.deadline.resolvable !== chk.deadlineResolvable) return false;
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const cached = args.includes("--cached");
  const filter = args.find((a) => !a.startsWith("--"));
  const expectedAll = JSON.parse(readFileSync("samples/expected.json", "utf8")) as Record<string, Expected>;

  const report: string[] = [`# Eval report — ${new Date().toISOString()}`, ""];
  let pass = 0, fail = 0, totalUsd = 0, totalMs = 0, totalMin = 0;

  for (const [file, exp] of Object.entries(expectedAll)) {
    if (file.startsWith("_") || (filter && !file.includes(filter))) continue;
    const base = `samples/${file.replace(/\.mp3$/, "")}`;
    report.push(`## ${file}`, "");

    // --- STT ---
    let transcript: Transcript;
    let sttMs = 0;
    if (cached && existsSync(`${base}.transcript.json`)) {
      transcript = JSON.parse(readFileSync(`${base}.transcript.json`, "utf8"));
      report.push(`STT: з кешу (${base}.transcript.json)`);
    } else {
      const t0 = Date.now();
      transcript = await transcribe(new Blob([readFileSync(`samples/${file}`)]), file);
      sttMs = Date.now() - t0;
      writeFileSync(`${base}.transcript.json`, JSON.stringify(transcript, null, 2), "utf8");
      report.push(`STT: ${sttMs} мс, ${transcript.turns.length} реплік, $${scribeCost(transcript.durationSec).toFixed(4)}`);
    }

    // --- LLM ---
    const t1 = Date.now();
    const r = await extract(transcript);
    const llmMs = Date.now() - t1;
    const usd = modelCost(getModel(r.model), r.usage.inputTokens, r.usage.outputTokens) + scribeCost(transcript.durationSec);
    writeFileSync(`${base}.extract.json`, JSON.stringify({ ...r, ms: llmMs }, null, 2), "utf8");
    report.push(`LLM: ${r.model}, effort=${r.effort}, ${llmMs} мс, ${r.usage.inputTokens} in / ${r.usage.outputTokens} out`);
    report.push(`Разом: ${((sttMs + llmMs) / 1000).toFixed(1)} с, $${usd.toFixed(4)}, $${(usd / (transcript.durationSec / 60)).toFixed(4)}/хв`, "");
    totalUsd += usd; totalMs += sttMs + llmMs; totalMin += transcript.durationSec / 60;

    const e = r.extraction;
    const results: [boolean, string][] = [];

    // статус і спікери
    const okStatus = e.status === exp.status || (exp.statusAlt !== undefined && e.status === exp.statusAlt);
    results.push([okStatus, `status = ${e.status} (очікувано ${exp.status}${exp.statusAlt ? ` або ${exp.statusAlt}` : ""})`]);
    results.push([e.recordingTruncated === exp.recordingTruncated, `recordingTruncated = ${e.recordingTruncated} (очікувано ${exp.recordingTruncated})`]);
    const names = e.speakers.map((s) => s.name);
    results.push([exp.speakers.every((n) => names.includes(n)), `спікери: ${names.join(", ")} (очікувано ${exp.speakers.join(", ")})`]);

    // включення
    for (const chk of exp.must_include) {
      const hit = e.commitments.find((c) => matches(c, chk));
      results.push([!!hit, `INCLUDE ${chk.id}${chk.note ? ` — ${chk.note}` : ""}${hit ? ` → «${hit.task}»` : " → НЕ ЗНАЙДЕНО"}`]);
    }
    for (const chk of exp.must_include_questions) {
      const hit = e.openQuestions.find((q) => hasAll(q.question, chk.keywords));
      results.push([!!hit, `INCLUDE-Q ${chk.id}${hit ? ` → «${hit.question.slice(0, 70)}…»` : " → НЕ ЗНАЙДЕНО"}`]);
    }
    // виключення
    for (const chk of exp.must_exclude) {
      const hit = e.commitments.find((c) => matches(c, chk));
      results.push([!hit, `EXCLUDE ${chk.id}${chk.note ? ` — ${chk.note}` : ""}${hit ? ` → ПОМИЛКОВО Є: «${hit.task}» [${hit.status}, ${hit.owner}]` : ""}`]);
    }

    for (const [ok, line] of results) {
      report.push(`- ${ok ? "✅" : "❌"} ${line}`);
      ok ? pass++ : fail++;
    }
    report.push("");
    report.push("<details><summary>Повна видача</summary>", "", "```json", JSON.stringify(e, null, 2), "```", "</details>", "");
  }

  report.push("---", `**${pass} пройдено, ${fail} не пройдено.** Разом ${(totalMs / 1000).toFixed(1)} с, $${totalUsd.toFixed(4)} за ${totalMin.toFixed(1)} хв аудіо = $${(totalUsd / Math.max(totalMin, 0.01)).toFixed(4)}/хв.`);
  writeFileSync(process.env.EVAL_REPORT || "samples/eval-report.md", report.join("\n"), "utf8");
  console.log(report.filter((l) => !l.startsWith("```") && !l.startsWith("{") && !l.startsWith(" ") && !l.startsWith("<")).join("\n"));
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
