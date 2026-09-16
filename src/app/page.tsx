"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExtractRun, StageMetrics, Transcript as T } from "@/lib/types";
import { DEFAULT_MODEL_ID, MODELS, getModel, type Effort } from "@/lib/models";
import { buildAnnotations, type Annotation } from "@/lib/annotations";
import { fmtTime } from "@/lib/format";
import { Timeline } from "@/components/Timeline";
import { Transcript } from "@/components/Transcript";
import { Summary } from "@/components/Summary";
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
  const [transcript, setTranscript] = useState<T | null>(null);
  const [transcribeMetrics, setTranscribeMetrics] = useState<StageMetrics | undefined>();
  const [runs, setRuns] = useState<ExtractRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [effort, setEffort] = useState<Effort>(getModel(DEFAULT_MODEL_ID).defaultEffort);

  // відтворення
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const stopAt = useRef<number | null>(null);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;
  const annotations = useMemo(() => (activeRun ? buildAnnotations(activeRun.extraction) : []), [activeRun]);
  const speakerNames = useMemo(() => {
    const m = new Map<string, string>();
    activeRun?.extraction.speakers.forEach((s) => { if (s.name) m.set(s.label, s.name); });
    return m;
  }, [activeRun]);

  // ---------- курсор: rAF, поки грає ----------
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let raf = 0;
    const tick = () => {
      setCurrentTime(a.currentTime);
      if (stopAt.current !== null && a.currentTime >= stopAt.current) {
        a.pause();
        stopAt.current = null;
      }
      if (!a.paused) raf = requestAnimationFrame(tick);
    };
    const onPlay = () => { raf = requestAnimationFrame(tick); };
    const onPause = () => { cancelAnimationFrame(raf); setCurrentTime(a.currentTime); };
    const onSeeked = () => setCurrentTime(a.currentTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("seeked", onSeeked);
    return () => { cancelAnimationFrame(raf); a.removeEventListener("play", onPlay); a.removeEventListener("pause", onPause); a.removeEventListener("seeked", onSeeked); };
  }, [url]);

  // лічильник очікування
  useEffect(() => {
    if (stage !== "transcribing" && stage !== "extracting") { setElapsed(0); return; }
    const t0 = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - t0) / 1000), 200);
    return () => clearInterval(id);
  }, [stage]);

  const pick = useCallback((a: Annotation) => {
    const el = audioRef.current;
    if (!el) return;
    if (activeId === a.id && !el.paused) { el.pause(); stopAt.current = null; return; }
    setActiveId(a.id);
    el.currentTime = Math.max(0, a.quote.start - 0.15);
    stopAt.current = a.quote.end + 0.3;
    void el.play();
  }, [activeId]);

  const seek = useCallback((sec: number) => {
    const el = audioRef.current;
    if (!el) return;
    stopAt.current = null;
    el.currentTime = Math.max(0, sec);
    void el.play();
  }, []);

  // ---------- пайплайн ----------
  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    setFile(null); setUrl(null); setDuration(0); setStage("idle"); setError(null);
    setTranscript(null); setTranscribeMetrics(undefined); setRuns([]); setActiveRunId(null); setActiveId(null); setCurrentTime(0);
  };

  const runExtract = useCallback(async (t: T, m: string, e: Effort) => {
    setStage("extracting");
    setError(null);
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: t, model: m, effort: e }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Помилка аналізу"); setStage("error"); return; }
    const run: ExtractRun = { id: `${Date.now()}`, model: data.model, modelLabel: data.modelLabel, effort: data.effort, extraction: data.extraction, metrics: data.metrics };
    setRuns((rs) => [...rs, run]);
    setActiveRunId(run.id);
    setActiveId(null);
    setStage("done");
  }, []);

  const process = useCallback(async (f: File) => {
    reset();
    setFile(f); setUrl(URL.createObjectURL(f));
    setStage("transcribing");
    const form = new FormData();
    form.append("file", f);
    const res = await fetch("/api/transcribe", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Помилка розпізнавання"); setStage("error"); return; }
    const t: T = data.transcript;
    setTranscript(t);
    setTranscribeMetrics(data.metrics);
    await runExtract(t, modelId, effort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runExtract, modelId, effort]);

  const onFiles = (files: FileList | null) => { const f = files?.[0]; if (f) void process(f); };
  const loadSample = async (name: string) => {
    const b = await (await fetch(`/samples/${name}`)).blob();
    void process(new File([b], name, { type: "audio/mpeg" }));
  };
  const onModelChange = (id: string) => { setModelId(id); setEffort(getModel(id).defaultEffort); };
  const copyJson = () => { if (activeRun) void navigator.clipboard.writeText(JSON.stringify({ ...activeRun, transcribe: transcribeMetrics }, null, 2)); };

  const busy = stage === "transcribing" || stage === "extracting";
  const spec = getModel(modelId);

  return (
    <main className={`wrap ${activeRun ? "has-result" : ""}`}>
      <header className="top">
        <div>
          <h1>Домовленості з запису</h1>
          <p>Запис розмови двох людей → фінальні задачі, власники, дедлайни й відкриті питання — кожне з місцем у розмові, де це прозвучало.</p>
        </div>
        <div className="meta">до 3 хв · 2 спікери · одна мова</div>
      </header>

      <div className="controls">
        <label><span>Модель</span>
          <select value={modelId} onChange={(e) => onModelChange(e.target.value)} disabled={busy}>
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label><span>Effort</span>
          <select value={effort} onChange={(e) => setEffort(e.target.value as Effort)} disabled={busy || !spec.supportsEffort}>
            {EFFORTS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </label>
        <div className="model-note">{spec.note} · ${spec.inputUsdPerMTok} / ${spec.outputUsdPerMTok} за 1M токенів</div>
        {transcript && !busy && (
          <button className="rerun" onClick={() => void runExtract(transcript, modelId, effort)}>Проаналізувати цією моделлю</button>
        )}
      </div>

      {!file && (
        <label className={`drop ${over ? "over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(e.dataTransfer.files); }}>
          <input type="file" accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm" onChange={(e) => onFiles(e.target.files)} />
          <span className="cta">Вибрати аудіофайл</span>
          <div className="hint">або перетягніть сюди · mp3, m4a, wav, ogg · до 3 хвилин</div>
          <div className="samples">
            Немає запису під рукою? Спробуйте тестовий — він обробиться так само, як ваш:<br />
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
          <Step state={stage === "transcribing" ? "running" : transcript ? "done" : stage === "error" && !transcript ? "error" : "idle"}
            label="Розпізнавання"
            sub={transcribeMetrics ? `${(transcribeMetrics.ms / 1000).toFixed(1)} с` : stage === "transcribing" ? `ElevenLabs Scribe · ${elapsed.toFixed(0)} с` : ""} />
          <Step state={stage === "extracting" ? "running" : activeRun ? "done" : stage === "error" && transcript ? "error" : "idle"}
            label="Аналіз домовленостей"
            sub={stage === "extracting" ? `${spec.label} читає розшифровку · ${elapsed.toFixed(0)} с · зазвичай 10–25 с` : activeRun ? `${activeRun.modelLabel} · ${(activeRun.metrics.ms / 1000).toFixed(1)} с` : ""} />
        </div>
      )}

      {error && (
        <div className="error">{error}
          {transcript && <> · <button className="reset" onClick={() => void runExtract(transcript, modelId, effort)}>Повторити аналіз</button></>}
        </div>
      )}

      {transcript && (
        <div className="layout">
          <div className="main">
            {stage === "extracting" && !activeRun && (
              <div className="tl skeleton" aria-hidden>
                <div className="sk-line" /><div className="sk-track" />
              </div>
            )}
            {activeRun && (
              <Timeline transcript={transcript} annotations={annotations} speakerNames={speakerNames}
                currentTime={currentTime} activeId={activeId} onSeek={seek} onPick={pick} />
            )}
            <section className="panel">
              <div className="panel-head">
                <h2>Розмова</h2>
                <span>{transcript.turns.length} реплік · клік по часу — перемотка{activeRun ? " · рішення позначені там, де прозвучали" : ""}</span>
              </div>
              <Transcript transcript={transcript} annotations={annotations} speakerNames={speakerNames}
                currentTime={currentTime} activeId={activeId} onSeek={seek} onPick={pick} />
            </section>
          </div>

          <aside className="side">
            {activeRun ? (
              <>
                <div className="side-head">
                  <h2>Підсумок</h2>
                  <button onClick={copyJson}>JSON</button>
                </div>
                <Summary extraction={activeRun.extraction} annotations={annotations} activeId={activeId} onPick={pick} />
              </>
            ) : (
              <div className="side-wait">
                <div className="sk-line" /><div className="sk-line short" /><div className="sk-line" />
                <p>Модель читає розшифровку і збирає фінальні домовленості…</p>
              </div>
            )}
            {(transcribeMetrics || runs.length > 0) && (
              <Metrics transcribe={transcribeMetrics} audioMinutes={transcript.durationSec / 60}
                runs={runs} activeRunId={activeRunId} onSelectRun={(id) => { setActiveRunId(id); setActiveId(null); }} />
            )}
          </aside>
        </div>
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
