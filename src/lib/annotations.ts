import type { Commitment, Extraction, OpenQuestion, Quote } from "./types";

/** Попередження до пункту — показується чіпом (UI-10). */
export type Flag = {
  kind: "no-owner" | "relative-deadline" | "low-confidence";
  label: string;
  note?: string | null;
};

/** Одна позначка на доріжці / у розшифровці: рішення або питання, прив'язане до репліки. */
export type Annotation = {
  id: string;
  n: number;          // порядковий номер за часом цитати, з 1 (UI-04)
  kind: "accepted" | "cancelled" | "proposed" | "question";
  title: string;      // «Прийнято», «Скасовано» …
  text: string;       // сама задача або питання
  meta: string | null; // «Дмитро · до п'ятниці» — для тултіпа й картки в розшифровці
  flags: Flag[];      // попередження для чіпів (UI-10)
  quote: Quote;
  source: Commitment | OpenQuestion;
};

export const KIND_LABEL: Record<Annotation["kind"], string> = {
  accepted: "Прийнято",
  cancelled: "Скасовано",
  proposed: "Не прийнято",
  question: "Відкрите питання",
};

export function buildAnnotations(e: Extraction): Annotation[] {
  const out: Annotation[] = [];
  for (const c of e.commitments) {
    const kind = c.status === "accepted" ? "accepted" : c.status === "cancelled" ? "cancelled" : "proposed";
    const parts: string[] = [];
    if (c.owner) parts.push(c.owner);
    if (c.deadline.text) parts.push(c.deadline.text);
    const flags: Flag[] = [];
    if (c.status === "accepted" && !c.owner) flags.push({ kind: "no-owner", label: "без власника", note: c.ownerNote });
    if (c.deadline.text && !c.deadline.resolvable) flags.push({ kind: "relative-deadline", label: "дата не визначена", note: c.deadline.note });
    if (c.confidence !== "high") flags.push({ kind: "low-confidence", label: c.confidence === "medium" ? "впевненість середня" : "впевненість низька" });
    out.push({ id: c.id, n: 0, kind, title: KIND_LABEL[kind], text: c.task, meta: parts.length ? parts.join(" · ") : null, flags, quote: c.quote, source: c });
  }
  for (const q of e.openQuestions) {
    out.push({ id: q.id, n: 0, kind: "question", title: KIND_LABEL.question, text: q.question, meta: null, flags: [], quote: q.quote, source: q });
  }
  out.sort((a, b) => a.quote.start - b.quote.start);
  out.forEach((a, i) => { a.n = i + 1; });
  return out;
}

/** Групування позначок за номером репліки — для вставки в розшифровку. */
export function byTurn(annotations: Annotation[]): Map<number, Annotation[]> {
  const m = new Map<number, Annotation[]>();
  for (const a of annotations) {
    const list = m.get(a.quote.turnIndex) ?? [];
    list.push(a);
    m.set(a.quote.turnIndex, list);
  }
  return m;
}
