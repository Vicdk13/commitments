"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExtractRun, StageMetrics, Transcript as T } from "@/lib/types";
import { DEFAULT_MODEL_ID, MODELS, getModel, type Effort } from "@/lib/models";
import { buildAnnotations, type Annotation } from "@/lib/annotations";
import { fmtTime } from "@/lib/format";
import { toMarkdown } from "@/lib/exportText";
import { Timeline } from "@/components/Timeline";
import { Transcript } from "@/components/Transcript";
import { Summary } from "@/components/Summary";
import { Metrics } from "@/components/Metrics";

type Stage = "idle" | "transcribing" | "extracting" | "done" | "error";

const SAMPLES = [
  { file: "01-main.mp3", title: "Планування релізу", dur: "3:00", desc: "усі 5 ситуацій: відхилена пропозиція, прийнята задача, змінений дедлайн, скасоване, задача без власника" },
  { file: "02-variant.mp3", title: "Наступний день", dur: "2:37", desc: "одна домовленість змінена + сарказм, який не має стати зобов'язанням" },
  { file: "03-no-conclusion.mp3", title: "Без домовленостей", dur: "1:06", desc: "обірваний запис — апка має відмовитись робити висновок" },
  { file: "04-no-names.mp3", title: "Без імен", dur: "1:03", desc: "ніхто не представляється — спікери підписуються з тексту: роль і стать із граматики, без вигаданих імен" },
];

const EFFORTS: { id: Effort; label: string }[] = [
  { id: "low", label: "low — швидко" },
  { id: "medium", label: "medium" },
  { id: "high", label: "high — ретельно" },
];

const STICKY_OFFSET = 80; // висота липкого файл-бару + відступ (UI-06 / UI-08)

