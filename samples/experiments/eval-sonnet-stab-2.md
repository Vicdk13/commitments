# Eval report — 2026-09-16T10:57:19.495Z

## 01-main.mp3

STT: з кешу (samples/01-main.transcript.json)
LLM: claude-sonnet-5, effort=medium, 22986 мс, 6830 in / 2090 out
Разом: 23.0 с, $0.0455, $0.0153/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday — виправлений дедлайн: четвер → п'ятниця → «Виправити дублювання push-сповіщень на Android»
- ✅ INCLUDE dark-theme-cancelled — скасована задача → «Темна тема в поточному релізі»
- ✅ INCLUDE screenshots-no-owner — задача без власника → «Оновити скріншоти в App Store до релізу»
- ✅ INCLUDE auth-not-accepted — пропозиція, яку не прийняли → «Переписати авторизацію на новий SDK»
- ✅ INCLUDE-Q q-release-text → «Хто писатиме текст опису оновлення для App Store — Олена чи маркетинг?…»
- ✅ INCLUDE-Q q-banner → «Чи потрібен банер у застосунку про новий реліз?…»
- ✅ EXCLUDE no-thursday — старий дедлайн не має лишитись
- ✅ EXCLUDE no-dark-theme-active — скасоване не має бути активним
- ✅ EXCLUDE no-auth-accepted — неприйнята пропозиція не має стати задачею
- ✅ EXCLUDE no-screenshots-owner-dmytro — Дмитро явно відмовився
- ✅ EXCLUDE no-remind — побутове прохання — не робочий комітмент

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "Розмова містить чіткі фінальні домовленості щодо релізу, включно зі скасуванням та відкладеними питаннями.",
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
        "note": "відносна дата; конкретна дата запису невідома"
      },
      "history": "Спочатку домовились зробити до четверга, але через демо для інвесторів у четвер перенесли дедлайн на п'ятницю.",
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
      "task": "Темна тема в поточному релізі",
      "status": "cancelled",
      "owner": null,
      "ownerNote": "Задачу скасовано, тому власник не актуальний.",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": "Раніше планувалась у цьому релізі, Дмитро вже почав роботу, але через обсяг роботи вирішили зняти з релізу і повернутись у наступному.",
      "confidence": "high",
      "quote": {
        "text": "Тоді знаєш що? Давай взагалі знімемо, е, темну тему з цього релізу. Не хочу ризикувати. Скасовуємо. Повернемось у наступному.",
        "speaker": "Олена",
        "start": 93.58,
        "end": 101.02,
        "turnIndex": 12
      }
    },
    {
      "id": "c3",
      "task": "Оновити скріншоти в App Store до релізу",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Власника не призначено; вирішення хто виконуватиме відкладено до повернення Марини з відпустки.",
      "deadline": {
        "text": "до релізу",
        "resolvable": false,
        "note": "конкретна дата релізу в записі не озвучена"
      },
      "history": null,
      "confidence": "medium",
      "quote": {
        "text": "Так, я розумію, що не твоє, але зробити треба. Давай поки залишимо як задачу, а хто робитиме, вирішимо, коли Марина повернеться з відпустки.",
        "speaker": "Олена",
        "start": 118.62,
        "end": 127.32,
        "turnIndex": 16
      }
    },
    {
      "id": "c4",
      "task": "Переписати авторизацію на новий SDK",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Пропозицію відхилено на час до релізу; повернення до теми заплановано після релізу без конкретики.",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Слухай, я розумію, але не зараз. У нас реліз через два тижні, і я не хочу чіпати авторизацію перед ним. Давай повернемось до цього після релізу. Добре?",
        "speaker": "Олена",
        "start": 32.92,
        "end": 42.52,
        "turnIndex": 4
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Хто писатиме текст опису оновлення для App Store — Олена чи маркетинг?",
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
      "question": "Чи потрібен банер у застосунку про новий реліз?",
      "quote": {
        "text": "Подумаю. Добре, давай підсумуємо.",
        "speaker": "Олена",
        "start": 154.3,
        "end": 156.78,
        "turnIndex": 22
      }
    }
  ]
}
```
</details>

## 02-variant.mp3

STT: з кешу (samples/02-variant.transcript.json)
LLM: claude-sonnet-5, effort=medium, 17788 мс, 6634 in / 1636 out
Разом: 17.8 с, $0.0392, $0.0150/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday → «Зробити push-сповіщення (протестувати на старих версіях Android)»
- ✅ INCLUDE dark-theme-returned — змінена домовленість: повернуто в реліз, дедлайн середа наступного тижня → «Повернути темну тему (основні екрани, без налаштувань)»
- ✅ INCLUDE error-texts-no-owner — задача без власника («хтось із команди») → «Привести до ладу тексти помилок у формах (англ./укр.)»
- ✅ INCLUDE release-shift-rejected — пропозиція зсунути реліз відхилена → «Зсунути реліз на тиждень, щоб встигнути з темною темою і тестами»
- ✅ INCLUDE-Q q-tests → «Хто і коли напише тести на проєкт (вирішено робити після релізу, детал…»
- ✅ INCLUDE-Q q-contractor → «Чи брати підрядника для скриншотів у Store, поки Марина у відпустці — …»
- ✅ EXCLUDE no-sarcastic-tests — САРКАЗМ: «за вечір напишу тести» не є зобов'язанням
- ✅ EXCLUDE no-dark-theme-cancelled — у цьому записі темну тему повернули
- ✅ EXCLUDE no-release-shift-accepted — реліз не рухали
- ✅ EXCLUDE no-error-texts-dmytro — Дмитро відмовився

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "У розмові є кілька чітко прийнятих домовленостей, а також відхилені пропозиції та відкриті питання.",
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
        "text": "п'ятниця",
        "resolvable": false,
        "note": "відносна дата; конкретна дата запису невідома"
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
      "task": "Повернути темну тему (основні екрани, без налаштувань)",
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
      "task": "Привести до ладу тексти помилок у формах (англ./укр.)",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Дмитро відмовився брати задачу через завантаженість; вирішено розподілити на стендапі, конкретна людина ще не призначена",
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
      "task": "Написати тести на весь проєкт за вечір / до ранку",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Ірончина пропозиція Дмитра, не є реальним зобов'язанням",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Ну, звісно. Я за вечір напишу тести на весь проєкт. Що там? Тисяч п'ять рядків? До ранку зроблю.",
        "speaker": "Дмитро",
        "start": 62.22,
        "end": 68.02,
        "turnIndex": 11
      }
    },
    {
      "id": "c5",
      "task": "Зсунути реліз на тиждень, щоб встигнути з темною темою і тестами",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Пропозицію відхилено Оленою, дата релізу вже озвучена і залишається незмінною",
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
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Хто і коли напише тести на проєкт (вирішено робити після релізу, деталі не узгоджені)",
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
      "question": "Чи брати підрядника для скриншотів у Store, поки Марина у відпустці — Олена порахує вартість і дасть відповідь завтра",
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
LLM: claude-sonnet-5, effort=medium, 18704 мс, 5837 in / 1557 out
Разом: 18.7 с, $0.0313, $0.0286/хв

- ✅ status = no_commitments (очікувано no_commitments або cannot_conclude)
- ✅ recordingTruncated = true (очікувано true)
- ✅ спікери: Андрій, Наталя (очікувано Андрій, Наталя)
- ✅ INCLUDE-Q q-budget-or-homepage → «Чи будуть Андрій і Наталя повертатись до теми сайту (головна сторінка,…»
- ✅ INCLUDE-Q q-blog → «Чи будуть Андрій і Наталя повертатись до теми сайту (головна сторінка,…»
- ✅ EXCLUDE no-accepted-at-all — жодної прийнятої задачі
- ✅ EXCLUDE no-cancelled-at-all — нічого не скасовували
- ✅ EXCLUDE no-owner-anywhere — жодного власника

<details><summary>Повна видача</summary>

```json
{
  "status": "no_commitments",
  "statusReason": "Жодна з обговорюваних ідей не отримала чіткого прийняття обома сторонами — всі пункти залишились на рівні пропозицій або відкритих питань.",
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
      "ownerNote": "Наталя лише озвучила ідею, не ясно чи є бюджет і хто б цим займався; рішення відкладено («хай поки повисить»)",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
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
      "task": "Перевірити статистику відвідувань сайту перед рішенням про редизайн",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Андрій запропонував ідею, але не назвав виконавця — треба спитати у Віки або Олега, хто саме має доступ, не вирішено",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "medium",
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
      "task": "Закрити або оновити блог",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Андрій не визначився з рішенням щодо блогу, сторони погодились лише подумати над цим",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "medium",
      "quote": {
        "text": "Блог — це взагалі окрема тема. Я б його або закрив, або... ну, не знаю. Треба подумати.",
        "speaker": "Андрій",
        "start": 47.18,
        "end": 53.5,
        "turnIndex": 10
      }
    }
  ],
  "openQuestions": [
    {
      "id": "q1",
      "question": "Чи будуть Андрій і Наталя повертатись до теми сайту (головна сторінка, статистика, блог) наступного тижня, і чи зможе Андрій знайти для цього час у календарі",
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
**35 пройдено, 0 не пройдено.** Разом 59.5 с, $0.1159 за 6.7 хв аудіо = $0.0173/хв.