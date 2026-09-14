import type { Transcript, Turn, Word } from "./types";

const ENDPOINT = "https://api.elevenlabs.io/v1/speech-to-text";

type ScribeWord = {
  text: string;
  start: number;
  end: number;
  type: "word" | "spacing" | "audio_event";
  speaker_id?: string;
};

type ScribeResponse = {
  language_code: string;
  language_probability: number;
  text: string;
  words: ScribeWord[];
  audio_duration_secs?: number;
};

/**
 * Розпізнавання через ElevenLabs Scribe з діаризацією на двох спікерів.
 * Повертає репліки (turns) з пословними таймкодами.
 */
export async function transcribe(file: Blob, filename: string, languageCode?: string): Promise<Transcript> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY не задано");

  const form = new FormData();
  form.append("model_id", "scribe_v1");
  if (languageCode) form.append("language_code", languageCode);
  form.append("diarize", "true");
  form.append("num_speakers", "2");
  form.append("timestamps_granularity", "word");
  form.append("file", file, filename);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Scribe ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as ScribeResponse;
  return toTranscript(data);
}

export function toTranscript(data: ScribeResponse): Transcript {
  const words: Word[] = data.words
    .filter((w) => w.type === "word")
    .map((w) => ({ text: w.text, start: w.start, end: w.end, speaker: w.speaker_id ?? "speaker_0" }));

  const turns: Turn[] = [];
  let cur: Turn | null = null;
  for (const w of words) {
    if (!cur || cur.speaker !== w.speaker) {
      cur = { index: turns.length, speaker: w.speaker, start: w.start, end: w.end, text: w.text, words: [w] };
      turns.push(cur);
    } else {
      cur.text += " " + w.text;
      cur.end = w.end;
      cur.words.push(w);
    }
  }

  const last = words.at(-1);
  return {
    language: data.language_code,
    durationSec: data.audio_duration_secs ?? last?.end ?? 0,
    turns,
  };
}
