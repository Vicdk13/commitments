import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Commitment, Extraction, OpenQuestion, Quote, Transcript, Turn } from "./types";
import { PRICING } from "./pricing";

// ---------- Схема відповіді моделі ----------
// Модель повертає номер репліки + дослівну цитату; секунди рахує сервер по словах Scribe.

const QuoteRef = z.object({
  turn_index: z.number().int().describe("Номер репліки з розшифровки, з якої взято цитату"),
  text: z.string().describe("Дослівна цитата з цієї репліки — фраза, яка підтверджує фінальний стан"),
});

const CommitmentSchema = z.object({
  task: z.string().describe("Що саме треба зробити — коротко, як пункт списку"),
  status: z.enum(["accepted", "cancelled", "proposed_not_accepted"]),
  owner: z.string().nullable().describe("Ім'я того, хто явно взяв задачу. null, якщо ніхто не взяв"),
  owner_note: z.string().nullable().describe("Пояснення, чому власника нема або хто відмовився. null якщо нема що додати"),
  deadline_text: z.string().nullable().describe("Дедлайн дослівно, як прозвучало («до п'ятниці»). null, якщо не називали"),
  deadline_resolvable: z.boolean().describe("false, якщо дата відносна і її не можна перевести в календарну без дати запису"),
  deadline_note: z.string().nullable().describe("Напр. «відносна дата; дата запису невідома». null якщо нема"),
  history: z.string().nullable().describe("Як змінювалась домовленість протягом розмови, якщо змінювалась. null якщо ні"),
  confidence: z.enum(["high", "medium", "low"]),
  quote: QuoteRef,
});

const OpenQuestionSchema = z.object({
  question: z.string(),
  quote: QuoteRef,
});

const ExtractionSchema = z.object({
  status: z.enum(["ok", "no_commitments", "cannot_conclude"]),
  status_reason: z.string().describe("Одне-два речення: чому такий статус"),
  recording_truncated: z.boolean().describe("true, якщо запис обривається на півслові або розмова явно не завершена"),
  speakers: z.array(z.object({ label: z.string(), name: z.string().nullable() })),
  commitments: z.array(CommitmentSchema),
  open_questions: z.array(OpenQuestionSchema),
});

// ---------- Інструкція ----------

const SYSTEM = `Ти — асистент, який з розшифровки робочої розмови двох людей складає список ФІНАЛЬНИХ домовленостей. Це не переказ зустрічі, а надійний перелік зобов'язань, за яким можна працювати.

Статуси — розрізняй їх суворо:
- accepted — домовленість прийнята обома і чинна на кінець розмови.
- cancelled — ТІЛЬКИ те, про що РАНІШЕ домовились (у цій розмові чи до неї), а потім явно відмінили. Якщо раніше не домовлялись — це не cancelled.
- proposed_not_accepted — ідея, яку хтось запропонував, але її не прийняли, відклали або відхилили; сюди ж іронічні «обіцянки». Це не зобов'язання, але корисно показати, що воно розглядалось і не прийняте.

Правила, які не можна порушувати:
1. Фіксуй лише ФІНАЛЬНИЙ стан кожної домовленості на кінець розмови. Якщо дедлайн змінили — лишається останній, а зміну опиши в history.
2. «Можна було б», «я б зробив», «а що як» — це пропозиція. Вона стає зобов'язанням лише якщо співрозмовник її явно прийняв. Не перетворюй «ми могли б» на «ми зробимо». Неприйняті пропозиції познач як proposed_not_accepted.
3. Якщо задачу скасували — status = cancelled. Не залишай її активною.
4. Власник — лише той, хто явно взяв задачу на себе або кому її явно призначили і він погодився. Якщо людина відмовилась або сказали «хтось із команди», «вирішимо потім» — owner = null, а в owner_note поясни. Не вгадуй власника з контексту.
5. Дедлайн — лише озвучений. Не вигадуй. Відносні дати («до п'ятниці», «наступного тижня») зберігай дослівно і став deadline_resolvable = false з поміткою, що дата запису невідома.
6. Сарказм та іронія («ну звісно, я за вечір усе перепишу») — НЕ зобов'язання. Якщо після іронії людина сказала, як насправді, — фіксуй це.
7. Побутові дрібниці («нагадай мені», «напишу в чат») не є робочими зобов'язаннями — пропускай. Мікро-дії, що є частиною нерозв'язаного питання («спитаю», «подумаю», «завтра скажу»), — не окремі задачі: залиш їх у відкритому питанні і вкажи там, хто уточнює.
7a. Не дублюй: якщо задача вже є в commitments (навіть без власника), не виноси «хто її робитиме» ще й як відкрите питання — достатньо owner_note.
8. Кожен пункт має цитату: дослівна фраза з конкретної репліки, яка підтверджує САМЕ фінальний стан (для скасованої — фраза скасування; для зміненого дедлайну — фраза з останнім дедлайном).
9. Імена спікерів бери лише з того, як вони представились у записі. Якщо хтось не представився — name = null, і в тексті використовуй його мітку (speaker_0 тощо).
10. Якщо в розмові немає жодної завершеної домовленості — status = no_commitments, commitments порожній, а обговорене винеси в open_questions або як proposed_not_accepted. Якщо розшифровка надто коротка, обірвана або незрозуміла, щоб робити висновки — status = cannot_conclude. Краще чесно сказати «не можу зробити висновок», ніж вигадати.
11. Відкриті питання — те, що обговорювали, але не вирішили: хто, коли, чи робити взагалі.

Мова відповіді — та сама, що й у розшифровці.`;

