import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Commitment, Extraction, OpenQuestion, Quote, Transcript, Turn } from "./types";
import { getModel, isEffort, type Effort, type ModelSpec } from "./models";

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
  speakers: z.array(z.object({
    label: z.string(),
    name: z.string().nullable().describe("Ім'я, якщо людина представилась або її назвали. Інакше null"),
    descriptor: z.string().nullable().describe("Коротка характеристика ЛИШЕ з тексту розмови, 2–5 слів: роль («ставить задачі», «розробник») і стать, якщо однозначна з граматики («я зробила» → жінка). Не вгадуй. null, якщо нема на чому ґрунтуватись"),
  })),
  commitments: z.array(CommitmentSchema),
  open_questions: z.array(OpenQuestionSchema),
});

// ---------- Інструкція ----------

const SYSTEM = `Ти — асистент, який з розшифровки робочої розмови двох людей складає список ФІНАЛЬНИХ домовленостей. Це не переказ зустрічі, а надійний перелік зобов'язань, за яким можна працювати.

Статуси — розрізняй їх суворо:
- accepted — домовленість прийнята обома і чинна на кінець розмови.
- cancelled — ТІЛЬКИ те, про що РАНІШЕ домовились (у цій розмові чи до неї), а потім явно відмінили. Якщо раніше не домовлялись — це не cancelled.
- proposed_not_accepted — ідея, яку хтось запропонував, але її не прийняли, відклали або відхилили; сюди ж іронічні «обіцянки». Це не зобов'язання, але ОБОВ'ЯЗКОВА частина видачі: кожну явно відхилену чи відкладену пропозицію включай окремим пунктом із цим статусом — так користувач бачить, що її помітили і свідомо не зарахували. Пропускати їх не можна.

Правила, які не можна порушувати:
1. Фіксуй лише ФІНАЛЬНИЙ стан кожної домовленості на кінець розмови. Якщо дедлайн змінили — лишається останній, а зміну опиши в history.
2. «Можна було б», «я б зробив», «а що як» — це пропозиція. Вона стає зобов'язанням лише якщо співрозмовник її явно прийняв. Не перетворюй «ми могли б» на «ми зробимо». Неприйняті пропозиції познач як proposed_not_accepted.
3. Якщо задачу скасували — status = cancelled. Не залишай її активною.
4. Власник — лише той, хто явно взяв задачу на себе або кому її явно призначили і він погодився. Якщо людина відмовилась або сказали «хтось із команди», «вирішимо потім» — owner = null, а в owner_note поясни. Не вгадуй власника з контексту.
5. Дедлайн — лише озвучений. Не вигадуй. Відносні дати («до п'ятниці», «наступного тижня») зберігай дослівно і став deadline_resolvable = false з поміткою, що дата запису невідома.
6. Сарказм та іронія («ну звісно, я за вечір усе перепишу») — НЕ зобов'язання. Якщо після іронії людина сказала, як насправді, — фіксуй це.
7. Побутові дрібниці («нагадай мені», «напишу в чат») не є робочими зобов'язаннями — пропускай. Мікро-дії, що є частиною нерозв'язаного питання («спитаю», «подумаю», «завтра скажу»), — не окремі задачі: залиш їх у відкритому питанні і вкажи там, хто уточнює.
7a. Не дублюй: якщо задача вже є в commitments (навіть без власника), не виноси «хто її робитиме» ще й як відкрите питання — достатньо owner_note.
7b. Супровідні дії, що випливають зі скасування чи рішення («закрию гілку», «приберу з дошки», «занотую собі»), — не окремі задачі. Згадай їх у history або owner_note відповідного пункту.
8. Кожен пункт має цитату: дослівна фраза з конкретної репліки, яка підтверджує САМЕ фінальний стан (для скасованої — фраза скасування; для зміненого дедлайну — фраза з останнім дедлайном).
9. Імена спікерів бери лише з того, як вони представились у записі або як їх назвав співрозмовник. Якщо імені нема — name = null, а в descriptor дай коротку характеристику з тексту: роль у розмові (хто ставить задачі, хто виконує) і стать, якщо вона однозначно видна з граматики («я подивилась», «я зробив»). Без опори в тексті — descriptor = null. У примітках такого спікера називай «Голос 1» / «Голос 2» (за порядком появи), не speaker_0.
10. Якщо в розмові немає жодної завершеної домовленості — status = no_commitments, commitments порожній, а обговорене винеси в open_questions або як proposed_not_accepted. Якщо розшифровка надто коротка, обірвана або незрозуміла, щоб робити висновки — status = cannot_conclude. Краще чесно сказати «не можу зробити висновок», ніж вигадати.
11. Відкриті питання — те, що обговорювали, але не вирішили: хто, коли, чи робити взагалі.
12. У полях history, owner_note, deadline_note, status_reason не згадуй номери реплік і слово «turn». Якщо треба вказати місце в розмові — пиши час у форматі m:ss, як у розшифровці, напр. «(0:12)».

Мова відповіді — та сама, що й у розшифровці.`;