type CopyState = "idle" | "ok" | "fail";

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
  const [settingsOpen, setSettingsOpen] = useState(false); // UI-02

  const [copyJsonState, setCopyJsonState] = useState<CopyState>("idle");
  const [copyTextState, setCopyTextState] = useState<CopyState>("idle");
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  // відтворення
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const stopAt = useRef<number | null>(null);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;
  const annotations = useMemo(() => (activeRun ? buildAnnotations(activeRun.extraction) : []), [activeRun]);
  // Підпис спікера: ім'я → «Голос N · характеристика з тексту» → «Голос N»
  const speakerNames = useMemo(() => {
    const m = new Map<string, string>();
    if (!transcript) return m;
    const order = Array.from(new Set(transcript.turns.map((t) => t.speaker)));
    order.forEach((label, i) => {
      const s = activeRun?.extraction.speakers.find((x) => x.label === label);
      const base = `Голос ${i + 1}`;
      m.set(label, s?.name ?? (s?.descriptor ? `${base} · ${s.descriptor}` : base));
    });
    return m;
  }, [activeRun, transcript]);
  const playingId = playing ? activeId : null;

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
    const onPlay = () => { setPlaying(true); raf = requestAnimationFrame(tick); };
    const onPause = () => { setPlaying(false); cancelAnimationFrame(raf); setCurrentTime(a.currentTime); };
    const onSeeked = () => setCurrentTime(a.currentTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onPause);
    a.addEventListener("seeked", onSeeked);
    return () => {
      cancelAnimationFrame(raf);
      a.removeEventListener("play", onPlay); a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onPause); a.removeEventListener("seeked", onSeeked);
    };
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

  // UI-15: клавіатура
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const a = audioRef.current;
      if (!a || !transcript) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const onBodyOrTrack = !t || t === document.body || t.classList.contains("tl-track");
      const step = e.shiftKey ? 15 : 5;
      switch (e.key) {
        case " ":
          if (!onBodyOrTrack) return;
          e.preventDefault();
          stopAt.current = null;
          if (a.paused) void a.play(); else a.pause();
          break;
        case "ArrowLeft":
          if (!onBodyOrTrack) return;
          e.preventDefault(); stopAt.current = null; a.currentTime = Math.max(0, a.currentTime - step); break;
        case "ArrowRight":
          if (!onBodyOrTrack) return;
          e.preventDefault(); stopAt.current = null; a.currentTime = Math.min(a.duration || 0, a.currentTime + step); break;
        case "j": case "J": case "k": case "K": {
          if (annotations.length === 0) return;
          e.preventDefault();
          const now = a.currentTime;
          const next = e.key.toLowerCase() === "k"
            ? annotations.find((x) => x.quote.start > now + 0.5)
            : [...annotations].reverse().find((x) => x.quote.start < now - 0.5);
          if (next) pick(next);
          break;
        }
        case "Escape":
          a.pause(); stopAt.current = null; setActiveId(null); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [transcript, annotations, pick]);

  // ---------- пайплайн ----------
  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    setFile(null); setUrl(null); setDuration(0); setStage("idle"); setError(null);
    setTranscript(null); setTranscribeMetrics(undefined); setRuns([]); setActiveRunId(null);
    setActiveId(null); setCurrentTime(0); setPlaying(false); setFallbackText(null);
  };

  const runExtract = useCallback(async (t: T, m: string, e: Effort) => {
    setStage("extracting");
    setError(null);
    setSettingsOpen(false);
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

  // ---------- експорт (UI-11) ----------
  const copy = async (text: string, set: (s: CopyState) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      set("ok");
    } catch {
      set("fail");
      setFallbackText(text);
    }
    setTimeout(() => set("idle"), 1500);
  };
  const copyJson = () => { if (activeRun) void copy(JSON.stringify({ ...activeRun, transcribe: transcribeMetrics }, null, 2), setCopyJsonState); };
  const copyText = () => { if (activeRun && file) void copy(toMarkdown(activeRun, file.name, transcript?.durationSec ?? duration, transcribeMetrics), setCopyTextState); };
  const copyLabel = (s: CopyState, base: string) => (s === "ok" ? "Скопійовано ✓" : s === "fail" ? "Не вдалося" : base);

  const busy = stage === "transcribing" || stage === "extracting";
  const spec = getModel(modelId);
  const done = stage === "done" && !!activeRun;

  return (
    <main className={`wrap ${activeRun ? "has-result" : ""}`}>
      <header className="top">
        <div>
          <h1>Домовленості з запису</h1>
          <p>Запис розмови двох людей → фінальні задачі, власники, дедлайни й відкриті питання — кожне з місцем у розмові, де це прозвучало.</p>
        </div>
        <div className="meta">до 3 хв · 2 спікери · одна мова</div>
      </header>

      {/* UI-02: панель моделі — згорнута в один рядок */}
      <div className={`controls ${settingsOpen ? "open" : ""}`}>
        {!settingsOpen ? (
          <div className="controls-row">
            <span className="controls-sum">Аналіз: <b>{spec.label}</b> · {effort} · {spec.note}</span>
            <button className="link" onClick={() => setSettingsOpen(true)} disabled={busy}>Змінити</button>
          </div>
        ) : (
          <>
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
            {transcript && !busy
              ? <button className="rerun" onClick={() => void runExtract(transcript, modelId, effort)}>Проаналізувати цією моделлю</button>
              : <button className="link" onClick={() => setSettingsOpen(false)}>Згорнути</button>}
          </>
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
            <div className="samples-h">Немає запису під рукою? Спробуйте тестовий — він обробиться так само, як ваш:</div>
            <div className="sample-cards">
              {SAMPLES.map((s) => (
                <button key={s.file} type="button" className="sample-card" onClick={(e) => { e.preventDefault(); void loadSample(s.file); }}>
                  <span className="sample-t">{s.title} <em>· {s.dur}</em></span>
                  <span className="sample-d">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </label>
      )}

      {file && (
        <div className="filebar">
          <div className="filebar-info">
            <div className="name">{file.name}</div>
            <div className="dur">
              {duration ? fmtTime(duration) : "…"}
              {transcript ? ` · ${transcript.turns.length} реплік · ${transcript.language}` : ""}
              {done && transcribeMetrics ? ` · розпізнано за ${(transcribeMetrics.ms / 1000).toFixed(1)} с` : ""}
              {done && activeRun ? ` · ${activeRun.modelLabel} за ${(activeRun.metrics.ms / 1000).toFixed(1)} с` : ""}
            </div>
          </div>
          <audio ref={audioRef} src={url ?? undefined} controls preload="metadata" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />
          <button className="reset" onClick={reset}>Інший файл</button>
        </div>
      )}

      {file && !done && (
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

      {fallbackText && (
        <div className="fallback">
          <div className="fallback-head">Clipboard недоступний — скопіюйте вручну <button className="link" onClick={() => setFallbackText(null)}>закрити</button></div>
          <textarea readOnly value={fallbackText} onFocus={(e) => e.currentTarget.select()} />
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
                currentTime={currentTime} activeId={activeId} playingId={playingId} stickyOffset={STICKY_OFFSET} onSeek={seek} onPick={pick} />
            </section>
          </div>

          <aside className="side">
            {activeRun ? (
              <>
                <div className="side-head">
                  <div>
                    <h2>Підсумок</h2>
                    <span className="side-hint">клік по пункту — прослухати цитату</span>
                  </div>
                  <div className="side-actions">
                    <button onClick={copyText} disabled={copyTextState !== "idle"}>{copyLabel(copyTextState, "Текст")}</button>
                    <button onClick={copyJson} disabled={copyJsonState !== "idle"}>{copyLabel(copyJsonState, "JSON")}</button>
                  </div>
                </div>
                {runs.length > 1 && (
                  <div className="runs-switch" role="tablist" aria-label="Прогони аналізу">
                    {runs.map((r, i) => {
                      const e = r.extraction;
                      const counts = [
                        e.commitments.filter((c) => c.status === "accepted").length,
                        e.commitments.filter((c) => c.status === "cancelled").length,
                        e.commitments.filter((c) => c.status === "proposed_not_accepted").length,
                        e.openQuestions.length,
                      ].join(" · ");
                      return (
                        <button key={r.id} role="tab" aria-selected={r.id === activeRunId} className={r.id === activeRunId ? "on" : ""}
                          title={`прийнято · скасовано · не прийнято · питання: ${counts}`}
                          onClick={() => { setActiveRunId(r.id); setActiveId(null); }}>
                          #{i + 1} {r.modelLabel.replace("Claude ", "")} · {r.effort}
                        </button>
                      );
                    })}
                  </div>
                )}
                <Summary extraction={activeRun.extraction} annotations={annotations} turns={transcript.turns}
                  activeId={activeId} playingId={playingId} onPick={pick} onSeek={seek} />
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
