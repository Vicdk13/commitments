"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExtractRun, Quote, StageMetrics, Transcript } from "@/lib/types";
import { DEFAULT_MODEL_ID, MODELS, getModel, type Effort } from "@/lib/models";
import { fmtTime } from "@/lib/format";
import { Results } from "@/components/Results";
import { Metrics } from "@/components/Metrics";

type Stage = "idle" | "transcribing" | "extracting" | "done" | "error";

const SAMPLES = [
  { file: "01-main.mp3", label: "Планування релізу (3 хв)" },
  { file: "02-variant.mp3", label: "Наступний день, із сарказмом (2,5 хв)" },
  { file: "03-no-conclusion.mp3", label: "Без домовленостей, обірваний (1 хв)" },
];

const EFFORTS: { id: Effort; label: string }[] = [
  { id: "low", label: "low — швидко" },
  { id: "medium", label: "medium" },
  { id: "high", label: "high — ретельно" },
];

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [transcribeMetrics, setTranscribeMetrics] = useState<StageMetrics | undefined>();
  const [runs, setRuns] = useState<ExtractRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [effort, setEffort] = useState<Effort>(getModel(DEFAULT_MODEL_ID).defaultEffort);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState<Quote | null>(null);
  const stopAt = useRef<number | null>(null);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;

  // ---------- звук ----------
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (stopAt.current !== null && a.currentTime >= stopAt.current) {
        a.pause();
        stopAt.current = null;
        setActive(null);
      }
    };
    const onPause = () => { if (stopAt.current === null) setActive(null); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("pause", onPause);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("pause", onPause); };
  }, [url]);

  const playQuote = useCallback((q: Quote) => {
    const a = audioRef.current;
    if (!a) return;
    if (active === q) { a.pause(); stopAt.current = null; setActive(null); return; }
    a.currentTime = Math.max(0, q.start - 0.15);
    stopAt.current = q.end + 0.25;
    setActive(q);
    void a.play();
  }, [active]);

  const seek = useCallback((sec: number) => {
    const a = audioRef.current;
    if (!a) return;
    stopAt.current = null;
    setActive(null);
    a.currentTime = sec;
    void a.play();
  }, []);

  // ---------- пайплайн ----------
  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    setFile(null); setUrl(null); setDuration(0); setStage("idle"); setError(null);
    setTranscript(null); setTranscribeMetrics(undefined); setRuns([]); setActiveRunId(null); setActive(null);
  };

  const runExtract = useCallback(async (t: Transcript, m: string, e: Effort) => {
    setStage("extracting");
    setError(null);
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: t, model: m, effort: e }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Помилка аналізу"); setStage("error"); return; }
    const run: ExtractRun = {
      id: `${Date.now()}`,
      model: data.model,
      modelLabel: data.modelLabel,
      effort: data.effort,
      extraction: data.extraction,
      metrics: data.metrics,
    };
    setRuns((rs) => [...rs, run]);
    setActiveRunId(run.id);
    setActive(null);
    setStage("done");
  }, []);

  const process = useCallback(async (f: File) => {
    reset();
    const objectUrl = URL.createObjectURL(f);
    setFile(f); setUrl(objectUrl);
    setStage("transcribing");

    const form = new FormData();
    form.append("file", f);
    const res = await fetch("/api/transcribe", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Помилка розпізнавання"); setStage("error"); return; }
    const t: Transcript = data.transcript;
    setTranscript(t);
    setTranscribeMetrics(data.metrics);
    await runExtract(t, modelId, effort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runExtract, modelId, effort]);

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f) void process(f);
  };

  const loadSample = async (name: string) => {
    const r = await fetch(`/samples/${name}`);
    const b = await r.blob();
    void process(new File([b], name, { type: "audio/mpeg" }));
  };

  const onModelChange = (id: string) => {
    setModelId(id);
    setEffort(getModel(id).defaultEffort);
  };

  const copyJson = () => {
    if (!activeRun) return;
    void navigator.clipboard.writeText(JSON.stringify({ ...activeRun, transcribe: transcribeMetrics }, null, 2));
  };

  const busy = stage === "transcribing" || stage === "extracting";
  const spec = getModel(modelId);

  return (
    <main className="wrap">
      <header className="top">
        <div>
          <h1>Домовленості з запису</h1>
          <p>Завантажте запис робочої розмови двох людей — отримаєте фінальні задачі, власників, дедлайни й відкриті питання з цитатами.</p>
        </div>
        <div className="meta">до 3 хв · 2 спікери · одна мова</div>
      </header>

      <div className="controls">
        <label>
          <span>Модель</span>
          <select value={modelId} onChange={(e) => onModelChange(e.target.value)} disabled={busy}>
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label>
          <span>Effort</span>
          <select value={effort} onChange={(e) => setEffort(e.target.value as Effort)} disabled={busy || !spec.supportsEffort}>
            {EFFORTS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </label>
        <div className="model-note">{spec.note} · ${spec.inputUsdPerMTok} / ${spec.outputUsdPerMTok} за 1M токенів</div>
        {transcript && !busy && (
          <button className="rerun" onClick={() => void runExtract(transcript, modelId, effort)}>
            Проаналізувати цією моделлю
          </button>
        )}
      </div>

      {!file && (
        <label
          className={`drop ${over ? "over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(e.dataTransfer.files); }}
        >
          <input type="file" accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm" onChange={(e) => onFiles(e.target.files)} />
          <span className="cta">Вибрати аудіофайл</span>
          <div className="hint">або перетягніть сюди · mp3, m4a, wav, ogg · до 3 хвилин</div>
          <div className="samples">
            Немає запису під рукою? Спробуйте тестовий — він обробиться так само, як ваш:
            <br />
            {SAMPLES.map((s) => (
              <button key={s.file} type="button" onClick={(e) => { e.preventDefault(); void loadSample(s.file); }}>{s.label}</button>
            ))}
          </div>
        </label>
      )}

      {file && (
        <div className="filebar">
          <div>
            <div className="name">{file.name}</div>
            <div className="dur">{duration ? fmtTime(duration) : "…"}{transcript ? ` · ${transcript.turns.length} реплік · ${transcript.language}` : ""}</div>
          </div>
          <audio ref={audioRef} src={url ?? undefined} controls preload="metadata" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />
          <button className="reset" onClick={reset}>Інший файл</button>
        </div>
      )}

      {file && (
        <div className="steps">
          <Step
            state={stage === "transcribing" ? "running" : transcript ? "done" : stage === "error" && !transcript ? "error" : "idle"}
            label="Розпізнавання"
            sub={transcribeMetrics ? `${(transcribeMetrics.ms / 1000).toFixed(1)} с` : stage === "transcribing" ? "ElevenLabs Scribe…" : ""}
          />
          <Step
            state={stage === "extracting" ? "running" : activeRun ? "done" : stage === "error" && transcript ? "error" : "idle"}
            label="Аналіз домовленостей"
            sub={stage === "extracting" ? `${spec.label} читає розшифровку…` : activeRun ? `${activeRun.modelLabel} · ${(activeRun.metrics.ms / 1000).toFixed(1)} с` : ""}
          />
        </div>
      )}

      {error && (
        <div className="error">
          {error}
          {transcript && <> · <button className="reset" onClick={() => void runExtract(transcript, modelId, effort)}>Повторити аналіз</button></>}
        </div>
      )}

      {activeRun && (
        <>
          <div className="actions">
            <button onClick={copyJson}>Скопіювати JSON</button>
          </div>
          <Results extraction={activeRun.extraction} activeQuote={active} onPlay={playQuote} />
        </>
      )}

      {transcript && (
        <details className="transcript">
          <summary>Розшифровка <span>{transcript.turns.length} реплік · натисніть час, щоб перейти</span></summary>
          <div className="turns">
            {transcript.turns.map((t) => {
              const name = activeRun?.extraction.speakers.find((s) => s.label === t.speaker)?.name ?? t.speaker;
              const hl = active?.turnIndex === t.index;
              return (
                <div key={t.index} className={`turn ${hl ? "hl" : ""}`}>
                  <span className="t" onClick={() => seek(t.start)}>{fmtTime(t.start)}</span>
                  <span className="s">{name}</span>
                  <span className="x">{t.text}</span>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {(transcribeMetrics || runs.length > 0) && (
        <Metrics
          transcribe={transcribeMetrics}
          audioMinutes={transcript ? transcript.durationSec / 60 : 0}
          runs={runs}
          activeRunId={activeRunId}
          onSelectRun={(id) => { setActiveRunId(id); setActive(null); }}
        />
      )}
    </main>
  );
}

function Step({ state, label, sub }: { state: "idle" | "running" | "done" | "error"; label: string; sub: string }) {
  return (
    <div className={`step ${state}`}>
      <span className="dot" />
      <div>
        <div className="label">{label}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
    </div>
  );
}