export type ExtractResult = {
  extraction: Extraction;
  usage: { inputTokens: number; outputTokens: number };
  model: string;
};

export async function extract(transcript: Transcript): Promise<ExtractResult> {
  const client = new Anthropic();
  // Для експериментів: EXTRACT_MODEL / EXTRACT_EFFORT перекривають типові значення (див. NOTES.md).
  const model = process.env.EXTRACT_MODEL || PRICING.claude.model;
  const effort = (process.env.EXTRACT_EFFORT || "high") as "low" | "medium" | "high";

  const lines = transcript.turns.map(
    (t) => `[${t.index}] ${fmt(t.start)} ${t.speaker}: ${t.text}`,
  );
  const user = `Розшифровка розмови (тривалість ${fmt(transcript.durationSec)}). Формат рядка: [номер_репліки] час спікер: текст.

${lines.join("\n")}

Склади список фінальних домовленостей за правилами.`;

  const response = await client.messages.parse({
    model,
    max_tokens: 16000,
    system: SYSTEM,
    thinking: { type: "adaptive" },
    output_config: { effort, format: zodOutputFormat(ExtractionSchema) },
    messages: [{ role: "user", content: user }],
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Модель повернула відповідь не за схемою");

  const names = new Map(parsed.speakers.map((s) => [s.label, s.name]));
  const resolveQuote = (q: { turn_index: number; text: string }): Quote =>
    locateQuote(transcript.turns, q.turn_index, q.text, names);

  const commitments: Commitment[] = parsed.commitments.map((c, i) => ({
    id: `c${i + 1}`,
    task: c.task,
    status: c.status,
    owner: c.owner,
    ownerNote: c.owner_note,
    deadline: { text: c.deadline_text, resolvable: c.deadline_resolvable, note: c.deadline_note },
    history: c.history,
    confidence: c.confidence,
    quote: resolveQuote(c.quote),
  }));
  const openQuestions: OpenQuestion[] = parsed.open_questions.map((q, i) => ({
    id: `q${i + 1}`,
    question: q.question,
    quote: resolveQuote(q.quote),
  }));

  return {
    extraction: {
      status: parsed.status,
      statusReason: parsed.status_reason,
      recordingTruncated: parsed.recording_truncated,
      speakers: parsed.speakers,
      commitments,
      openQuestions,
    },
    usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
    model,
  };
}

// ---------- Прив'язка цитати до секунд ----------

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/**
 * Шукає цитату серед слів репліки і повертає точні start/end.
 * Якщо не знайшла — межі всієї репліки (це чесніше, ніж вигадана секунда).
 */
export function locateQuote(turns: Turn[], turnIndex: number, text: string, names: Map<string, string | null>): Quote {
  const turn = turns[turnIndex] ?? turns.find((t) => t.text.includes(text.slice(0, 20))) ?? turns[0];
  const speaker = names.get(turn.speaker) ?? turn.speaker;
  const qTokens = text.split(/\s+/).map(norm).filter(Boolean);
  const wTokens = turn.words.map((w) => norm(w.text));

  let best = { at: -1, len: 0 };
  for (let i = 0; i < wTokens.length; i++) {
    let len = 0;
    while (i + len < wTokens.length && len < qTokens.length && wTokens[i + len] === qTokens[len]) len++;
    if (len > best.len) best = { at: i, len };
  }
  // Приймаємо збіг, якщо знайшли хоча б два слова підряд або всю цитату.
  if (best.len >= Math.min(2, qTokens.length) && best.len > 0) {
    const endIdx = Math.min(turn.words.length - 1, best.at + qTokens.length - 1);
    return { text, speaker, start: turn.words[best.at].start, end: turn.words[endIdx].end, turnIndex: turn.index };
  }
  return { text, speaker, start: turn.start, end: turn.end, turnIndex: turn.index };
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
