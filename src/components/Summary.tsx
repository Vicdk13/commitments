"use client";

import type { Extraction } from "@/lib/types";
import type { Annotation } from "@/lib/annotations";
import { fmtTime } from "@/lib/format";

type Props = {
  extraction: Extraction;
  annotations: Annotation[];
  activeId: string | null;
  onPick: (a: Annotation) => void;
};

/** Компактний підсумок збоку: статус + чотири групи, клік — програти цитату і показати місце в розшифровці. */
export function Summary({ extraction: e, annotations, activeId, onPick }: Props) {
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
        <p>{e.statusReason}</p>
        {e.recordingTruncated && <span className="sum-flag">запис обірваний</span>}
      </div>

      {groups.map((g) => {
        const items = annotations.filter((a) => a.kind === g.kind);
        return (
          <section key={g.kind} className={`sum-group ${g.kind}`}>
            <h3>{g.title} <span>{items.length}</span></h3>
            {items.length === 0 && <div className="sum-empty">{g.empty}</div>}
            {items.map((a, i) => {
              const c = "status" in a.source ? a.source : null;
              return (
                <button
                  key={a.id}
                  className={`sum-item ${a.kind} ${activeId === a.id ? "active" : ""}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => onPick(a)}
                >
                  <span className="sum-t">{a.text}</span>
                  <span className="sum-m">
                    {a.meta && <>{a.meta} · </>}
                    {fmtTime(a.quote.start)}
                    {c && !c.deadline.resolvable && c.deadline.text && <> · <i>дата не визначена</i></>}
                    {c && c.confidence !== "high" && <> · <i>впевненість {c.confidence === "medium" ? "середня" : "низька"}</i></>}
                  </span>
                  {c?.history && <span className="sum-h">{c.history}</span>}
                  {c?.ownerNote && !c.owner && <span className="sum-h">{c.ownerNote}</span>}
                </button>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
