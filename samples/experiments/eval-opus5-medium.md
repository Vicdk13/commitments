# Eval report — 2026-09-14T16:22:19.888Z

## 01-main.mp3

STT: з кешу (samples/01-main.transcript.json)
LLM: claude-opus-5, effort=medium, 20143 мс, 6758 in / 1415 out
Разом: 20.1 с, $0.0801, $0.0269/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday — виправлений дедлайн: четвер → п'ятниця → «Виправити дублювання push-сповіщень на Android (дубльована підписка на топік після оновлення)»
- ✅ INCLUDE dark-theme-cancelled — скасована задача → «Зробити темну тему в цьому релізі»
- ✅ INCLUDE screenshots-no-owner — задача без власника → «Оновити скріншоти в App Store (зараз зі старим дизайном)»
- ✅ INCLUDE auth-not-accepted — пропозиція, яку не прийняли → «Повністю переписати авторизацію на новий SDK (≈тиждень роботи)»
- ✅ INCLUDE-Q q-release-text → «Хто пише текст опису оновлення — Олена чи маркетинг? Дмитро уточнить у…»
- ✅ INCLUDE-Q q-banner → «Чи робити банер у застосунку про новий реліз — рішення за Оленою, вона…»
- ✅ EXCLUDE no-thursday — старий дедлайн не має лишитись
- ✅ EXCLUDE no-dark-theme-active — скасоване не має бути активним
- ✅ EXCLUDE no-auth-accepted — неприйнята пропозиція не має стати задачею
- ✅ EXCLUDE no-screenshots-owner-dmytro — Дмитро явно відмовився
- ✅ EXCLUDE no-remind — побутове прохання — не робочий комітмент

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "У розмові є чіткі фінальні домовленості: одна прийнята з дедлайном, одна скасована, одна без власника, а також відкладена пропозиція.",
  "recordingTruncated": false,
  "speakers": [
    {
      "label": "speaker_0",
      "name": "Олена"
    },
    {
      "label": "speaker_1",
      "name": "Дмитро"
    }
  ],
  "commitments": [
    {
      "id": "c1",
      "task": "Виправити дублювання push-сповіщень на Android (дубльована підписка на топік після оновлення)",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "до п'ятниці",
        "resolvable": false,
        "note": "відносна дата; дата запису невідома"
      },
      "history": "Спочатку Дмитро обіцяв зробити до четверга, але через демо для інвесторів у четвер дедлайн перенесли на п'ятницю.",
      "confidence": "high",
      "quote": {
        "text": "Окей, тоді до п'ятниці. Push-сповіщення на мені. До п'ятниці.",
        "speaker": "Дмитро",
        "start": 72.36,
        "end": 76.68,
        "turnIndex": 9
      }
    },
    {
      "id": "c2",
      "task": "Зробити темну тему в цьому релізі",
      "status": "cancelled",
      "owner": null,
      "ownerNote": "Раніше домовлялись, що робить Дмитро; тепер задачу знято з релізу, гілку буде закрито. Можливе повернення в наступному релізі.",
      "deadline": {
        "text": null,
        "resolvable": true,
        "note": null
      },
      "history": "Раніше домовлялись, що темна тема увійде в цей реліз, Дмитро вже почав; через значно більший обсяг робіт Олена скасувала її в цьому релізі.",
      "confidence": "high",
      "quote": {
        "text": "Давай взагалі знімемо, е, темну тему з цього релізу. Не хочу ризикувати. Скасовуємо.",
        "speaker": "Олена",
        "start": 94.26,
        "end": 99.6,
        "turnIndex": 12
      }
    },
    {
      "id": "c3",
      "task": "Оновити скріншоти в App Store (зараз зі старим дизайном)",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Дмитро відмовився («це не дуже моє»); виконавця вирішать, коли Марина повернеться з відпустки",
      "deadline": {
        "text": "до релізу",
        "resolvable": false,
        "note": "відносна дата; дата релізу/запису невідома (реліз згадано як «через два тижні»)"
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Давай поки залишимо як задачу, а хто робитиме, вирішимо, коли Марина повернеться з відпустки.",
        "speaker": "Олена",
        "start": 122.12,
        "end": 127.32,
        "turnIndex": 16
      }
    },
    {
      "id": "c4",
      "task": "Повністю переписати авторизацію на новий SDK (≈тиждень роботи)",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Пропозиція Дмитра; Олена відклала до після релізу, Дмитро лише занотує собі",
      "deadline": {
        "text": "після релізу",
        "resolvable": false,
        "note": "відносна дата; дата релізу/запису невідома"
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "У нас реліз через два тижні, і я не хочу чіпати авторизацію перед ним. Давай повернемось до цього після релізу.",
        "speaker": "Олена",
        "start": 35.62,
        "end": 42.22,
        "turnIndex": 4
      }
    },
    {
      "id": "c5",
      "task": "Зробити банер у застосунку про новий реліз",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Дмитро вважає, що не потрібно; рішення за Оленою, вона ще думає",
      "deadline": {
        "text": null,
        "resolvable": true,
        "note": null
      },
      "history": null,
      "confidence": "medium",
      "quote": {
        "text": "Мені здається, не потрібно. Але це вже ти вирішуй.",
        "speaker": "Дмитро",
        "start": 151.12,
        "end": 153.64,
        "turnIndex": 21
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Хто пише текст опису оновлення — Олена чи маркетинг? Дмитро уточнить у Сергія.",
      "quote": {
        "text": "Не знаю. Це точно не до мене. Запитаю у Сергія.",
        "speaker": "Дмитро",
        "start": 139.32,
        "end": 141.94,
        "turnIndex": 19
      }
    },
    {
      "id": "q2",
      "question": "Чи робити банер у застосунку про новий реліз — рішення за Оленою, вона подумає.",
      "quote": {
        "text": "Подумаю.",
        "speaker": "Олена",
        "start": 154.3,
        "end": 155.16,
        "turnIndex": 22
      }
    }
  ]
}
```
</details>

## 02-variant.mp3

STT: з кешу (samples/02-variant.transcript.json)
LLM: claude-opus-5, effort=medium, 21523 мс, 6562 in / 1626 out
Разом: 21.5 с, $0.0830, $0.0318/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday → «Завершити push-сповіщення (лишилось протестувати на старих версіях Android)»
- ✅ INCLUDE dark-theme-returned — змінена домовленість: повернуто в реліз, дедлайн середа наступного тижня → «Зробити темну тему для основних екранів (налаштування лишаються світлими)»
- ✅ INCLUDE error-texts-no-owner — задача без власника («хтось із команди») → «Привести до ладу тексти помилок у формах (уніфікувати мову)»
- ✅ INCLUDE release-shift-rejected — пропозиція зсунути реліз відхилена → «Зсунути реліз на тиждень, щоб встигли темна тема повністю і тести»
- ✅ INCLUDE-Q q-tests → «Покриття тестами: обсяг і терміни не визначені, домовились розглядати …»
- ✅ INCLUDE-Q q-contractor → «Хто робитиме скриншоти для Store, поки Марина у відпустці, і чи брати …»
- ✅ EXCLUDE no-sarcastic-tests — САРКАЗМ: «за вечір напишу тести» не є зобов'язанням
- ✅ EXCLUDE no-dark-theme-cancelled — у цьому записі темну тему повернули
- ✅ EXCLUDE no-release-shift-accepted — реліз не рухали
- ✅ EXCLUDE no-error-texts-dmytro — Дмитро відмовився

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "У розмові є кілька чинних домовленостей із власником і дедлайнами, а також підсумок у кінці.",
  "recordingTruncated": false,
  "speakers": [
    {
      "label": "speaker_0",
      "name": "Олена"
    },
    {
      "label": "speaker_1",
      "name": "Дмитро"
    }
  ],
  "commitments": [
    {
      "id": "c1",
      "task": "Зробити темну тему для основних екранів (налаштування лишаються світлими)",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "до середи наступного тижня",
        "resolvable": false,
        "note": "відносна дата; дата запису невідома"
      },
      "history": "Раніше темну тему знімали з релізу, але після розмови з Ігорем її повернули в обсяг з обмеженням до основних екранів.",
      "confidence": "high",
      "quote": {
        "text": "Добре. Основні екрани до середи наступного тижня.",
        "speaker": "Дмитро",
        "start": 44.48,
        "end": 47.44,
        "turnIndex": 7
      }
    },
    {
      "id": "c2",
      "task": "Завершити push-сповіщення (лишилось протестувати на старих версіях Android)",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "п'ятниця",
        "resolvable": false,
        "note": "відносна дата; дата запису невідома"
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "П'ятниця, так. Там уже майже все. Лишилось протестувати на старих версіях Android.",
        "speaker": "Дмитро",
        "start": 51.56,
        "end": 56.14,
        "turnIndex": 9
      }
    },
    {
      "id": "c3",
      "task": "Привести до ладу тексти помилок у формах (уніфікувати мову)",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Дмитро відмовився через завантаженість; виконавця роздадуть на стендапі («хтось із команди»)",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Хтось із команди. Добре, поки без імені, на стендапі роздамо.",
        "speaker": "Олена",
        "start": 110.7,
        "end": 114.979,
        "turnIndex": 20
      }
    },
    {
      "id": "c4",
      "task": "Не зсувати дату релізу",
      "status": "accepted",
      "owner": null,
      "ownerNote": "рішення Олени щодо дати релізу, персональний виконавець не потрібен",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": "Дмитро пропонував зсунути реліз на тиждень — пропозицію відхилено.",
      "confidence": "high",
      "quote": {
        "text": "Ні, дата озвучена. Ігор її вже всім розказав. Е-е-е, реліз стоїть.",
        "speaker": "Олена",
        "start": 88.68,
        "end": 92.4,
        "turnIndex": 16
      }
    },
    {
      "id": "c5",
      "task": "Написати тести на весь проєкт за вечір/до ранку",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "іронічна «обіцянка» Дмитра, не є зобов'язанням",
      "deadline": {
        "text": "до ранку",
        "resolvable": false,
        "note": "відносна дата; сказано в іронічному контексті"
      },
      "history": "Після іронії Дмитро сказав, що тести — окрема історія і їх варто робити після релізу; питання лишили відкритим.",
      "confidence": "high",
      "quote": {
        "text": "Ні, серйозно. Тести — це окрема історія. Давай після релізу.",
        "speaker": "Дмитро",
        "start": 73.68,
        "end": 76.92,
        "turnIndex": 13
      }
    },
    {
      "id": "c6",
      "task": "Зсунути реліз на тиждень, щоб встигли темна тема повністю і тести",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Олена відхилила пропозицію",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Ні, дата озвучена. Ігор її вже всім розказав. Е-е-е, реліз стоїть.",
        "speaker": "Олена",
        "start": 88.68,
        "end": 92.4,
        "turnIndex": 16
      }
    },
    {
      "id": "c7",
      "task": "Залучити підрядника для скриншотів у Store",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "пропозиція Дмитра; Олена не прийняла, спершу порахує вартість",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Не знаю. Треба порахувати, скільки це коштуватиме. Давай я подумаю і завтра скажу.",
        "speaker": "Олена",
        "start": 122.58,
        "end": 127.04,
        "turnIndex": 22
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Покриття тестами: обсяг і терміни не визначені, домовились розглядати після релізу",
      "quote": {
        "text": "Після релізу. Записую як відкрите питання.",
        "speaker": "Олена",
        "start": 78.2,
        "end": 80.66,
        "turnIndex": 14
      }
    },
    {
      "id": "q2",
      "question": "Хто робитиме скриншоти для Store, поки Марина у відпустці, і чи брати підрядника — Олена порахує вартість і скаже завтра",
      "quote": {
        "text": "Давай я подумаю і завтра скажу.",
        "speaker": "Олена",
        "start": 125.24,
        "end": 127.04,
        "turnIndex": 22
      }
    }
  ]
}
```
</details>

