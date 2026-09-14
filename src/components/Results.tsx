"use client";

import type { Commitment, Extraction, OpenQuestion, Quote } from "@/lib/types";
import { fmtTime } from "@/lib/format";

type Props = {
  extraction: Extraction;
  activeQuote: Quote | null;
  onPlay: (q: Quote) => void;
};

export function Results({ extraction, activeQuote, onPlay }: Props) {
  const accepted = extraction.commitments.filter((c) => c.status === "accepted");
  const cancelled = extraction.commitments.filter((c) => c.status === "cancelled");
  const proposed = extraction.commitments.filter((c) => c.status === "proposed_not_accepted");

  return (
    <>
      <StatusBanner extraction={extraction} />

      <Group title="Прийняті задачі" count={accepted.length} empty="Жодної прийнятої задачі.">
        {accepted.map((c) => <CommitmentCard key={c.id} c={c} activeQuote={activeQuote} onPlay={onPlay} />)}
      </Group>

      <Group title="Скасовані" count={cancelled.length} empty="Нічого не скасовували.">
        {cancelled.map((c) => <CommitmentCard key={c.id} c={c} activeQuote={activeQuote} onPlay={onPlay} />)}
      </Group>

      <Group title="Пропозиції, які не прийняли" count={proposed.length} empty="Неприйнятих пропозицій не було.">
        {proposed.map((c) => <CommitmentCard key={c.id} c={c} activeQuote={activeQuote} onPlay={onPlay} />)}
      </Group>

      <Group title="Відкриті питання" count={extraction.openQuestions.length} empty="Відкритих питань не лишилось.">
        {extraction.openQuestions.map((q) => <QuestionCard key={q.id} q={q} activeQuote={activeQuote} onPlay={onPlay} />)}
      </Group>
    </>
  );
}

function StatusBanner({ extraction: e }: { extraction: Extraction }) {
  const kind = e.status === "ok" ? "ok" : e.status === "no_commitments" ? "none" : "cannot";
  const title =
    e.status === "ok" ? "Домовленості зафіксовано" :
    e.status === "no_commitments" ? "Домовленостей не досягнуто" :
    "Не можу зробити висновок";
  const speakers = e.speakers.map((s) => s.name ?? s.label).join(" і ");
  return (
    <div className={`status ${kind}`}>
      <div>
        <strong>{title}</strong>
        <span>{e.statusReason}{speakers ? ` Спікери: ${speakers}.` : ""}</span>
      </div>
      {e.recordingTruncated && <div className="flag">запис обірваний</div>}
    </div>
  );
}

function Group({ title, count, empty, children }: { title: string; count: number; empty: string; children: React.ReactNode }) {
  return (
    <section className="group">
      <h2>{title} <span className="count">{count}</span></h2>
      {count === 0 ? <div className="empty">{empty}</div> : children}
    </section>
  );
}

function CommitmentCard({ c, activeQuote, onPlay }: { c: Commitment; activeQuote: Quote | null; onPlay: (q: Quote) => void }) {
  const cls = c.status === "cancelled" ? "cancelled" : c.status === "proposed_not_accepted" ? "proposed" : "";
  return (
    <article className={`card ${cls}`}>
      <p className="task">{c.task}</p>
      <div className="chips">
        {c.owner
          ? <span className="chip owner">{c.owner}</span>
          : c.status === "accepted" && <span className="chip noowner">без власника</span>}
        {c.deadline.text && (
          <span className={`chip ${c.deadline.resolvable ? "deadline" : "unresolved"}`}>
            {c.deadline.text}{!c.deadline.resolvable && " · дата не визначена"}
          </span>
        )}
        {c.confidence !== "high" && <span className="chip low">впевненість: {c.confidence === "medium" ? "середня" : "низька"}</span>}
      </div>
      {c.ownerNote && <p className="note">{c.ownerNote}</p>}
      {c.deadline.note && !c.deadline.resolvable && <p className="note">{c.deadline.note}</p>}
      {c.history && <p className="history"><b>Як дійшли:</b> {c.history}</p>}
      <QuoteRow q={c.quote} active={activeQuote === c.quote} onPlay={onPlay} />
    </article>
  );
}

function QuestionCard({ q, activeQuote, onPlay }: { q: OpenQuestion; activeQuote: Quote | null; onPlay: (q: Quote) => void }) {
  return (
    <article className="card">
      <p className="task">{q.question}</p>
      <QuoteRow q={q.quote} active={activeQuote === q.quote} onPlay={onPlay} />
    </article>
  );
}

function QuoteRow({ q, active, onPlay }: { q: Quote; active: boolean; onPlay: (q: Quote) => void }) {
  return (
    <div className="quote">
      <button className={`play ${active ? "active" : ""}`} onClick={() => onPlay(q)} aria-label="Прослухати фрагмент" title="Прослухати фрагмент">
        {active ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="body">
        <p className="text">«{q.text}»</p>
        <div className="who"><b>{q.speaker}</b> · {fmtTime(q.start)}–{fmtTime(q.end)}</div>
      </div>
    </div>
  );
}

const PlayIcon = () => (
  <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" aria-hidden><path d="M1 1.2v9.6c0 .6.6.9 1.1.6l7.6-4.8c.4-.3.4-.9 0-1.2L2.1.6C1.6.3 1 .6 1 1.2z"/></svg>
);
const PauseIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden><rect x="1" y="1" width="3" height="10" rx=".8"/><rect x="6" y="1" width="3" height="10" rx=".8"/></svg>
);
