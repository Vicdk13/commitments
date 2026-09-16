// Перегляд текстового експорту (UI-11) для збереженої видачі:
//   npx tsx scripts/md_preview.ts samples/02-variant.extract.json
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { toMarkdown } from "../src/lib/exportText";
import { getModel } from "../src/lib/models";

const path = process.argv[2];
const r = JSON.parse(readFileSync(path, "utf8"));
const spec = getModel(r.model);
const run = {
  id: "preview", model: r.model, modelLabel: spec.label, effort: r.effort,
  extraction: r.extraction,
  metrics: { ms: r.ms ?? 0, usd: 0, inputTokens: r.usage?.inputTokens ?? 0, outputTokens: r.usage?.outputTokens ?? 0, detail: "" },
};
const transcript = JSON.parse(readFileSync(path.replace(".extract.json", ".transcript.json"), "utf8"));
process.stdout.write(toMarkdown(run, basename(path).replace(".extract.json", ".mp3"), transcript.durationSec));