## 03-no-conclusion.mp3

STT: з кешу (samples/03-no-conclusion.transcript.json)
LLM: claude-opus-5, effort=medium, 18126 мс, 5765 in / 1214 out
Разом: 18.1 с, $0.0632, $0.0578/хв

- ✅ status = no_commitments (очікувано no_commitments або cannot_conclude)
- ✅ recordingTruncated = true (очікувано true)
- ✅ спікери: Андрій, Наталя (очікувано Андрій, Наталя)
- ✅ INCLUDE-Q q-budget-or-homepage → «Чи є бюджет на переробку головної сторінки…»
- ✅ INCLUDE-Q q-blog → «Що робити з блогом — закривати чи ні…»
- ✅ EXCLUDE no-accepted-at-all — жодної прийнятої задачі
- ✅ EXCLUDE no-cancelled-at-all — нічого не скасовували
- ✅ EXCLUDE no-owner-anywhere — жодного власника

<details><summary>Повна видача</summary>

```json
{
  "status": "no_commitments",
  "statusReason": "Уся розмова складається з припущень і пропозицій («можна було б», «я б подивився»), жодну з них співрозмовник явно не прийняв; власників і дедлайнів не визначено.",
  "recordingTruncated": true,
  "speakers": [
    {
      "label": "speaker_0",
      "name": "Андрій"
    },
    {
      "label": "speaker_1",
      "name": "Наталя"
    }
  ],
  "commitments": [
    {
      "id": "c1",
      "task": "Переробити головну сторінку сайту",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Наталя лише припустила ідею, сама сумнівається в бюджеті й виконавцях; ніхто не взяв задачу",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": "Запропоновано Наталею, Андрій запропонував спершу подивитись статистику, після чого тему відклали («хай поки повисить»)",
      "confidence": "high",
      "quote": {
        "text": "Добре, тоді хай поки повисить.",
        "speaker": "Наталя",
        "start": 41.239,
        "end": 43.059,
        "turnIndex": 9
      }
    },
    {
      "id": "c2",
      "task": "Подивитися статистику відвідуваності головної сторінки",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Андрій сказав «я б спочатку подивився» як припущення; далі виявилось, що невідомо, у кого доступ — у Віки чи Олега",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Не знаю. Треба спитати у Віки. У неї був доступ або в Олега. Я не пам'ятаю, у кого зараз.",
        "speaker": "Андрій",
        "start": 34.18,
        "end": 40.459,
        "turnIndex": 8
      }
    },
    {
      "id": "c3",
      "task": "Закрити блог",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Андрій висловив як варіант і сам не визначився; рішення відкладено",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Я б його або закрив, або... ну, не знаю. Треба подумати.",
        "speaker": "Андрій",
        "start": 49.2,
        "end": 53.5,
        "turnIndex": 10
      }
    },
    {
      "id": "c4",
      "task": "Повернутись до обговорення сайту наступного тижня",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Наталя запропонувала, Андрій відповів невизначено («Може»), зустріч не підтверджена",
      "deadline": {
        "text": "наступного тижня",
        "resolvable": false,
        "note": "відносна дата; дата запису невідома"
      },
      "history": null,
      "confidence": "medium",
      "quote": {
        "text": "Може. Я гляну календар, хоча в мене там, здається, все зайнято",
        "speaker": "Андрій",
        "start": 60.699,
        "end": 64.459,
        "turnIndex": 12
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Хто має доступ до статистики сайту — Віка чи Олег; Андрій казав, що треба спитати",
      "quote": {
        "text": "Треба спитати у Віки. У неї був доступ або в Олега.",
        "speaker": "Андрій",
        "start": 34.979,
        "end": 38.379,
        "turnIndex": 8
      }
    },
    {
      "id": "q2",
      "question": "Чи є бюджет на переробку головної сторінки",
      "quote": {
        "text": "я не знаю, чи є на це бюджет і чи взагалі хтось буде цим займатись",
        "speaker": "Наталя",
        "start": 19.34,
        "end": 23.199,
        "turnIndex": 5
      }
    },
    {
      "id": "q3",
      "question": "Що робити з блогом — закривати чи ні",
      "quote": {
        "text": "Давай подумаємо.",
        "speaker": "Наталя",
        "start": 54.239,
        "end": 55.119,
        "turnIndex": 11
      }
    },
    {
      "id": "q4",
      "question": "Чи відбудеться повторне обговорення наступного тижня — Андрій має подивитись календар",
      "quote": {
        "text": "Я гляну календар, хоча в мене там, здається, все зайнято",
        "speaker": "Андрій",
        "start": 61.359,
        "end": 64.459,
        "turnIndex": 12
      }
    }
  ]
}
```
</details>

---
**35 пройдено, 0 не пройдено.** Разом 59.8 с, $0.2263 за 6.7 хв аудіо = $0.0338/хв.