# Eval report — 2026-09-14T17:40:16.602Z

## 01-main.mp3

STT: з кешу (samples/01-main.transcript.json)
LLM: claude-sonnet-5, effort=medium, 16181 мс, 6758 in / 1370 out
Разом: 16.2 с, $0.0381, $0.0128/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday — виправлений дедлайн: четвер → п'ятниця → «Виправити дублювання push-сповіщень на Android (проблема з підпискою на топік)»
- ✅ INCLUDE dark-theme-cancelled — скасована задача → «Темна тема в поточному релізі»
- ✅ INCLUDE screenshots-no-owner — задача без власника → «Оновити скріншоти в App Store під новий дизайн»
- ✅ INCLUDE auth-not-accepted — пропозиція, яку не прийняли → «Переписати авторизацію на новий SDK»
- ✅ INCLUDE-Q q-release-text → «Хто напише текст опису оновлення для App Store — Олена чи маркетинг (С…»
- ✅ INCLUDE-Q q-banner → «Чи робити банер у застосунку про новий реліз?…»
- ✅ EXCLUDE no-thursday — старий дедлайн не має лишитись
- ✅ EXCLUDE no-dark-theme-active — скасоване не має бути активним
- ✅ EXCLUDE no-auth-accepted — неприйнята пропозиція не має стати задачею
- ✅ EXCLUDE no-screenshots-owner-dmytro — Дмитро явно відмовився
- ✅ EXCLUDE no-remind — побутове прохання — не робочий комітмент

<details><summary>Повна видача</summary>

```json
{
  "status": "ok",
  "statusReason": "Розмова містить чіткі фінальні домовленості щодо релізу, зафіксовані в підсумку обома сторонами.",
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
      "task": "Виправити дублювання push-сповіщень на Android (проблема з підпискою на топік)",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "до п'ятниці",
        "resolvable": false,
        "note": "відносна дата; дата запису невідома"
      },
      "history": "Спочатку домовились до четверга, але через демо для інвесторів у четвер перенесли на п'ятницю.",
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
      "ownerNote": "Задачу скасовано повністю, перенесено на наступний реліз, власник не потрібен.",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": "Раніше планувалась у цьому релізі, Дмитро вже почав роботу, але через обсяг роботи вирішили зняти з релізу.",
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
      "task": "Переписати авторизацію на новий SDK",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Дмитро лише занотував ідею собі, Олена відмовилась чіпати авторизацію перед релізом.",
      "deadline": {
        "text": null,
        "resolvable": false,
        "note": null
      },
      "history": null,
      "confidence": "high",
      "quote": {
        "text": "Не зараз. У нас реліз через два тижні, і я не хочу чіпати авторизацію перед ним. Давай повернемось до цього після релізу.",
        "speaker": "Олена",
        "start": 34.64,
        "end": 42.22,
        "turnIndex": 4
      }
    },
    {
      "id": "c4",
      "task": "Оновити скріншоти в App Store під новий дизайн",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Власника не визначено; вирішено призначити відповідального, коли Марина повернеться з відпустки.",
      "deadline": {
        "text": "до релізу",
        "resolvable": false,
        "note": "відносна дата; конкретна дата запису невідома"
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
      "question": "Хто напише текст опису оновлення для App Store — Олена чи маркетинг (Сергій)?",
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
      "question": "Чи робити банер у застосунку про новий реліз?",
      "quote": {
        "text": "Мені здається, не потрібно. Але це вже ти вирішуй.",
        "speaker": "Дмитро",
        "start": 151.12,
        "end": 153.64,
        "turnIndex": 21
      }
    }
  ]
}
```
</details>

## 02-variant.mp3

STT: з кешу (samples/02-variant.transcript.json)
LLM: claude-sonnet-5, effort=medium, 21728 мс, 6562 in / 1964 out
Разом: 21.7 с, $0.0423, $0.0162/хв

- ✅ status = ok (очікувано ok)
- ✅ recordingTruncated = false (очікувано false)
- ✅ спікери: Олена, Дмитро (очікувано Олена, Дмитро)
- ✅ INCLUDE push-friday → «Завершити push-сповіщення (протестувати на старих версіях Android)»
- ✅ INCLUDE dark-theme-returned — змінена домовленість: повернуто в реліз, дедлайн середа наступного тижня → «Зробити темну тему (лише основні екрани)»
- ✅ INCLUDE error-texts-no-owner — задача без власника («хтось із команди») → «Привести до ладу тексти помилок у формах (англійська/українська)»
- ✅ INCLUDE release-shift-rejected — пропозиція зсунути реліз відхилена → «Зсунути реліз на тиждень, щоб встигнути з темною темою і тестами»
- ✅ INCLUDE-Q q-tests → «Коли і хто саме писатиме реальні тести після релізу…»
- ✅ INCLUDE-Q q-contractor → «Чи брати підрядника для скриншотів у Store (Марина у відпустці ще два …»
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
      "task": "Зробити темну тему (лише основні екрани)",
      "status": "accepted",
      "owner": "Дмитро",
      "ownerNote": null,
      "deadline": {
        "text": "до середи наступного тижня",
        "resolvable": false,
        "note": "відносна дата; дата запису невідома"
      },
      "history": "Тему темну спочатку зняли напередодні, потім повернули за проханням Ігоря; домовились, що готові будуть лише основні екрани, налаштування лишаться світлими",
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
      "task": "Завершити push-сповіщення (протестувати на старих версіях Android)",
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
      "task": "Привести до ладу тексти помилок у формах (англійська/українська)",
      "status": "accepted",
      "owner": null,
      "ownerNote": "Дмитро відмовився брати задачу через завантаженість; вирішили призначити виконавця пізніше на стендапі, без конкретного імені",
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
      "task": "Написати тести на весь проєкт за вечір / до ранку",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Це була іронічна репліка Дмитра, не реальна обіцянка",
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
    },
    {
      "id": "c5",
      "task": "Зсунути реліз на тиждень, щоб встигнути з темною темою і тестами",
      "status": "proposed_not_accepted",
      "owner": null,
      "ownerNote": "Дмитро запропонував, Олена відмовила — дата релізу вже оголошена",
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
      "question": "Коли і хто саме писатиме реальні тести після релізу",
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
      "question": "Чи брати підрядника для скриншотів у Store (Марина у відпустці ще два тижні), скільки це коштуватиме",
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
LLM: claude-sonnet-5, effort=medium, 8331 мс, 5765 in / 531 out
Разом: 8.3 с, $0.0208, $0.0191/хв

- ✅ status = no_commitments (очікувано no_commitments або cannot_conclude)
- ✅ recordingTruncated = true (очікувано true)
- ✅ спікери: Андрій, Наталя (очікувано Андрій, Наталя)
- ✅ INCLUDE-Q q-budget-or-homepage → «Чи варто переробляти головну сторінку сайту — залежить від статистики …»
- ✅ INCLUDE-Q q-blog → «Що робити з блогом — закрити чи оновлювати, рішення відкладено на поду…»
- ✅ EXCLUDE no-accepted-at-all — жодної прийнятої задачі
- ✅ EXCLUDE no-cancelled-at-all — нічого не скасовували
- ✅ EXCLUDE no-owner-anywhere — жодного власника

<details><summary>Повна видача</summary>

```json
{
  "status": "no_commitments",
  "statusReason": "Розмова містить лише пропозиції та обговорення без прийнятих зобов'язань: жодна дія не була остаточно закріплена за конкретною особою чи датою.",
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
      "question": "Чи варто переробляти головну сторінку сайту — залежить від статистики відвідувань, яку ще треба подивитись (хто саме — Віка чи Олег, не визначено).",
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
      "question": "Що робити з блогом — закрити чи оновлювати, рішення відкладено на подумати.",
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
      "question": "Чи збиратись повторно наступного тижня для обговорення сайту й блогу.",
      "quote": {
        "text": "Давай подумаємо. Може, наступного тижня ще раз беремось, як буде більше інформації?",
        "speaker": "Наталя",
        "start": 54.239,
        "end": 59.939,
        "turnIndex": 11
      }
    }
  ]
}
```
</details>

---
**35 пройдено, 0 не пройдено.** Разом 46.2 с, $0.1013 за 6.7 хв аудіо = $0.0152/хв.