"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Extraction, Metrics as M, Quote, Transcript } from "@/lib/types";
import { fmtTime } from "@/lib/format";
import { Results } from "@/components/Results";
import { Metrics } from "@/components/Metrics";

type Stage = "idle" | "transcribing" | "extracting" | "done" | "error";

const SAMPLES = [
  { file: "01-main.mp3", label: "Планування релізу (3 хв)" },
  { file: "02-variant.mp3", label: "Наступний день, із сарказмом (2,5 хв)" },
  { file: "03-no-conclusion.mp3", label: "Без домовленостей, обірваний (1 хв)" },
];

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [metrics, setMetrics] = useState<M>({ audioMinutes: 0 });
  const [over, setOver] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState<Quote | null>(null);
  const stopAt = useRef<number | null>(null);

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
    setTranscript(null); setExtraction(null); setMetrics({ audioMinutes: 0 }); setActive(null);
  };

  const runExtract = useCallback(async (t: Transcript) => {
    setStage("extracting");
    setError(null);
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: t }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Помилка аналізу"); setStage("error"); return; }
    setExtraction(data.extraction);
    setMetrics((m) => ({ ...m, extract: data.metrics }));
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
    setMetrics({ transcribe: data.metrics, audioMinutes: t.durationSec / 60 });
    await runExtract(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runExtract]);

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f) void process(f);
  };

  const loadSample = async (name: string) => {
    const r = await fetch(`/samples/${name}`);
    const b = await r.blob();
    void process(new File([b], name, { type: "audio/mpeg" }));
  };

  const copyJson = () => {
    if (!extraction) return;
    void navigator.clipboard.writeText(JSON.stringify({ extraction, metrics }, null, 2));
  };

  return (
    <main className="wrap">
      <header className="top">
        <div>
          <h1>Домовленості з запису</h1>
          <p>Завантажте запис робочої розмови двох людей — отримаєте фінальні задачі, власників, дедлайни й відкриті питання з цитатами.</p>
        </div>
        <div className="meta">до 3 хв · 2 спікери · одна мова</div>
      </header>

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
            sub={metrics.transcribe ? `${(metrics.transcribe.ms / 1000).toFixed(1)} с` : stage === "transcribing" ? "ElevenLabs Scribe…" : ""}
          />
          <Step
            state={stage === "extracting" ? "running" : extraction ? "done" : stage === "error" && transcript ? "error" : "idle"}
            label="Аналіз домовленостей"
            sub={metrics.extract ? `${(metrics.extract.ms / 1000).toFixed(1)} с` : stage === "extracting" ? "Claude читає розшифровку…" : ""}
          />
        </div>
      )}

      {error && (
        <div className="error">
          {error}
          {transcript && !extraction && <> · <button className="reset" onClick={() => void runExtract(transcript)}>Повторити аналіз</button></>}
        </div>
      )}

      {extraction && (
        <>
          <div className="actions">
            <button onClick={copyJson}>Скопіювати JSON</button>
          </div>
          <Results extraction={extraction} activeQuote={active} onPlay={playQuote} />
        </>
      )}

      {transcript && (
        <details className="transcript">
          <summary>Розшифровка <span>{transcript.turns.length} реплік · натисніть час, щоб перейти</span></summary>
          <div className="turns">
            {transcript.turns.map((t) => {
              const name = extraction?.speakers.find((s) => s.label === t.speaker)?.name ?? t.speaker;
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

      {(metrics.transcribe || metrics.extract) && <Metrics m={metrics} />}
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
