import type { ExtractRun, StageMetrics } from "./types";
import { buildAnnotations, KIND_LABEL, type Annotation } from "./annotations";
import { fmtTime } from "./format";

/** Markdown-версія результату для вставки у Slack / Notion / лист (UI-11). Чиста функція. */
export function toMarkdown(run: ExtractRun, fileName: string, durationSec: number, transcribe?: StageMetrics): string {
  const e = run.extraction;
  const lines: string[] = [];
  lines.push(`# Домовленості — ${fileName} (${fmtTime(durationSec)})`);
  const statusTitle = e.status === "ok" ? "Домовленості зафіксовано" : e.status === "no_commitments" ? "Домовленостей не досягнуто" : "Не можу зробити висновок";
  lines.push(`${statusTitle}. ${e.statusReason}${e.recordingTruncated ? " Запис обірваний." : ""}`);
  const date = new Date().toLocaleDateString("uk-UA");
  const total = (run.metrics.ms + (transcribe?.ms ?? 0)) / 1000;
  lines.push(`Аналіз: ${run.modelLabel} · ${run.effort} · ${date} · ${total.toFixed(1)} с · $${(run.metrics.usd + (transcribe?.usd ?? 0)).toFixed(3)}`);

  if (e.status !== "ok" && e.commitments.length === 0 && e.openQuestions.length === 0) return lines.join("\n") + "\n";

  const anns = buildAnnotations(e);
  const order: Annotation["kind"][] = ["accepted", "cancelled", "proposed", "question"];
  for (const kind of order) {
    const items = anns.filter((a) => a.kind === kind);
    if (items.length === 0) continue;
    lines.push("", `## ${kind === "question" ? "Відкриті питання" : KIND_LABEL[kind]}`);
    for (const a of items) {
      const c = "status" in a.source ? a.source : null;
      const bits: string[] = [];
      if (c?.owner) bits.push(c.owner);
      if (c?.deadline.text) bits.push(c.deadline.text + (c.deadline.resolvable ? "" : " (дата не визначена)"));
      if (c && c.status === "accepted" && !c.owner) bits.push("без власника");
      const text = kind === "cancelled" ? `~~${a.text}~~` : a.text;
      lines.push(`${a.n}. ${text}${bits.length ? " — " + bits.join(", ") : ""} · ${fmtTime(a.quote.start)}`);
    }
  }
  return lines.join("\n") + "\n";
}
