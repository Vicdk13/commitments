"use client";

import type { Metrics as M } from "@/lib/types";
import { PRICING } from "@/lib/pricing";
import { fmtMs, fmtUsd } from "@/lib/format";

export function Metrics({ m }: { m: M }) {
  const totalMs = (m.transcribe?.ms ?? 0) + (m.extract?.ms ?? 0);
  const totalUsd = (m.transcribe?.usd ?? 0) + (m.extract?.usd ?? 0);
  const perMin = m.audioMinutes > 0 ? totalUsd / m.audioMinutes : 0;

  return (
    <div className="metrics">
      <h3>Час і вартість цього запуску</h3>
      <table>
        <tbody>
          {m.transcribe && (
            <tr>
              <td>Розпізнавання</td>
              <td>{m.transcribe.detail}</td>
              <td className="num">{fmtMs(m.transcribe.ms)}</td>
              <td className="num">{fmtUsd(m.transcribe.usd)}</td>
            </tr>
          )}
          {m.extract && (
            <tr>
              <td>Аналіз</td>
              <td>{m.extract.detail}<br /><small>{m.extract.inputTokens} вх. / {m.extract.outputTokens} вих. токенів</small></td>
              <td className="num">{fmtMs(m.extract.ms)}</td>
              <td className="num">{fmtUsd(m.extract.usd)}</td>
            </tr>
          )}
          <tr className="total">
            <td>Разом</td>
            <td>{m.audioMinutes.toFixed(1)} хв аудіо → {fmtUsd(perMin, 3)} за хвилину</td>
            <td className="num">{fmtMs(totalMs)}</td>
            <td className="num">{fmtUsd(totalUsd)}</td>
          </tr>
        </tbody>
      </table>
      <p className="fine">
        Ціни: Scribe ${PRICING.scribeUsdPerHour}/год аудіо; {PRICING.claude.model} ${PRICING.claude.inputUsdPerMTok} / ${PRICING.claude.outputUsdPerMTok} за 1M вхідних / вихідних токенів
        (зокрема токени мислення). Час — від запиту до відповіді, з мережею. Хостинг (Vercel) не входить і рахується окремо.
        Повторні спроби не відбувались, якщо не вказано.
      </p>
    </div>
  );
}
