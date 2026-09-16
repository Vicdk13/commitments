"use client";

import type { Turn } from "@/lib/types";
import { fmtTime } from "@/lib/format";

type Props = { text: string; turns: Turn[]; onSeek: (sec: number) => void };

const TIME_RE = /\b(\d{1,2}):(\d{2})\b/g;
const TURN_RE = /\bturn[\s_-]?(\d+)\b/gi;

/**
 * Текст примітки моделі з клікабельними посиланнями на час (UI-07):
 * «(0:12)» → перемотка; страхувальна заміна «turn 3» → час початку репліки 3.
 */
export function RichNote({ text, turns, onSeek }: Props) {
  // 1) turn N → m:ss
  const normalized = text.replace(TURN_RE, (m, n) => {
    const t = turns[Number(n)];
    return t ? fmtTime(t.start) : m;
  });
  // 2) m:ss → кнопки
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of normalized.matchAll(TIME_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(normalized.slice(last, idx));
    const sec = Number(m[1]) * 60 + Number(m[2]);
    parts.push(
      <button
        key={idx}
        type="button"
        className="t-ref"
        onClick={(e) => { e.stopPropagation(); onSeek(sec); }}
        title="Перемотати сюди"
      >
        {m[0]}
      </button>,
    );
    last = idx + m[0].length;
  }
  if (last < normalized.length) parts.push(normalized.slice(last));
  return <>{parts}</>;
}
