import type { Commitment, Extraction, OpenQuestion, Quote } from "./types";

/** Одна позначка на доріжці / у розшифровці: рішення або питання, прив'язане до репліки. */
export type Annotation = {
  id: string;
  kind: "accepted" | "cancelled" | "proposed" | "question";
  title: string;      // «Прийнято», «Скасовано» …
  text: string;       // сама задача або питання
  meta: string | null; // «Дмитро · до п'ятниці»
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
    else if (c.status === "accepted") parts.push("без власника");
    if (c.deadline.text) parts.push(c.deadline.text);
    out.push({ id: c.id, kind, title: KIND_LABEL[kind], text: c.task, meta: parts.length ? parts.join(" · ") : null, quote: c.quote, source: c });
  }
  for (const q of e.openQuestions) {
    out.push({ id: q.id, kind: "question", title: KIND_LABEL.question, text: q.question, meta: null, quote: q.quote, source: q });
  }
  return out.sort((a, b) => a.quote.start - b.quote.start);
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
