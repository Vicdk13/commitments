"use client";

import type { ExtractRun, StageMetrics } from "@/lib/types";
import { MODELS } from "@/lib/models";
import { SCRIBE_USD_PER_HOUR } from "@/lib/pricing";
import { fmtMs, fmtUsd } from "@/lib/format";

type Props = {
  transcribe?: StageMetrics;
  audioMinutes: number;
  runs: ExtractRun[];
  activeRunId: string | null;
  onSelectRun: (id: string) => void;
};

export function Metrics({ transcribe, audioMinutes, runs, activeRunId, onSelectRun }: Props) {
  const sttUsd = transcribe?.usd ?? 0;
  const sttMs = transcribe?.ms ?? 0;

  return (
    <div className="metrics">
      <h3>Час і вартість</h3>
      <table>
        <tbody>
          {transcribe && (
            <tr>
              <td>Розпізнавання</td>
              <td>{transcribe.detail}</td>
              <td className="num">{fmtMs(transcribe.ms)}</td>
              <td className="num">{fmtUsd(transcribe.usd)}</td>
            </tr>
          )}
          {runs.map((r, i) => {
            const total = sttUsd + r.metrics.usd;
            const perMin = audioMinutes > 0 ? total / audioMinutes : 0;
            const active = r.id === activeRunId;
            return (
              <tr key={r.id} className={`run ${active ? "active" : ""}`} onClick={() => onSelectRun(r.id)} title="Показати результат цього прогону">
                <td>Аналіз #{i + 1}{active && <span className="now"> · показано</span>}</td>
                <td>
                  {r.modelLabel} · effort {r.effort}
                  <br /><small>{r.metrics.inputTokens} вх. / {r.metrics.outputTokens} вих. токенів · разом із розпізнаванням {fmtUsd(total)} = {fmtUsd(perMin, 3)}/хв</small>
                </td>
                <td className="num">{fmtMs(r.metrics.ms)}<br /><small>{fmtMs(sttMs + r.metrics.ms)} разом</small></td>
                <td className="num">{fmtUsd(r.metrics.usd)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="fine">
        Ціни: Scribe ${SCRIBE_USD_PER_HOUR}/год аудіо; {MODELS.map((m) => `${m.label} $${m.inputUsdPerMTok} / $${m.outputUsdPerMTok}`).join("; ")} за 1M вхідних / вихідних токенів
        (зокрема токени мислення). Час — від запиту до відповіді, з мережею. Хостинг (Vercel) не входить і рахується окремо.
        Повторні спроби не відбувались, якщо не вказано.
      </p>
    </div>
  );
}
