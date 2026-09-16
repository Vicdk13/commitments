# Eval report — 2026-09-16T10:56:10.854Z

## 01-main.mp3

STT: з кешу (samples/01-main.transcript.json)
LLM: claude-sonnet-5, effort=medium, 17527 мс, 6830 in / 1273 out
Разом: 17.5 с, $0.0373, $0.0125/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday — виправлений дедлайн: четвер → п'ятниця → «Виправити дублювання push-сповіщень на Android»
- ✅ INCLUDE dark-theme-cancelled — скасована задача → «Впровадження темної теми в поточному релізі»
- ✅ INCLUDE screenshots-no-owner — задача без власника → «Оновити скріншоти в App Store під новий дизайн»
- ✅ INCLUDE auth-not-accepted — пропозиція, яку не прийняли → «Переписати авторизацію на новий SDK»
- ✅ INCLUDE-Q q-release-text → «Хто пише текст опису оновлення для релізу — Олена чи маркетинг (Сергій…»
- ✅ INCLUDE-Q q-banner → «Чи робити банер у застосунку про новий реліз…»
- ✅ EXCLUDE no-thursday — старий дедлайн не має лишитись
- ✅ EXCLUDE no-dark-theme-active — скасоване не має бути активним
- ✅ EXCLUDE no-auth-accepted — неприйнята пропозиція не має стати задачею
- ✅ EXCLUDE no-screenshots-owner-dmytro — Дмитро явно відмовився
- ✅ EXCLUDE no-remind — побутове прохання — не робочий комітмент

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "Розмова містить кілька чітких фінальних домовленостей щодо релізу, включно зі скасуванням і відкладеними питаннями.",
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
      "task": "Виправити дублювання push-сповіщень на Android",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "до п'ятниці",
        "resolvable": false,
        "note": "відносна дата; дата запису невідома"
      },
      "history": "Спочатку домовились на четвер, але через демо для інвесторів перенесли на п'ятницю",
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
      "task": "Впровадження темної теми в поточному релізі",
      "status": "cancelled",
      "owner": null,
      "ownerNote": "Задачу скасовано, власник не потрібен",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": "Раніше планували в цьому релізі, Дмитро казав що вже почав, але через обсяг роботи вирішили зняти з релізу",
      "confidence": "high",
      "quote": {
        "text": "Давай взагалі знімемо, е, темну тему з цього релізу. Не хочу ризикувати. Скасовуємо. Повернемось у наступному.",
        "speaker": "Олена",
        "start": 94.26,
        "end": 101.02,
        "turnIndex": 12
      }
    },
    {
      "id": "c3",
      "task": "Переписати авторизацію на новий SDK",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Дмитро лише занотував ідею, роботу відкладено до після релізу",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Давай повернемось до цього після релізу. Добре?",
        "speaker": "Олена",
        "start": 40.36,
        "end": 42.52,
        "turnIndex": 4
      }
    },
    {
      "id": "c4",
      "task": "Оновити скріншоти в App Store під новий дизайн",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Дмитро відмовився, оскільки це не його зона відповідальності; власника призначать після повернення Марини з відпустки",
      "deadline": {
        "text": "до релізу",
        "resolvable": false,
        "note": "відносна дата; точна дата релізу в записі не названа"
      },
      "history": null,
      "confidence": "medium",
      "quote": {
        "text": "Давай поки залишимо як задачу, а хто робитиме, вирішимо, коли Марина повернеться з відпустки.",
        "speaker": "Олена",
        "start": 122.12,
        "end": 127.32,
        "turnIndex": 16
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Хто пише текст опису оновлення для релізу — Олена чи маркетинг (Сергій)",
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
      "question": "Чи робити банер у застосунку про новий реліз",
      "quote": {
        "text": "Текст і банер відкриті.",
        "speaker": "Олена",
        "start": 167.4,
        "end": 168.96,
        "turnIndex": 22
      }
    }
  ]
}
```
</details>

## 02-variant.mp3

STT: з кешу (samples/02-variant.transcript.json)
LLM: claude-sonnet-5, effort=medium, 28832 мс, 6634 in / 2789 out
Разом: 28.8 с, $0.0507, $0.0194/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday → «Завершити push-сповіщення (протестувати на старих версіях Android)»
- ✅ INCLUDE dark-theme-returned — змінена домовленість: повернуто в реліз, дедлайн середа наступного тижня → «Повернути темну тему (основні екрани), налаштування лишаються світлими»
- ✅ INCLUDE error-texts-no-owner — задача без власника («хтось із команди») → «Привести до ладу тексти помилок у формах (уніфікувати мову)»
- ❌ INCLUDE release-shift-rejected — пропозиція зсунути реліз відхилена → НЕ ЗНАЙДЕНО
- ❌ INCLUDE-Q q-tests → НЕ ЗНАЙДЕНО
- ✅ INCLUDE-Q q-contractor → «Чи наймати підрядника для створення скриншотів для Store, поки Марина …»
- ❌ EXCLUDE no-sarcastic-tests — САРКАЗМ: «за вечір напишу тести» не є зобов'язанням → ПОМИЛКОВО Є: «Написати тести для підвищення покриття проєкту» [accepted, null]
- ✅ EXCLUDE no-dark-theme-cancelled — у цьому записі темну тему повернули
- ✅ EXCLUDE no-release-shift-accepted — реліз не рухали
- ✅ EXCLUDE no-error-texts-dmytro — Дмитро відмовився

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "У розмові є кілька чітко підтверджених домовленостей, явно відхилені пропозиції та одне відкрите питання.",
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
      "task": "Завершити push-сповіщення (протестувати на старих версіях Android)",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "п'ятниця",
        "resolvable": false,
        "note": "відносна дата; конкретна дата запису невідома"
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "П'ятниця, так.",
        "speaker": "Дмитро",
        "start": 51.56,
        "end": 52.58,
        "turnIndex": 9
      }
    },
    {
      "id": "c2",
      "task": "Повернути темну тему (основні екрани), налаштування лишаються світлими",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "до середи наступного тижня",
        "resolvable": false,
        "note": "відносна дата; конкретна дата запису невідома"
      },
      "history": null,
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
      "id": "c3",
      "task": "Привести до ладу тексти помилок у формах (уніфікувати мову)",
      "status": "accepted",
      "owner": null,
      "ownerNote": "власника ще не визначено, розподілять на стендапі",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "medium",
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
      "task": "Написати тести для підвищення покриття проєкту",
      "status": "accepted",
      "owner": null,
      "ownerNote": "хто саме писатиме тести, не визначено",
      "deadline": {
        "text": "після релізу",
        "resolvable": false,
        "note": "конкретна дата релізу не озвучена"
      },
      "history": "спершу Дмитро жартома пропонував написати всі тести за вечір, потім домовились відкласти написання тестів на період після релізу",
      "confidence": "medium",
      "quote": {
        "text": "Тести — це окрема історія. Давай після релізу.",
        "speaker": "Дмитро",
        "start": 72.22,
        "end": 77.4,
        "turnIndex": 13
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Чи наймати підрядника для створення скриншотів для Store, поки Марина у відпустці (ще два тижні); Олена обіцяла подумати і дати відповідь завтра",
      "quote": {
        "text": "Треба порахувати, скільки це коштуватиме. Давай я подумаю і завтра скажу.",
        "speaker": "Олена",
        "start": 123.02,
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
LLM: claude-sonnet-5, effort=medium, 19558 мс, 5837 in / 1493 out
Разом: 19.6 с, $0.0306, $0.0280/хв

- ✅ status = no_commitments (очікувано no_commitments або cannot_conclude)
- ✅ recordingTruncated = true (очікувано true)
- ✅ спікери: Андрій, Наталя (очікувано Андрій, Наталя)
- ❌ INCLUDE-Q q-budget-or-homepage → НЕ ЗНАЙДЕНО
- ✅ INCLUDE-Q q-blog → «Що робити з блогом — закрити чи оновлювати — і хто над цим подумає…»
- ✅ EXCLUDE no-accepted-at-all — жодної прийнятої задачі
- ✅ EXCLUDE no-cancelled-at-all — нічого не скасовували
- ✅ EXCLUDE no-owner-anywhere — жодного власника

<details><summary>Повна видача</summary>

```json
{
  "status": "no_commitments",
  "statusReason": "Жодна ідея не була остаточно прийнята обома сторонами: переробку сторінки відклали, перевірку статистики не призначили нікому конкретному, а рішення щодо блогу та наступної зустрічі лишились відкритими й розмова обірвалась на середині слова.",
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
      "ownerNote": "Ніхто не взяв задачу на себе; вирішили відкласти до з'ясування статистики та бюджету",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": "Наталя запропонувала переробку (репліка 5), Андрій запропонував спершу перевірити статистику (репліка 6), після чого Наталя сказала лишити це поки що (репліка 9)",
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
      "task": "Перевірити статистику відвідувань головної сторінки",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Не визначено, хто це зробить — Андрій не пам'ятає, у Віки чи Олега зараз доступ",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "medium",
      "quote": {
        "text": "Треба спитати у Віки. У неї був доступ або в Олега. Я не пам'ятаю, у кого зараз.",
        "speaker": "Андрій",
        "start": 34.979,
        "end": 40.459,
        "turnIndex": 8
      }
    },
    {
      "id": "c3",
      "task": "Провести повторну розмову про сайт наступного тижня",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Обидва відповіли невизначено («Може»), чіткої згоди не було",
      "deadline": {
        "text": "наступного тижня",
        "resolvable": false,
        "note": "відносна дата, точна дата запису невідома"
      },
      "history": null,
      "confidence": "low",
      "quote": {
        "text": "Може. Я гляну календар, хоча в мене там, здається, все зайнято дооо",
        "speaker": "Андрій",
        "start": 60.699,
        "end": 65.519,
        "turnIndex": 12
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Що робити з блогом — закрити чи оновлювати — і хто над цим подумає",
      "quote": {
        "text": "Блог — це взагалі окрема тема. Я б його або закрив, або... ну, не знаю. Треба подумати.",
        "speaker": "Андрій",
        "start": 47.18,
        "end": 53.5,
        "turnIndex": 10
      }
    }
  ]
}
```
</details>

---
**31 пройдено, 4 не пройдено.** Разом 65.9 с, $0.1187 за 6.7 хв аудіо = $0.0177/хв.