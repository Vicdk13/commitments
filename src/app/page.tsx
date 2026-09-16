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
import { Progress } from "@/components/Progress";
import { Modal } from "@/components/Modal";

type Stage = "idle" | "transcribing" | "extracting" | "done" | "error";

const SAMPLES = [
  { file: "01-main.mp3", title: "Планування релізу", dur: "3:00", desc: "усі 5 ситуацій: відхилена пропозиція, прийнята задача, змінений дедлайн, скасоване, задача без власника" },
  { file: "02-variant.mp3", title: "Наступний день", dur: "2:37", desc: "одна домовленість змінена + сарказм, який не має стати зобов'язанням" },
  { file: "03-no-conclusion.mp3", title: "Без домовленостей", dur: "1:06", desc: "обірваний запис — апка має відмовитись робити висновок" },
  { file: "04-no-names.mp3", title: "Без імен", dur: "1:03", desc: "ніхто не представляється — спікери підписуються з тексту, без вигаданих імен" },
];

const EFFORTS: { id: Effort; label: string }[] = [
  { id: "low", label: "low — швидко" },
  { id: "medium", label: "medium" },
  { id: "high", label: "high — ретельно" },
];

const STICKY_OFFSET = 0;
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [copyJsonState, setCopyJsonState] = useState<CopyState>("idle");
  const [copyTextState, setCopyTextState] = useState<CopyState>("idle");
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  const [showSummary, setShowSummary] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const summaryShownFor = useRef<string | null>(null);
  const [tab, setTab] = useState<"talk" | "sum">("talk"); // мобільні вкладки

  // відтворення
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const stopAt = useRef<number | null>(null);
  const [follow, setFollow] = useState(true);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;
  const annotations = useMemo(() => (activeRun ? buildAnnotations(activeRun.extraction) : []), [activeRun]);
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

  const liveId = useMemo(() => {
    if (!playing) return null;
    const hit = annotations.find((a) => currentTime >= a.quote.start - 0.1 && currentTime <= a.quote.end + 1.2);
    return hit?.id ?? null;
  }, [annotations, currentTime, playing]);

  // підсумок прокручується до пункту, що звучить
  const sideRef = useRef<HTMLDivElement>(null);
  const sideUserScrolledAt = useRef(0);
  const sideProgrammatic = useRef(0);
  useEffect(() => {
    if (!liveId || !follow) return;
    const side = sideRef.current;
    if (!side) return;
    if (Date.now() - sideUserScrolledAt.current < 3000) return;
    const el = side.querySelector<HTMLElement>(`[data-ann="${liveId}"]`);
    if (!el) return;
    sideProgrammatic.current = Date.now() + 800;
    side.scrollTo({ top: el.offsetTop - side.clientHeight * 0.3, behavior: "smooth" });
  }, [liveId, follow]);
  const onSideScroll = () => { if (Date.now() >= sideProgrammatic.current) sideUserScrolledAt.current = Date.now(); };

  // ---------- курсор: rAF, поки грає ----------
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let raf = 0;
    const tick = () => {
      setCurrentTime(a.currentTime);
      if (stopAt.current !== null && a.currentTime >= stopAt.current) { a.pause(); stopAt.current = null; }
      if (!a.paused) raf = requestAnimationFrame(tick);
    };
    const onPlay = () => { setPlaying(true); raf = requestAnimationFrame(tick); };
    const onPause = () => { setPlaying(false); cancelAnimationFrame(raf); setCurrentTime(a.currentTime); };
    const onEnded = () => {
      onPause();
      // наприкінці запису — підсумок, один раз на прогін
      if (activeRunId && summaryShownFor.current !== activeRunId) { summaryShownFor.current = activeRunId; setShowSummary(true); }
    };
    const onSeeked = () => setCurrentTime(a.currentTime);
    a.addEventListener("play", onPlay); a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded); a.addEventListener("seeked", onSeeked);
    return () => {
      cancelAnimationFrame(raf);
      a.removeEventListener("play", onPlay); a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded); a.removeEventListener("seeked", onSeeked);
    };
  }, [url, activeRunId]);

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
    setShowSummary(false);
    setTab("talk");
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

  // клавіатура
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const a = audioRef.current;
      if (!a || !transcript || showSummary || showMetrics) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const onBodyOrTrack = !t || t === document.body || t.classList.contains("tl-track");
      const step = e.shiftKey ? 15 : 5;
      switch (e.key) {
        case " ": if (!onBodyOrTrack) return; e.preventDefault(); stopAt.current = null; if (a.paused) void a.play(); else a.pause(); break;
        case "ArrowLeft": if (!onBodyOrTrack) return; e.preventDefault(); stopAt.current = null; a.currentTime = Math.max(0, a.currentTime - step); break;
        case "ArrowRight": if (!onBodyOrTrack) return; e.preventDefault(); stopAt.current = null; a.currentTime = Math.min(a.duration || 0, a.currentTime + step); break;
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
        case "Escape": a.pause(); stopAt.current = null; setActiveId(null); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [transcript, annotations, pick, showSummary, showMetrics]);

  // ---------- пайплайн ----------
  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    setFile(null); setUrl(null); setDuration(0); setStage("idle"); setError(null);
    setTranscript(null); setTranscribeMetrics(undefined); setRuns([]); setActiveRunId(null);
    setActiveId(null); setCurrentTime(0); setPlaying(false); setFallbackText(null);
    setShowSummary(false); setShowMetrics(false); summaryShownFor.current = null; setTab("talk");
  };

  const runExtract = useCallback(async (t: T, m: string, e: Effort) => {
    setStage("extracting"); setError(null); setSettingsOpen(false);
    const res = await fetch("/api/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: t, model: m, effort: e }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Помилка аналізу"); setStage("error"); return; }
    const run: ExtractRun = { id: `${Date.now()}`, model: data.model, modelLabel: data.modelLabel, effort: data.effort, extraction: data.extraction, metrics: data.metrics };
    setRuns((rs) => [...rs, run]); setActiveRunId(run.id); setActiveId(null); setStage("done");
  }, []);

  const process = useCallback(async (f: File) => {
    reset();
    setFile(f); setUrl(URL.createObjectURL(f)); setStage("transcribing");
    const form = new FormData(); form.append("file", f);
    const res = await fetch("/api/transcribe", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Помилка розпізнавання"); setStage("error"); return; }
    const t: T = data.transcript;
    setTranscript(t); setTranscribeMetrics(data.metrics);
    await runExtract(t, modelId, effort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runExtract, modelId, effort]);

  const onFiles = (files: FileList | null) => { const f = files?.[0]; if (f) void process(f); };
  const loadSample = async (name: string) => { const b = await (await fetch(`/samples/${name}`)).blob(); void process(new File([b], name, { type: "audio/mpeg" })); };
  const onModelChange = (id: string) => { setModelId(id); setEffort(getModel(id).defaultEffort); };

  const copy = async (text: string, set: (s: CopyState) => void) => {
    try { await navigator.clipboard.writeText(text); set("ok"); }
    catch { set("fail"); setFallbackText(text); }
    setTimeout(() => set("idle"), 1500);
  };
  const copyJson = () => { if (activeRun) void copy(JSON.stringify({ ...activeRun, transcribe: transcribeMetrics }, null, 2), setCopyJsonState); };
  const copyText = () => { if (activeRun && file) void copy(toMarkdown(activeRun, file.name, transcript?.durationSec ?? duration, transcribeMetrics), setCopyTextState); };
  const copyLabel = (s: CopyState, base: string) => (s === "ok" ? "Скопійовано ✓" : s === "fail" ? "Не вдалося" : base);

  const busy = stage === "transcribing" || stage === "extracting";
  const spec = getModel(modelId);
  const done = stage === "done" && !!activeRun;
  const counts = activeRun ? {
    accepted: annotations.filter((a) => a.kind === "accepted").length,
    cancelled: annotations.filter((a) => a.kind === "cancelled").length,
    proposed: annotations.filter((a) => a.kind === "proposed").length,
    question: annotations.filter((a) => a.kind === "question").length,
  } : null;

  const exportButtons = (
    <>
      <button className="btn" onClick={copyText} disabled={copyTextState !== "idle"}>{copyLabel(copyTextState, "Текст")}</button>
      <button className="btn" onClick={copyJson} disabled={copyJsonState !== "idle"}>{copyLabel(copyJsonState, "JSON")}</button>
    </>
  );

  // ---------- стартовий екран ----------
  if (!file) {
    return (
      <main className="app hero">
        <div className="hero-inner">
          <div className="brand"><span className="brand-dot" />Домовленості з запису</div>
          <h1>Розмова → те, про що насправді домовились</h1>
          <p className="lead">Завантажте запис розмови двох людей. Отримаєте задачі, власників, дедлайни й відкриті питання — кожне з місцем у розмові, де це прозвучало.</p>

          <label className={`drop ${over ? "over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(e.dataTransfer.files); }}>
            <input type="file" accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm" onChange={(e) => onFiles(e.target.files)} />
            <span className="cta">Вибрати аудіофайл</span>
            <span className="hint">або перетягніть сюди · mp3, m4a, wav, ogg · до 3 хвилин · 2 спікери</span>
          </label>

          <div className="samples">
            <div className="samples-h">Немає запису під рукою? Тестові обробляються так само, як ваш:</div>
            <div className="sample-cards">
              {SAMPLES.map((s) => (
                <button key={s.file} type="button" className="sample-card" onClick={() => void loadSample(s.file)}>
                  <span className="sample-t">{s.title} <em>{s.dur}</em></span>
                  <span className="sample-d">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hero-model">
            {!settingsOpen ? (
              <>Аналіз: <b>{spec.label}</b> · {effort} · {spec.note} <button className="link" onClick={() => setSettingsOpen(true)}>Змінити</button></>
            ) : (
              <span className="hero-model-form">
                <select value={modelId} onChange={(e) => onModelChange(e.target.value)}>{MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
                <select value={effort} onChange={(e) => setEffort(e.target.value as Effort)}>{EFFORTS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select>
                <button className="link" onClick={() => setSettingsOpen(false)}>Готово</button>
              </span>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ---------- робочий екран ----------
  return (
    <main className={`app ${done ? "has-result" : ""}`}>
      <header className="bar">
        <div className="bar-file">
          <div className="name">{file.name}</div>
          <div className="dur">
            {duration ? fmtTime(duration) : "…"}
            {transcript ? ` · ${transcript.turns.length} реплік` : ""}
            {done && transcribeMetrics ? ` · розпізнано за ${(transcribeMetrics.ms / 1000).toFixed(1)} с` : ""}
            {done && activeRun ? ` · ${activeRun.modelLabel} за ${(activeRun.metrics.ms / 1000).toFixed(1)} с` : ""}
          </div>
        </div>
        <audio ref={audioRef} src={url ?? undefined} controls preload="metadata" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />
        <div className="bar-actions">
          {done && <button className="btn primary" onClick={() => setShowSummary(true)}>Підсумок</button>}
          {done && <button className="btn" onClick={() => setShowMetrics(true)}>Час і вартість</button>}
          {transcript && !busy && (
            <button className="btn" onClick={() => setSettingsOpen((v) => !v)} title="Інша модель">{settingsOpen ? "Згорнути" : "Модель"}</button>
          )}
          <button className="btn ghost" onClick={reset}>Інший файл</button>
        </div>
      </header>

      {settingsOpen && (
        <div className="controls">
          <label><span>Модель</span>
            <select value={modelId} onChange={(e) => onModelChange(e.target.value)} disabled={busy}>{MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
          </label>
          <label><span>Effort</span>
            <select value={effort} onChange={(e) => setEffort(e.target.value as Effort)} disabled={busy || !spec.supportsEffort}>{EFFORTS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select>
          </label>
          <div className="model-note">{spec.note} · ${spec.inputUsdPerMTok} / ${spec.outputUsdPerMTok} за 1M токенів</div>
          {transcript && !busy && <button className="btn primary" onClick={() => void runExtract(transcript, modelId, effort)}>Проаналізувати цією моделлю</button>}
        </div>
      )}

      {busy && (
        <Progress stage={stage as "transcribing" | "extracting"} elapsed={elapsed} durationSec={duration || transcript?.durationSec || 120} modelLabel={spec.label} sttMs={transcribeMetrics?.ms} />
      )}
      {error && (
        <div className="error">{error}
          {transcript && <> · <button className="btn" onClick={() => void runExtract(transcript, modelId, effort)}>Повторити аналіз</button></>}
        </div>
      )}
      {fallbackText && (
        <div className="fallback">
          <div className="fallback-head">Clipboard недоступний — скопіюйте вручну <button className="link" onClick={() => setFallbackText(null)}>закрити</button></div>
          <textarea readOnly value={fallbackText} onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}

      {activeRun && transcript && (
        <Timeline transcript={transcript} annotations={annotations} speakerNames={speakerNames}
          currentTime={currentTime} activeId={activeId} onSeek={seek} onPick={pick} />
      )}

      {transcript && (
        <>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === "talk"} className={tab === "talk" ? "on" : ""} onClick={() => setTab("talk")}>Розмова</button>
            <button role="tab" aria-selected={tab === "sum"} className={tab === "sum" ? "on" : ""} onClick={() => setTab("sum")}>
              Підсумок{counts && <span className="tab-count">{counts.accepted + counts.cancelled + counts.proposed + counts.question}</span>}
            </button>
          </div>

          <div className={`cols tab-${tab}`}>
            <section className="panel talk">
              <div className="panel-head">
                <h2>Розмова</h2>
                <span className="panel-sub">{transcript.turns.length} реплік{activeRun ? " · рішення позначені там, де прозвучали" : ""}</span>
                <label className="follow"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} /> слідкувати</label>
              </div>
              <Transcript transcript={transcript} annotations={annotations} speakerNames={speakerNames}
                currentTime={currentTime} activeId={activeId} playingId={playingId} liveId={liveId} playing={playing} follow={follow}
                stickyOffset={STICKY_OFFSET} onSeek={seek} onPick={pick} />
            </section>

            <aside className="panel side">
              <div className="panel-head">
                <h2>Підсумок</h2>
                {counts && (
                  <span className="counts">
                    <i className="accepted">{counts.accepted}</i><i className="cancelled">{counts.cancelled}</i><i className="proposed">{counts.proposed}</i><i className="question">{counts.question}</i>
                  </span>
                )}
                {done && <div className="panel-actions">{exportButtons}</div>}
              </div>
              <div className="side-body" ref={sideRef} onScroll={onSideScroll} onWheel={onSideScroll} onTouchMove={onSideScroll}>
                {activeRun ? (
                  <>
                    {runs.length > 1 && (
                      <div className="runs-switch" role="tablist" aria-label="Прогони аналізу">
                        {runs.map((r, i) => (
                          <button key={r.id} role="tab" aria-selected={r.id === activeRunId} className={r.id === activeRunId ? "on" : ""}
                            onClick={() => { setActiveRunId(r.id); setActiveId(null); }}>#{i + 1} {r.modelLabel.replace("Claude ", "")} · {r.effort}</button>
                        ))}
                      </div>
                    )}
                    <Summary extraction={activeRun.extraction} annotations={annotations} turns={transcript.turns}
                      activeId={activeId} playingId={playingId} liveId={liveId} onPick={pick} onSeek={seek} />
                  </>
                ) : (
                  <div className="side-wait">
                    <div className="sk-line" /><div className="sk-line short" /><div className="sk-line" />
                    <p>Модель читає розшифровку і збирає фінальні домовленості…</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </>
      )}

      {/* ---------- попапи ---------- */}
      {activeRun && transcript && (
        <Modal open={showSummary} title="Підсумок розмови" onClose={() => setShowSummary(false)} actions={exportButtons} wide>
          <Summary extraction={activeRun.extraction} annotations={annotations} turns={transcript.turns}
            activeId={activeId} playingId={null} liveId={null} onPick={pick} onSeek={(s) => { setShowSummary(false); seek(s); }} />
        </Modal>
      )}
      {transcript && (
        <Modal open={showMetrics} title="Час і вартість" onClose={() => setShowMetrics(false)}>
          <Metrics transcribe={transcribeMetrics} audioMinutes={transcript.durationSec / 60} runs={runs} activeRunId={activeRunId}
            onSelectRun={(id) => { setActiveRunId(id); setActiveId(null); }} />
        </Modal>
      )}
    </main>
  );
}
