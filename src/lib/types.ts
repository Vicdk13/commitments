// Спільні типи для пайплайну: аудіо → розшифровка → зобов'язання.

export type Word = {
  text: string;
  start: number;
  end: number;
  speaker: string; // speaker_0 / speaker_1 … з діаризації
};

export type Turn = {
  index: number;
  speaker: string; // speaker_0 / speaker_1
  start: number;
  end: number;
  text: string;
  words: Word[];
};

export type Transcript = {
  language: string;
  durationSec: number;
  turns: Turn[];
};

export type Quote = {
  text: string;
  speaker: string; // ім'я, якщо відоме, інакше speaker_N
  start: number;
  end: number;
  turnIndex: number;
};

export type CommitmentStatus = "accepted" | "cancelled" | "proposed_not_accepted";

export type Commitment = {
  id: string;
  task: string;
  status: CommitmentStatus;
  owner: string | null;
  ownerNote: string | null;
  deadline: { text: string | null; resolvable: boolean; note: string | null };
  history: string | null; // напр. «дедлайн змінено з четверга на п'ятницю»
  confidence: "high" | "medium" | "low";
  quote: Quote;
};

export type OpenQuestion = {
  id: string;
  question: string;
  quote: Quote;
};

export type ExtractionStatus = "ok" | "no_commitments" | "cannot_conclude";

export type Extraction = {
  status: ExtractionStatus;
  statusReason: string;
  recordingTruncated: boolean;
  speakers: { label: string; name: string | null; descriptor?: string | null }[];
  commitments: Commitment[];
  openQuestions: OpenQuestion[];
};

export type StageMetrics = {
  ms: number;
  usd: number;
  detail: string;
};

export type ExtractMetrics = StageMetrics & { inputTokens: number; outputTokens: number };

export type Metrics = {
  transcribe?: StageMetrics;
  extract?: ExtractMetrics;
  audioMinutes: number;
};

/** Один прогін аналізу на тій самій розшифровці — щоб порівнювати моделі. */
export type ExtractRun = {
  id: string;
  model: string;
  modelLabel: string;
  effort: string;
  extraction: Extraction;
  metrics: ExtractMetrics;
};
