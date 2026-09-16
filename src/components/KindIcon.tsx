import type { Annotation } from "@/lib/annotations";

/** Іконка виду рішення — доповнює колір (UI-03). currentColor, aria-hidden. */
export function KindIcon({ kind, size = 12 }: { kind: Annotation["kind"]; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (kind) {
    case "accepted":
      return <svg {...common}><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>;
    case "cancelled":
      return <svg {...common}><path d="M3 3l6 6M9 3l-6 6" /></svg>;
    case "proposed":
      return <svg {...common}><path d="M2.5 6h7" /></svg>;
    case "question":
      return <svg {...common}><path d="M4 4.3a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.5" /><circle cx="6" cy="9.6" r=".6" fill="currentColor" stroke="none" /></svg>;
  }
}
