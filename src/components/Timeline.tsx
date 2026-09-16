"use client";

import { useRef, useState } from "react";
import type { Transcript } from "@/lib/types";
import type { Annotation } from "@/lib/annotations";
import { fmtTime } from "@/lib/format";
import { KindIcon } from "./KindIcon";

type Props = {
  transcript: Transcript;
  annotations: Annotation[];
  speakerNames: Map<string, string>;
  currentTime: number;
  activeId: string | null;
  onSeek: (sec: number) => void;
  onPick: (a: Annotation) => void;
};

/**
 * Доріжка запису: дві смуги (по спікеру), репліки як сегменти,
 * над ними — маркери рішень; курсор відтворення; клік по смузі — перемотка.
 */
export function Timeline({ transcript, annotations, speakerNames, currentTime, activeId, onSeek, onPick }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Annotation | null>(null);
  const dur = Math.max(transcript.durationSec, 1);
  const pct = (s: number) => `${Math.min(100, Math.max(0, (s / dur) * 100))}%`;

  const speakers = Array.from(new Set(transcript.turns.map((t) => t.speaker)));
  const lane = (sp: string) => speakers.indexOf(sp);

  const seekAt = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const x = (e.clientX - box.left) / box.width;
    onSeek(x * dur);
  };

  // сітка часу: кожні 30 с, або 15 с для коротких
  const step = dur > 120 ? 30 : 15;
  const ticks: number[] = [];
  for (let t = 0; t < dur; t += step) ticks.push(t);

  return (
    <div className="tl">
      <div className="tl-head">
        <div className="tl-legend">
          {speakers.map((sp, i) => (
            <span key={sp} className={`tl-sp sp${i}`}><i />{speakerNames.get(sp) ?? sp}</span>
          ))}
        </div>
        <div className="tl-legend">
          <span className="tl-k accepted"><KindIcon kind="accepted" />прийнято</span>
          <span className="tl-k cancelled"><KindIcon kind="cancelled" />скасовано</span>
          <span className="tl-k proposed"><KindIcon kind="proposed" />не прийнято</span>
          <span className="tl-k question"><KindIcon kind="question" />питання</span>
        </div>
      </div>

      {/* маркери рішень */}
      <div className="tl-markers">
        {annotations.map((a) => (
          <button
            key={a.id}
            className={`tl-m ${a.kind} ${activeId === a.id ? "active" : ""}`}
            style={{ left: pct(a.quote.start) }}
            onClick={() => onPick(a)}
            onMouseEnter={() => setHover(a)}
            onMouseLeave={() => setHover(null)}
            aria-label={`${a.n}. ${a.title}: ${a.text}`}
          >
            <span className="tl-m-dot">{a.n}</span>
          </button>
        ))}
        {hover && (
          <div className={`tl-tip ${hover.kind} ${edgeClass(hover.quote.start / dur, 0.15)}`} style={{ left: pct(hover.quote.start) }}>
            <b><KindIcon kind={hover.kind} /> #{hover.n} {hover.title}</b> · {fmtTime(hover.quote.start)}
            <div>{hover.text}</div>
            {hover.meta && <small>{hover.meta}</small>}
          </div>
        )}
      </div>

      {/* смуги реплік */}
      <div className="tl-track" ref={ref} onClick={seekAt}>
        {ticks.map((t) => (
          <span key={t} className="tl-tick" style={{ left: pct(t) }}><em>{fmtTime(t)}</em></span>
        ))}
        {speakers.map((sp, i) => (
          <div key={sp} className={`tl-lane sp${i}`}>
            {transcript.turns.filter((t) => t.speaker === sp).map((t) => {
              const has = annotations.some((a) => a.quote.turnIndex === t.index);
              const playing = currentTime >= t.start && currentTime < t.end;
              return (
                <span
                  key={t.index}
                  className={`tl-seg ${has ? "has" : ""} ${playing ? "playing" : ""}`}
                  style={{ left: pct(t.start), width: `calc(${pct(t.end - t.start)} - 1px)` }}
                  title={`${speakerNames.get(sp) ?? sp} · ${fmtTime(t.start)}`}
                />
              );
            })}
          </div>
        ))}
        {/* сегменти цитат (підсвітка точного фрагмента) */}
        <div className="tl-quotes">
          {annotations.map((a) => (
            <span
              key={a.id}
              className={`tl-q ${a.kind} ${activeId === a.id ? "active" : ""}`}
              style={{ left: pct(a.quote.start), width: pct(Math.max(0.6, a.quote.end - a.quote.start)), top: `${lane(transcript.turns[a.quote.turnIndex]?.speaker ?? speakers[0]) * 50}%` }}
            />
          ))}
        </div>
        <div className={`tl-cursor ${edgeClass(currentTime / dur, 0.04)}`} style={{ left: pct(currentTime) }}>
          <em>{fmtTime(currentTime)}</em>
        </div>
      </div>
    </div>
  );
}

/** UI-12: підпис курсора/тултіпа біля країв не має вилазити за панель. */
function edgeClass(ratio: number, threshold: number): string {
  if (ratio < threshold) return "edge-l";
  if (ratio > 1 - threshold) return "edge-r";
  return "";
}
