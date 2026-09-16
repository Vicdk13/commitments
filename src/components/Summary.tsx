"use client";

import type { Extraction, Turn } from "@/lib/types";
import type { Annotation } from "@/lib/annotations";
import { fmtTime } from "@/lib/format";
import { KindIcon } from "./KindIcon";
import { RichNote } from "./RichNote";

type Props = {
  extraction: Extraction;
  annotations: Annotation[];
  turns: Turn[];
  activeId: string | null;
  playingId: string | null;
  liveId: string | null;
  onPick: (a: Annotation) => void;
  onSeek: (sec: number) => void;
};

/** Компактний підсумок збоку: статус + чотири групи, клік — програти цитату і показати місце в розшифровці. */
export function Summary({ extraction: e, annotations, turns, activeId, playingId, liveId, onPick, onSeek }: Props) {
  const groups: { kind: Annotation["kind"]; title: string; empty: string }[] = [
    { kind: "accepted", title: "Прийнято", empty: "Жодної прийнятої задачі" },
    { kind: "cancelled", title: "Скасовано", empty: "Нічого не скасовували" },
    { kind: "proposed", title: "Не прийнято", empty: "Неприйнятих пропозицій не було" },
    { kind: "question", title: "Відкриті питання", empty: "Відкритих питань не лишилось" },
  ];
  const statusKind = e.status === "ok" ? "ok" : e.status === "no_commitments" ? "none" : "cannot";
  const statusTitle = e.status === "ok" ? "Домовленості зафіксовано" : e.status === "no_commitments" ? "Домовленостей не досягнуто" : "Не можу зробити висновок";

  return (
    <div className="sum">
      <div className={`sum-status ${statusKind}`}>
        <b>{statusTitle}</b>
        <p><RichNote text={e.statusReason} turns={turns} onSeek={onSeek} /></p>
        {e.recordingTruncated && <span className="sum-flag">запис обірваний</span>}
      </div>

      {groups.map((g) => {
        const items = annotations.filter((a) => a.kind === g.kind);
        return (
          <section key={g.kind} className={`sum-group ${g.kind}`}>
            <h3><span className="sum-gk"><KindIcon kind={g.kind} /> {g.title}</span><span>{items.length}</span></h3>
            {items.length === 0 && <div className="sum-empty">{g.empty}</div>}
            {items.map((a, i) => {
              const c = "status" in a.source ? a.source : null;
              const playing = playingId === a.id;
              const owner = c?.owner ?? null;
              const deadlineFlag = a.flags.find((f) => f.kind === "relative-deadline");
              return (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  className={`sum-item ${a.kind} ${activeId === a.id ? "active" : ""} ${playing ? "playing" : ""} ${liveId === a.id ? "live" : ""}`}
                  data-ann={a.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => onPick(a)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(a); } }}
                  aria-label={`${a.n}. ${a.title}: ${a.text}. ${playing ? "Пауза" : "Прослухати цитату"}`}
                >
                  <span className="sum-row">
                    <span className="sum-n">{a.n}</span>
                    <span className="sum-t">{a.text}</span>
                  </span>
                  {(owner || c?.deadline.text || a.flags.length > 0) && (
                    <span className="chips">
                      {owner && <span className="chip">{owner}</span>}
                      {c?.deadline.text && (
                        <span className={`chip ${deadlineFlag ? "warn" : ""}`} title={deadlineFlag?.note ?? undefined}>
                          {deadlineFlag && "⚠ "}{c.deadline.text}
                        </span>
                      )}
                      {a.flags.filter((f) => f.kind !== "relative-deadline").map((f) => (
                        <span key={f.kind} className="chip warn" title={f.note ?? undefined}>⚠ {f.label}</span>
                      ))}
                    </span>
                  )}
                  <span className="sum-qrow">
                    <span className="sum-q">«{a.quote.text}»</span>
                    <span className={`sum-play ${playing ? "on" : ""}`}>{playing ? "⏸" : "▶"} {fmtTime(a.quote.start)}</span>
                  </span>
                  {c?.history && <span className="sum-h"><RichNote text={c.history} turns={turns} onSeek={onSeek} /></span>}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
