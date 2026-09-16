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
  liveId: string | null;     // рішення, цитата якого звучить зараз
  playing: boolean;
  follow: boolean;           // авто-прокрутка до репліки, що звучить
  stickyOffset?: number; // висота липкого файл-бару на вузьких екранах (UI-08)
  onSeek: (sec: number) => void;
  onPick: (a: Annotation) => void;
};

/**
 * Розшифровка з рішеннями на місці: слова цитати підсвічені,
 * після репліки — картка «Прийнято / Скасовано / Не прийнято / Питання».
 * Поточна репліка підсвічується під час відтворення.
 */
export function Transcript({ transcript, annotations, speakerNames, currentTime, activeId, playingId, liveId, playing, follow, stickyOffset = 80, onSeek, onPick }: Props) {
  const map = byTurn(annotations);
  const speakers = Array.from(new Set(transcript.turns.map((t) => t.speaker)));
  const rows = useRef<Map<number, HTMLDivElement>>(new Map());
  const box = useRef<HTMLDivElement>(null);
  const userScrolledAt = useRef(0);     // коли користувач сам крутив контейнер
  const programmatic = useRef(0);       // до цього часу події scroll — наші, не користувача

  const scrollToTurn = (idx: number, smooth = true) => {
    const c = box.current, el = rows.current.get(idx);
    if (!c || !el) return;
    programmatic.current = Date.now() + 800;
    if (c.scrollHeight > c.clientHeight + 4) {
      c.scrollTo({ top: el.offsetTop - (c.clientHeight - el.offsetHeight) / 2, behavior: smooth ? "smooth" : "auto" });
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY - stickyOffset - 16;
      window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
    }
  };

  // авто-прокрутка до репліки, що звучить — якщо користувач не крутив останні 3 с
  const currentTurn = transcript.turns.find((t) => currentTime >= t.start && currentTime < t.end)?.index ?? -1;
  useEffect(() => {
    if (!follow || !playing || currentTurn < 0) return;
    if (Date.now() - userScrolledAt.current < 3000) return;
    scrollToTurn(currentTurn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, follow, playing]);

  // UI-08: клік по пункту — прокрутка до репліки (контейнер або вікно, без стрибка сторінки)
  const active = annotations.find((a) => a.id === activeId) ?? null;
  useEffect(() => {
    if (!active) return;
    userScrolledAt.current = 0;
    scrollToTurn(active.quote.turnIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const onScroll = () => {
    if (Date.now() < programmatic.current) return;
    userScrolledAt.current = Date.now();
  };

  return (
    <div className="tr" ref={box} onScroll={onScroll} onWheel={onScroll} onTouchMove={onScroll}>
      {transcript.turns.map((t) => {
        const anns = map.get(t.index) ?? [];
        const playing = currentTime >= t.start && currentTime < t.end;
        const spIdx = speakers.indexOf(t.speaker);
        const ranges = anns.map((a) => a.quote);
        return (
          <div
            key={t.index}
            className={`tr-turn sp${spIdx} ${playing ? "playing" : ""} ${anns.length ? "has" : ""} ${anns.some((a) => a.id === liveId) ? "live" : ""}`}
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
                  <button key={a.id} className={`tr-ann ${a.kind} ${activeId === a.id ? "active" : ""} ${playing ? "playing" : ""} ${liveId === a.id ? "live" : ""}`} onClick={() => onPick(a)}
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
