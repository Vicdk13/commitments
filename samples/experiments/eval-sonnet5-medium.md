# Eval report — 2026-09-14T16:21:16.074Z

## 01-main.mp3

STT: з кешу (samples/01-main.transcript.json)
LLM: claude-sonnet-5, effort=medium, 16159 мс, 6758 in / 1356 out
Разом: 16.2 с, $0.0380, $0.0128/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday — виправлений дедлайн: четвер → п'ятниця → «Виправити дублювання push-сповіщень на Android»
- ✅ INCLUDE dark-theme-cancelled — скасована задача → «Темна тема в цьому релізі»
- ✅ INCLUDE screenshots-no-owner — задача без власника → «Оновити скріншоти в App Store під новий дизайн»
- ✅ INCLUDE auth-not-accepted — пропозиція, яку не прийняли → «Переписати авторизацію на новий SDK»
- ✅ INCLUDE-Q q-release-text → «Хто пише текст опису оновлення для стору — Олена чи маркетинг…»
- ✅ INCLUDE-Q q-banner → «Чи потрібен банер у застосунку про новий реліз…»
- ✅ EXCLUDE no-thursday — старий дедлайн не має лишитись
- ✅ EXCLUDE no-dark-theme-active — скасоване не має бути активним
- ✅ EXCLUDE no-auth-accepted — неприйнята пропозиція не має стати задачею
- ✅ EXCLUDE no-screenshots-owner-dmytro — Дмитро явно відмовився
- ✅ EXCLUDE no-remind — побутове прохання — не робочий комітмент

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "Розмова містить чіткі фінальні домовленості щодо релізу.",
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
        "note": "відносна дата, дата запису невідома"
      },
      "history": "Спершу домовились на четвер, але через демо для інвесторів перенесли на п'ятницю",
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
      "task": "Переписати авторизацію на новий SDK",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Дмитро запропонував ідею, Олена відхилила зараз, повернутись після релізу",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Слухай, я розумію, але не зараз. У нас реліз через два тижні, і я не хочу чіпати авторизацію перед ним. Давай повернемось до цього після релізу.",
        "speaker": "Олена",
        "start": 32.92,
        "end": 42.22,
        "turnIndex": 4
      }
    },
    {
      "id": "c3",
      "task": "Темна тема в цьому релізі",
      "status": "cancelled",
      "owner": null,
      "ownerNote": "Раніше планували включити в реліз, тепер скасовано через обсяг роботи",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": "Спочатку планувалась в цьому релізі, потім скасована через більший обсяг роботи, ніж очікувалось",
      "confidence": "high",
      "quote": {
        "text": "Тоді знаєш що? Давай взагалі знімемо, е, темну тему з цього релізу. Не хочу ризикувати. Скасовуємо.",
        "speaker": "Олена",
        "start": 93.58,
        "end": 99.6,
        "turnIndex": 12
      }
    },
    {
      "id": "c4",
      "task": "Оновити скріншоти в App Store під новий дизайн",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Власника ще не визначено, вирішать після повернення Марини з відпустки",
      "deadline": {
        "text": "до релізу",
        "resolvable": false,
        "note": "дата релізу не вказана в записі"
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
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Хто пише текст опису оновлення для стору — Олена чи маркетинг",
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
      "question": "Чи потрібен банер у застосунку про новий реліз",
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
LLM: claude-sonnet-5, effort=medium, 25317 мс, 6562 in / 2202 out
Разом: 25.3 с, $0.0447, $0.0171/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday → «Зробити push-сповіщення (протестувати на старих версіях Android)»
- ✅ INCLUDE dark-theme-returned — змінена домовленість: повернуто в реліз, дедлайн середа наступного тижня → «Повернути темну тему (основні екрани)»
- ✅ INCLUDE error-texts-no-owner — задача без власника («хтось із команди») → «Привести до ладу тексти помилок у формах (українською/англійською)»
- ✅ INCLUDE release-shift-rejected — пропозиція зсунути реліз відхилена → «Зсунути реліз на тиждень, щоб встигнути з темною темою і тестами»
- ✅ INCLUDE-Q q-tests → «Хто і коли писатиме тести для підвищення покриття (вирішено робити піс…»
- ✅ INCLUDE-Q q-contractor → «Чи брати підрядника для скриншотів у Store, поки Марина у відпустці; О…»
- ✅ EXCLUDE no-sarcastic-tests — САРКАЗМ: «за вечір напишу тести» не є зобов'язанням
- ✅ EXCLUDE no-dark-theme-cancelled — у цьому записі темну тему повернули
- ✅ EXCLUDE no-release-shift-accepted — реліз не рухали
- ✅ EXCLUDE no-error-texts-dmytro — Дмитро відмовився

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "У розмові є кілька чітко прийнятих домовленостей з дедлайнами та відповідальними, а також відкриті питання, які не вирішено.",
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
      "task": "Зробити push-сповіщення (протестувати на старих версіях Android)",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "П'ятниця",
        "resolvable": false,
        "note": "відносна дата, точна дата запису невідома"
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
      "id": "c2",
      "task": "Повернути темну тему (основні екрани)",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "До середи наступного тижня",
        "resolvable": false,
        "note": "відносна дата, точна дата запису невідома"
      },
      "history": "Тему знімали напередодні, але вирішили повернути на прохання Ігоря; налаштування залишаться світлими.",
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
      "task": "Привести до ладу тексти помилок у формах (українською/англійською)",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Власника не визначено, розподілять на стендапі",
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
      "task": "Зсунути реліз на тиждень, щоб встигнути з темною темою і тестами",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Пропозицію відхилено, дата релізу вже озвучена публічно",
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
      "id": "c5",
      "task": "Написати тести на весь проєкт за вечір",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Це був сарказм, не реальна обіцянка",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Ну, звісно. Я за вечір напишу тести на весь проєкт. Що там? Тисяч п'ять рядків? До ранку зроблю. Ага.",
        "speaker": "Дмитро",
        "start": 62.22,
        "end": 68.24,
        "turnIndex": 11
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Хто і коли писатиме тести для підвищення покриття (вирішено робити після релізу, але деталі не визначені)",
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
      "question": "Чи брати підрядника для скриншотів у Store, поки Марина у відпустці; Олена має порахувати вартість і повідомити рішення",
      "quote": {
        "text": "Не знаю. Треба порахувати, скільки це коштуватиме. Давай я подумаю і завтра скажу.",
        "speaker": "Олена",
        "start": 122.58,
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
LLM: claude-sonnet-5, effort=medium, 10391 мс, 5765 in / 545 out
Разом: 10.4 с, $0.0210, $0.0192/хв

- ✅ status = no_commitments (очікувано no_commitments або cannot_conclude)
- ✅ recordingTruncated = true (очікувано true)
- ✅ спікери: Андрій, Наталя (очікувано Андрій, Наталя)
- ✅ INCLUDE-Q q-budget-or-homepage → «Чи варто переробляти головну сторінку сайту — вирішили спочатку подиви…»
- ✅ INCLUDE-Q q-blog → «Що робити з застарілим блогом — закрити чи оновлювати, рішення відклад…»
- ✅ EXCLUDE no-accepted-at-all — жодної прийнятої задачі
- ✅ EXCLUDE no-cancelled-at-all — нічого не скасовували
- ✅ EXCLUDE no-owner-anywhere — жодного власника

<details><summary>Повна видача</summary>

```json
{
  "status": "no_commitments",
  "statusReason": "Розмова складається лише з обговорення ідей (переробка головної сторінки, доля блогу), жодна дія не була прийнята як зобов'язання з чітким власником — усе залишили відкритим або відклали",
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
  "commitments": [],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Чи варто переробляти головну сторінку сайту — вирішили спочатку подивитись статистику відвідувань, але не визначили, хто це зробить (можливо Віка або Олег, які мають доступ)",
      "quote": {
        "text": "Треба спитати у Віки. У неї був доступ або в Олега. Я не пам'ятаю, у кого зараз.",
        "speaker": "Андрій",
        "start": 34.979,
        "end": 40.459,
        "turnIndex": 8
      }
    },
    {
      "id": "q2",
      "question": "Що робити з застарілим блогом — закрити чи оновлювати, рішення відкладено на подумати",
      "quote": {
        "text": "Блог — це взагалі окрема тема. Я б його або закрив, або... ну, не знаю. Треба подумати.",
        "speaker": "Андрій",
        "start": 47.18,
        "end": 53.5,
        "turnIndex": 10
      }
    },
    {
      "id": "q3",
      "question": "Чи повернутись до обговорення сайту наступного тижня, коли з'явиться більше інформації — не підтверджено остаточно",
      "quote": {
        "text": "Може. Я гляну календар, хоча в мене там, здається, все зайнято дооо",
        "speaker": "Андрій",
        "start": 60.699,
        "end": 65.519,
        "turnIndex": 12
      }
    }
  ]
}
```
</details>

---
**35 пройдено, 0 не пройдено.** Разом 51.9 с, $0.1037 за 6.7 хв аудіо = $0.0155/хв.