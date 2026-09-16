"use client";

import { useEffect, useRef } from "react";
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
  onSeek: (sec: number) => void;
  onPick: (a: Annotation) => void;
};

/**
 * Розшифровка з рішеннями на місці: слова цитати підсвічені,
 * після репліки — картка «Прийнято / Скасовано / Не прийнято / Питання».
 * Поточна репліка підсвічується під час відтворення.
 */
export function Transcript({ transcript, annotations, speakerNames, currentTime, activeId, onSeek, onPick }: Props) {
  const map = byTurn(annotations);
  const speakers = Array.from(new Set(transcript.turns.map((t) => t.speaker)));
  const rows = useRef<Map<number, HTMLDivElement>>(new Map());

  const active = annotations.find((a) => a.id === activeId) ?? null;
  useEffect(() => {
    if (!active) return;
    rows.current.get(active.quote.turnIndex)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  return (
    <div className="tr">
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
              <div className="tr-sp">{speakerNames.get(t.speaker) ?? t.speaker}</div>
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
              {anns.map((a) => (
                <button key={a.id} className={`tr-ann ${a.kind} ${activeId === a.id ? "active" : ""}`} onClick={() => onPick(a)}>
                  <span className="tr-ann-k">{a.title}</span>
                  <span className="tr-ann-t">{a.text}</span>
                  {a.meta && <span className="tr-ann-m">{a.meta}</span>}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {transcript.turns.length === 0 && <div className="empty">Розпізнаних слів немає.</div>}
    </div>
  );
}
