"use client";

import { useEffect, useRef } from "react";
import { KindIcon } from "./KindIcon";
import type { Transcript as T } from "@/lib/types";
import type { Annotation } from "@/lib/annotations";
import { byTurn } from "@/lib/annotations";
import { fmtTime } from "@/lib/format";

type Props = {
  transcript: T;
  annotations: Annotation[];
  speakerNames: Map<string, string>;
  currentTime: number;
  activeId: string | null;
  playingId: string | null;
  stickyOffset?: number; // висота липкого файл-бару на вузьких екранах (UI-08)
  onSeek: (sec: number) => void;
  onPick: (a: Annotation) => void;
};

/**
 * Розшифровка з рішеннями на місці: слова цитати підсвічені,
 * після репліки — картка «Прийнято / Скасовано / Не прийнято / Питання».
 * Поточна репліка підсвічується під час відтворення.
 */
export function Transcript({ transcript, annotations, speakerNames, currentTime, activeId, playingId, stickyOffset = 80, onSeek, onPick }: Props) {
  const map = byTurn(annotations);
  const speakers = Array.from(new Set(transcript.turns.map((t) => t.speaker)));
  const rows = useRef<Map<number, HTMLDivElement>>(new Map());
  const box = useRef<HTMLDivElement>(null);

  // UI-08: прокручуємо контейнер, якщо він скролиться; інакше — вікно з поправкою на sticky, без стрибка сторінки
  const active = annotations.find((a) => a.id === activeId) ?? null;
  useEffect(() => {
    if (!active) return;
    const c = box.current, el = rows.current.get(active.quote.turnIndex);
    if (!c || !el) return;
    if (c.scrollHeight > c.clientHeight + 4) {
      c.scrollTo({ top: el.offsetTop - (c.clientHeight - el.offsetHeight) / 2, behavior: "smooth" });
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY - stickyOffset - 16;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [active, stickyOffset]);

  return (
    <div className="tr" ref={box}>
      {transcript.turns.map((t) => {
        const anns = map.get(t.index) ?? [];
        const playing = currentTime >= t.start && currentTime < t.end;
        const spIdx = speakers.indexOf(t.speaker);
        const ranges = anns.map((a) => a.quote);
        return (
          <div
            key={t.index}
            className={`tr-turn sp${spIdx} ${playing ? "playing" : ""} ${anns.length ? "has" : ""}`}
            ref={(el) => { if (el) rows.current.set(t.index, el); }}
          >
            <button className="tr-time" onClick={() => onSeek(t.start)} title="Перейти сюди">{fmtTime(t.start)}</button>
            <div className="tr-body">
              <div className="tr-sp">{speakerNames.get(t.speaker) ?? `Голос ${spIdx + 1}`}</div>
              <p className="tr-text">
                {t.words.map((w, i) => {
                  const inQuote = ranges.some((q) => w.start >= q.start - 0.05 && w.end <= q.end + 0.05);
                  const said = playing && w.start <= currentTime;
                  const isActiveQuote = active && active.quote.turnIndex === t.index && w.start >= active.quote.start - 0.05 && w.end <= active.quote.end + 0.05;
                  return (
                    <span key={i} className={`w ${inQuote ? "q" : ""} ${isActiveQuote ? "qa" : ""} ${said ? "said" : ""}`}>
                      {w.text}{i < t.words.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </p>
              {anns.map((a) => {
                const playing = playingId === a.id;
                return (
                  <button key={a.id} className={`tr-ann ${a.kind} ${activeId === a.id ? "active" : ""} ${playing ? "playing" : ""}`} onClick={() => onPick(a)}
                    aria-label={`${a.n}. ${a.title}: ${a.text}. ${playing ? "Пауза" : "Прослухати цитату"}`}>
                    <span className="tr-ann-k"><KindIcon kind={a.kind} /> {a.n} · {a.title}</span>
                    <span className="tr-ann-t">{a.text}</span>
                    <span className={`sum-play ${playing ? "on" : ""}`}>{playing ? "⏸" : "▶"} {fmtTime(a.quote.start)}</span>
                    {(a.meta || a.flags.length > 0) && (
                      <span className="tr-ann-m">
                        {a.meta}
                        {a.flags.map((f) => (
                          <span key={f.kind} className="chip warn" title={f.note ?? undefined}>⚠ {f.label}{f.note ? ` — ${f.note}` : ""}</span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {transcript.turns.length === 0 && <div className="empty">Розпізнаних слів немає.</div>}
    </div>
  );
}
