"use client";

import { useEffect, useState } from "react";

type Props = {
  stage: "transcribing" | "extracting";
  elapsed: number;      // с від початку поточного етапу
  durationSec: number;  // тривалість запису, для оцінки часу розпізнавання
  modelLabel: string;
  sttMs?: number;       // якщо розпізнавання вже завершене — показуємо його час
};

// Фрази, що ротуються під час очікування. Не випадкові — описують, що реально відбувається.
const PHRASES: Record<Props["stage"], string[]> = {
  transcribing: [
    "Слухаємо запис…",
    "Розрізняємо, хто говорить…",
    "Ставимо таймкод на кожне слово…",
    "Розбиваємо на репліки…",
  ],
  extracting: [
    "Читаємо розшифровку…",
    "Шукаємо, хто що пообіцяв…",
    "Відрізняємо «зробимо» від «можна було б»…",
    "Перевіряємо, чи не переграли дедлайн…",
    "Виловлюємо сарказм…",
    "Викреслюємо скасоване…",
    "Збираємо відкриті питання…",
    "Прив'язуємо цитати до секунд…",
    "Ще раз перечитуємо, щоб нічого не вигадати…",
  ],
};

// Орієнтовна тривалість етапу: розпізнавання ≈ 1/20 довжини запису + 2 с, аналіз ≈ 28 с (Opus) — з вимірів.
function estimate(stage: Props["stage"], durationSec: number, modelLabel: string): number {
  if (stage === "transcribing") return Math.max(4, durationSec / 20 + 2);
  return modelLabel.includes("Sonnet") ? 18 : 28;
}

export function Progress({ stage, elapsed, durationSec, modelLabel, sttMs }: Props) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const id = setInterval(() => setI((x) => x + 1), 2600);
    return () => clearInterval(id);
  }, [stage]);

  const est = estimate(stage, durationSec, modelLabel);
  // не доходимо до 100%, поки етап не завершений; після оцінки повзе повільно
  const raw = elapsed / est;
  const pct = raw < 1 ? raw * 88 : 88 + Math.min(9, (raw - 1) * 6);
  const phrases = PHRASES[stage];
  const phrase = phrases[i % phrases.length];
  const stageNo = stage === "transcribing" ? 1 : 2;

  return (
    <div className="progress" role="status" aria-live="polite">
      <div className="progress-head">
        <span className="progress-stage">
          <b>{stageNo}/2</b> {stage === "transcribing" ? "Розпізнавання" : `Аналіз · ${modelLabel}`}
          {stage === "extracting" && sttMs !== undefined && <small> · розпізнано за {(sttMs / 1000).toFixed(1)} с</small>}
        </span>
        <span className="progress-time">{elapsed.toFixed(0)} с <small>· зазвичай ≈{Math.round(est)} с</small></span>
      </div>
      <div className="progress-bar"><span style={{ width: `${pct}%` }} /></div>
      <div className="progress-phrase" key={i}>{phrase}</div>
    </div>
  );
}