export type ExtractOptions = { model?: string; effort?: Effort };

export type ExtractResult = {
  extraction: Extraction;
  usage: { inputTokens: number; outputTokens: number };
  model: string;
  effort: Effort;
};

/**
 * Витяг домовленостей. Модель і effort — з опцій; якщо не задано — зі змінних
 * EXTRACT_MODEL / EXTRACT_EFFORT (для CLI-експериментів), інакше типові з реєстру.
 */
export async function extract(transcript: Transcript, opts: ExtractOptions = {}): Promise<ExtractResult> {
  const spec = getModel(opts.model ?? process.env.EXTRACT_MODEL);
  const envEffort = process.env.EXTRACT_EFFORT;
  const effort: Effort = opts.effort ?? (isEffort(envEffort) ? envEffort : spec.defaultEffort);

  const parsed = await runExtraction(spec, effort, transcript);
  return finalize(parsed.output, parsed.usage, spec, effort, transcript);
}

type Parsed = { output: z.infer<typeof ExtractionSchema>; usage: { inputTokens: number; outputTokens: number } };

// Провайдер-специфічна частина. Новий провайдер — нова гілка тут.
async function runExtraction(spec: ModelSpec, effort: Effort, transcript: Transcript): Promise<Parsed> {
  const user = buildUserPrompt(transcript);
  switch (spec.provider) {
    case "anthropic": {
      const client = new Anthropic();
      const response = await client.messages.parse({
        model: spec.id,
        max_tokens: 16000,
        system: SYSTEM,
        thinking: { type: "adaptive" },
        output_config: { effort, format: zodOutputFormat(ExtractionSchema) },
        messages: [{ role: "user", content: user }],
      });
      if (!response.parsed_output) throw new Error("Модель повернула відповідь не за схемою");
      return {
        output: response.parsed_output,
        usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
      };
    }
  }
}

function buildUserPrompt(transcript: Transcript): string {

  const lines = transcript.turns.map(
    (t) => `[${t.index}] ${fmt(t.start)} ${t.speaker}: ${t.text}`,
  );
  return `Розшифровка розмови (тривалість ${fmt(transcript.durationSec)}). Формат рядка: [номер_репліки] час спікер: текст.

${lines.join("\n")}

Склади список фінальних домовленостей за правилами.`;
}

function finalize(
  parsed: z.infer<typeof ExtractionSchema>,
  usage: { inputTokens: number; outputTokens: number },
  spec: ModelSpec,
  effort: Effort,
  transcript: Transcript,
): ExtractResult {
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
      speakers: parsed.speakers.map((s) => ({ label: s.label, name: s.name, descriptor: s.descriptor })),
      commitments,
      openQuestions,
    },
    usage,
    model: spec.id,
    effort,
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
