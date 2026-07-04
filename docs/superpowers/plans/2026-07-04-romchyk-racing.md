# «Ромчик-Гонщик» — план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Дитяча браузерна псевдо-3D гра-гонка для 4-річного Ромчика, в якій неможливо програти, з адаптивними вправами на українські букви, цифри та арифметику; грається за посиланням GitHub Pages з телефону і комп'ютера.

**Architecture:** Vanilla JS + Canvas 2D без залежностей і збірки; класичні `<script src>` у глобальний неймспейс `RG` (працює через `file://`). Псевдо-3D дорога — сегментна проєкція в стилі OutRun; чиста логіка (навчання, дорога, події) тестується в Node без фреймворків; DOM-оверлеї для екранів і завдань; PWA (manifest + service worker) для офлайну на телефоні.

**Tech Stack:** HTML5 Canvas 2D, Web Audio API (синтезовані звуки), Web Speech API (українська озвучка), localStorage, Service Worker, GitHub Pages. Тести: чистий Node (`node tests/all.js`). Специфікація: `docs/superpowers/specs/2026-07-04-romchyk-racing-design.md`.

## Global Constraints

- НУЛЬ залежностей, НУЛЬ кроку збірки, нуль зовнішніх запитів (без CDN, шрифтів, трекінгу).
- Класичні `<script src>`, НЕ ES-модулі — гра відкривається подвійним кліком по `index.html` через `file://`.
- Порядок скриптів у index.html (строго): `utils.js, learning.js, audio.js, sprites.js, road.js, tracks.js, race.js, events.js, screens.js, main.js`.
- Спільний boilerplate модуля: `(function (root) { 'use strict'; const m = {}; …; root.<name> = m; if (typeof module !== 'undefined' && module.exports) module.exports = m; })(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});`
- Неможливо програти: без таймерів, «game over», життів; помилка — лагідне «Спробуй ще!»; на фініші завжди свято.
- Керування: палець (pointer events, машинка їде до пальця) + клавіатура ← →/A/D; авто-газ.
- Тести: `node tests/<name>.test.js` → останній рядок `OK: N checks`, exit 0; агрегатор `node tests/all.js` (лічильник кумулятивний по всіх файлах).
- Стиль коду: 2 пробіли, одинарні лапки, крапка з комою, const/let; проза українською, ідентифікатори англійською, UI-рядки українською.
- Шрифт UI: `"Chalkboard SE","Comic Sans MS",cursive,sans-serif`.
- Ключі localStorage: `rg_progress`, `rg_muted`; версія кешу SW: `rg-v1`; шляхи в SW — ТІЛЬКИ відносні (`./…`) — гра живе в підкаталозі GitHub Pages.
- Коміт наприкінці кожної задачі (повідомлення вказані в задачах).

---

---

### Task 1: Каркас проєкту: index.html, стилі, utils, ігровий цикл

Перша задача проєкту «Ромчик-Гонщик» — дитячої браузерної гри-гонки на Vanilla JS + Canvas 2D, БЕЗ залежностей, БЕЗ кроку збірки, БЕЗ зовнішніх запитів. Гра має відкриватися подвійним кліком по `index.html` через `file://`, тому всі скрипти — класичні `<script src>` (НЕ ES-модулі, без import/export у браузерних файлах). Репозиторій уже ініціалізовано (`git init` зроблено), працюємо в корені проєкту.

Стиль коду всюди: 2 пробіли відступу, одинарні лапки, крапка з комою, `const`/`let`.

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/utils.js`
- Create: `js/main.js` (заглушка: канвас, resize, rAF-цикл, градієнт неба, напис по центру)
- Create: `tests/t.js` (тестовий хелпер)
- Create: `tests/utils.test.js`
- Create: `tests/all.js` (агрегатор усіх тестів)
- Create: `.nojekyll` (порожній файл для GitHub Pages)
- Create: `README.md` (заготовка)

**Interfaces:**

*Consumes:* нічого — це перша задача.

*Produces (використовуватимуть усі наступні задачі):*
- Модуль `RG.utils` (у браузері — глобальний `window.RG.utils`; у Node — `const utils = require('../js/utils.js');`):
  - `utils.clamp(v, min, max) -> number`
  - `utils.lerp(a, b, t) -> number`
  - `utils.easeInOut(t) -> number` — формула `-Math.cos(t * Math.PI) / 2 + 0.5`
  - `utils.randInt(min, max, rng) -> int` — включно з обох боків; `rng` — опційна функція типу `Math.random` (за замовчуванням `Math.random`)
  - `utils.pick(arr, rng) -> element`
  - `utils.shuffle(arr, rng) -> Array` — повертає НОВИЙ масив, джерело не мутує
  - `utils.fmt(template, map) -> string` — `fmt('Привіт, {name}!', {name:'Ромчик'})` → `'Привіт, Ромчик!'`
- Тестовий хелпер `tests/t.js`: `const { check, done } = require('./t.js');` — `check(name, cond)` рахує перевірки і при провалі друкує `FAIL: <name>` та ставить `process.exitCode = 1`; `done()` друкує підсумок `OK: N checks` або `FAILED: N checks`.
- Раннер `tests/all.js` — кожна наступна задача, що додає тест, дописує в нього свій рядок `require('./<name>.test.js');`.
- `index.html` зі скелетом `<canvas id="game"></canvas><div id="ui"></div>`; Task 10 допише решту `<script src>`.
- `css/style.css` з базовими стилями (канвас на весь екран, `#ui` — оверлей); Task 9 доповнюватиме.
- `js/main.js` — тимчасова заглушка, Task 10 замінить її повністю.

**Кроки:**

- [ ] **Крок 1: Створити структуру тек і тестовий хелпер tests/t.js**

```bash
mkdir -p css js tests
```

Файл `tests/t.js` (точний код, без змін):

```js
let n = 0;
function check(name, cond) {
  n++;
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; }
}
function done() {
  console.log((process.exitCode ? 'FAILED' : 'OK') + ': ' + n + ' checks');
}
module.exports = { check, done };
```

- [ ] **Крок 2: Написати тест tests/utils.test.js, що падає**

Тести детерміновані: випадковість підміняється сідованим генератором `seededRng`.

```js
const { check, done } = require('./t.js');
const utils = require('../js/utils.js');

function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// clamp
check('clamp: значення у межах', utils.clamp(5, 0, 10) === 5);
check('clamp: нижче min', utils.clamp(-3, 0, 10) === 0);
check('clamp: вище max', utils.clamp(42, 0, 10) === 10);

// lerp
check('lerp: t=0 -> a', utils.lerp(2, 10, 0) === 2);
check('lerp: t=1 -> b', utils.lerp(2, 10, 1) === 10);
check('lerp: t=0.5 -> середина', utils.lerp(2, 10, 0.5) === 6);

// easeInOut
check('easeInOut: 0 -> 0', Math.abs(utils.easeInOut(0) - 0) < 1e-9);
check('easeInOut: 1 -> 1', Math.abs(utils.easeInOut(1) - 1) < 1e-9);
check('easeInOut: 0.5 -> 0.5', Math.abs(utils.easeInOut(0.5) - 0.5) < 1e-9);
check('easeInOut: симетрія навколо центру',
  Math.abs(utils.easeInOut(0.25) + utils.easeInOut(0.75) - 1) < 1e-9);

// randInt
const rng = seededRng(1);
let allIn = true, sawMin = false, sawMax = false;
for (let i = 0; i < 200; i++) {
  const v = utils.randInt(2, 5, rng);
  if (v < 2 || v > 5 || v !== Math.floor(v)) allIn = false;
  if (v === 2) sawMin = true;
  if (v === 5) sawMax = true;
}
check('randInt: цілі числа у діапазоні', allIn);
check('randInt: досягає min', sawMin);
check('randInt: досягає max (включно)', sawMax);
check('randInt: min === max', utils.randInt(7, 7, rng) === 7);

// pick
const letters = ['а', 'б', 'в'];
let pickOk = true;
for (let i = 0; i < 50; i++) {
  if (letters.indexOf(utils.pick(letters, rng)) === -1) pickOk = false;
}
check('pick: завжди елемент масиву', pickOk);
check('pick: масив з одного елемента', utils.pick(['х'], rng) === 'х');

// shuffle
const src = [1, 2, 3, 4, 5];
const shuffled = utils.shuffle(src, rng);
check('shuffle: повертає НОВИЙ масив', shuffled !== src);
check('shuffle: джерело не змінене', src.join(',') === '1,2,3,4,5');
check('shuffle: та сама довжина', shuffled.length === 5);
check('shuffle: ті самі елементи', shuffled.slice().sort().join(',') === '1,2,3,4,5');

// fmt
check('fmt: підстановка імені',
  utils.fmt('Привіт, {name}!', { name: 'Ромчик' }) === 'Привіт, Ромчик!');
check('fmt: кілька ключів',
  utils.fmt('{a} + {b} = ?', { a: 2, b: 3 }) === '2 + 3 = ?');
check('fmt: повторення ключа', utils.fmt('{x}-{x}', { x: 'ту' }) === 'ту-ту');
check('fmt: рядок без плейсхолдерів', utils.fmt('Фініш!', {}) === 'Фініш!');

done();
```

- [ ] **Крок 3: Запустити тест і переконатися, що він падає**

```bash
node tests/utils.test.js
```

Очікуваний результат: помилка `Error: Cannot find module '../js/utils.js'`, exit code 1 (`echo $?` → `1`). Файла ще немає — тест чесно падає.

- [ ] **Крок 4: Мінімальна реалізація js/utils.js**

Кожен js-файл проєкту огортається спільним boilerplate: у браузері модуль стає `window.RG.utils`, у Node — експортується через `module.exports`. Точний код файлу:

```js
(function (root) {
  'use strict';
  const utils = {};

  utils.clamp = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
  };

  utils.lerp = function (a, b, t) {
    return a + (b - a) * t;
  };

  utils.easeInOut = function (t) {
    return -Math.cos(t * Math.PI) / 2 + 0.5;
  };

  utils.randInt = function (min, max, rng) {
    const r = rng || Math.random;
    return min + Math.floor(r() * (max - min + 1));
  };

  utils.pick = function (arr, rng) {
    return arr[utils.randInt(0, arr.length - 1, rng)];
  };

  utils.shuffle = function (arr, rng) {
    const r = rng || Math.random;
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  };

  utils.fmt = function (template, map) {
    return template.replace(/\{(\w+)\}/g, function (m, key) {
      return key in map ? String(map[key]) : m;
    });
  };

  root.utils = utils;
  if (typeof module !== 'undefined' && module.exports) module.exports = utils;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 5: Запустити тест і переконатися, що він проходить**

```bash
node tests/utils.test.js
```

Очікуваний результат: `OK: 24 checks`, exit code 0.

- [ ] **Крок 6: Створити раннер tests/all.js і перевірити його**

Файл `tests/all.js` (наступні задачі дописуватимуть сюди свої require):

```js
// Агрегатор усіх тестів: кожна задача, що додає тест, дописує сюди свій require.
require('./utils.test.js');
```

Запуск:

```bash
node tests/all.js
```

Очікуваний результат: `OK: 24 checks`, exit code 0.

- [ ] **Крок 7: Створити index.html**

Титул сторінки — «Ромчик-Гонщик 🏎️». Підключаємо лише два скрипти, що вже існують (повний список у правильному порядку допише Task 10). Посилання на `manifest.json` та `assets/icon-180.png` додаємо одразу — самі файли з'являться в задачі PWA, до того часу 404 на них у консолі є очікуваним і нешкідливим.

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
  <meta name="theme-color" content="#4FC3F7">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="assets/icon-180.png">
  <link rel="stylesheet" href="css/style.css">
  <title>Ромчик-Гонщик 🏎️</title>
</head>
<body>
  <canvas id="game"></canvas>
  <div id="ui"></div>
  <script src="js/utils.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Крок 8: Створити css/style.css**

Канвас на весь екран; `#ui` — прозорий оверлей поверх канваса, який сам по собі не ловить дотики (`pointer-events: none`), але його дочірні екрани вмикають `pointer-events: auto`. Шрифт UI проєкту: `"Chalkboard SE","Comic Sans MS",cursive,sans-serif`.

```css
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  background: #000;
  font-family: "Chalkboard SE", "Comic Sans MS", cursive, sans-serif;
}

#game {
  display: block;
  width: 100%;
  height: 100%;
}

#ui {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

#ui > * {
  pointer-events: auto;
}
```

- [ ] **Крок 9: Створити заглушку js/main.js — канвас, resize, rAF-цикл**

Заглушка малює градієнт неба і напис «Ромчик-Гонщик 🏎️» по центру канваса. Уже тут закладаємо правильний цикл: resize з урахуванням `devicePixelRatio` (обмеження 2) і rAF із `dt = clamp(мс/1000, 0, 0.05)` через `utils.clamp` — це перевіряє, що модулі бачать одне одного через глобальний `RG`. Task 10 замінить цей файл повністю.

```js
(function (root) {
  'use strict';
  const main = {};

  root.main = main;
  if (typeof module !== 'undefined' && module.exports) module.exports = main;
  if (typeof window === 'undefined') return;

  const utils = root.utils;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#4FC3F7');
    sky.addColorStop(1, '#B3E5FC');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const title = 'Ромчик-Гонщик 🏎️';
    const fontSize = Math.round(utils.clamp(width * 0.08, 24, 64));
    ctx.font = 'bold ' + fontSize + 'px "Chalkboard SE", "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#01579B';
    ctx.strokeText(title, width / 2, height / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(title, width / 2, height / 2);
  }

  let lastTime = 0;

  function frame(time) {
    const dt = utils.clamp((time - lastTime) / 1000, 0, 0.05);
    lastTime = time;
    void dt; // ігрова логіка з'явиться в наступних задачах
    draw();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 10: Ручна перевірка в браузері**

Запустити локальний сервер з кореня проєкту:

```bash
python3 -m http.server 8080
```

Відкрити `http://localhost:8080/` у браузері. Перевірити:
1. Весь екран залито блакитним градієнтом неба (світлішає донизу).
2. По центру — білий напис із темно-синьою обводкою «Ромчик-Гонщик 🏎️».
3. При зміні розміру вікна канвас миттєво підлаштовується, напис лишається по центру.
4. У консолі DevTools немає помилок JS. Допустимі лише два 404: `manifest.json` та `assets/icon-180.png` (з'являться в задачі PWA).
5. Додатково: зупинити сервер (Ctrl+C) і відкрити `index.html` подвійним кліком (через `file://`) — сторінка виглядає так само.

- [ ] **Крок 11: Створити .nojekyll і README.md**

`.nojekyll` — порожній файл (щоб GitHub Pages віддавав файли як є, без Jekyll):

```bash
touch .nojekyll
```

`README.md`:

```markdown
# Ромчик-Гонщик 🏎️

Дитяча браузерна гра-гонка для вивчення українських букв, цифр та арифметики.

**Статус: в розробці.**
```

- [ ] **Крок 12: Фінальний прогін тестів і коміт**

```bash
node tests/all.js
```

Очікуваний результат: `OK: 24 checks`, exit code 0.

```bash
git add index.html css/style.css js/utils.js js/main.js tests/t.js tests/utils.test.js tests/all.js .nojekyll README.md
git commit -m "feat: каркас проєкту, utils, ігровий цикл"
```

Очікуваний результат: коміт створено, у ньому 9 нових файлів.

---

### Task 2: learning.js — навчальна логіка з адаптивністю

Чиста логіка навчальної системи гри: структура прогресу дитини, генератори завдань (ворота знань на ходу, завдання на сюжетних зупинках), адаптивні рівні складності, зірочки, наліпки та серіалізація для localStorage. Модуль НЕ торкається DOM і Canvas — повністю тестується в Node. Робота ведеться в корені репозиторію `romchyk-racing` (git уже ініціалізовано, Task 1 виконано). Повний TDD: спершу тест, що падає, потім мінімальна реалізація.

**Files:**
- Create: `js/learning.js`
- Create: `tests/learning.test.js`
- Modify: `tests/all.js` (додати require нового тесту)
- Test: `tests/learning.test.js`

**Interfaces:**

*Consumes (створено в Task 1):*
- `js/utils.js` (у Node: `require('./utils.js')`; у браузері: `RG.utils`):
  - `clamp(v, min, max) -> number`
  - `randInt(min, max, rng) -> int` (включно; `rng` — функція типу Math.random)
  - `pick(arr, rng) -> element`
  - `shuffle(arr, rng) -> НОВИЙ масив`
  - `fmt(template, map) -> string` — `fmt('Привіт, {name}!', {name:'Ромчик'})`
- `tests/t.js`: `check(name, cond)`, `done()` — вивід успіху `OK: N checks`, exit 0.

*Produces (використовують Task 8 events.js, Task 9 screens.js, Task 10 main.js):*
- `learning.createProgress() -> Progress`, де Progress = `{v:1, letters:{level,streak}, numbers:{level,streak}, math:{level,streak}, stars:0, stickers:[]}`
- `learning.LETTER_POOLS` — 8 кумулятивних рівнів букв; `learning.MAX_LEVEL = {letters:7, numbers:3, math:3}`
- `learning.numberMax(level) -> int` — 0→3, 1→5, 2→7, 3→10
- `learning.mathUnlocked(progress) -> bool` — true, коли `numbers.level >= 2`
- `learning.makeGateTask(progress, rng) -> {kind:'letter'|'number', skill:'letters'|'numbers', prompt, say, options:[{text:string, correct:bool}]}` — рівно одна опція correct
- `learning.makeStopTask(progress, context, rng) -> {kind:'count'|'letter'|'math', skill, prompt, say, visual, options}` — context ∈ `'train'|'police'|'roadwork'`; visual — `{emoji, count}` / `{emoji, count, emoji2, count2}` / `null`
- `learning.applyAnswer(progress, skill, correct)` — мутує progress (адаптивність)
- `learning.awardStar(progress)`; `learning.STICKERS` (24 шт); `learning.awardSticker(progress) -> sticker|null`
- `learning.serialize(progress) -> string`; `learning.deserialize(str|null) -> Progress` (безпечний merge з дефолтами)

Усі генератори приймають опційний `rng` (функція 0..1) для детермінованих тестів; без нього — `Math.random`.

- [ ] **Крок 1: написати тести createProgress і констант (падають)**

Створи `tests/learning.test.js`:

```js
const { check, done } = require('./t.js');
const learning = require('../js/learning.js');

function seqRng(values) {
  let i = 0;
  return () => { const v = values[i % values.length]; i += 1; return v; };
}

// --- createProgress і константи ---
const p1 = learning.createProgress();
check('createProgress: v = 1', p1.v === 1);
check('createProgress: letters 0/0', p1.letters.level === 0 && p1.letters.streak === 0);
check('createProgress: numbers 0/0', p1.numbers.level === 0 && p1.numbers.streak === 0);
check('createProgress: math 0/0', p1.math.level === 0 && p1.math.streak === 0);
check('createProgress: stars 0, stickers []', p1.stars === 0 && Array.isArray(p1.stickers) && p1.stickers.length === 0);
check('LETTER_POOLS: 8 рівнів', learning.LETTER_POOLS.length === 8);
check('LETTER_POOLS: рівень 0 = Р,М,А', learning.LETTER_POOLS[0].join('') === 'РМА');
check('MAX_LEVEL: 7/3/3', learning.MAX_LEVEL.letters === 7 && learning.MAX_LEVEL.numbers === 3 && learning.MAX_LEVEL.math === 3);
check('numberMax: 3,5,7,10', learning.numberMax(0) === 3 && learning.numberMax(1) === 5 && learning.numberMax(2) === 7 && learning.numberMax(3) === 10);
check('mathUnlocked: false на старті', learning.mathUnlocked(p1) === false);

done();
```

- [ ] **Крок 2: запустити, переконатися що падає** — `node tests/learning.test.js` → `Error: Cannot find module '../js/learning.js'`, exit code ≠ 0.

- [ ] **Крок 3: створити js/learning.js — прогрес і константи**

```js
(function (root) {
  'use strict';
  const utils = (typeof require !== 'undefined') ? require('./utils.js') : root.utils;
  const learning = {};

  learning.LETTER_POOLS = [
    ['Р', 'М', 'А'], ['Т', 'О', 'С', 'І'], ['В', 'Н', 'К', 'У'],
    ['Д', 'Е', 'И', 'Л'], ['Б', 'Г', 'П', 'З'], ['Ж', 'Ч', 'Ш', 'Х'],
    ['Й', 'Ф', 'Ц', 'Щ', 'Є'], ['Ю', 'Я', 'Ї', 'Ь', 'Ґ']
  ];

  learning.MAX_LEVEL = { letters: 7, numbers: 3, math: 3 };

  learning.createProgress = function () {
    return {
      v: 1,
      letters: { level: 0, streak: 0 },
      numbers: { level: 0, streak: 0 },
      math:    { level: 0, streak: 0 },
      stars: 0,
      stickers: []
    };
  };

  learning.numberMax = function (level) {
    return [3, 5, 7, 10][utils.clamp(level, 0, 3)];
  };

  learning.mathUnlocked = function (progress) {
    return progress.numbers.level >= 2;
  };

  root.learning = learning;
  if (typeof module !== 'undefined' && module.exports) module.exports = learning;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 4: запустити, переконатися що проходить** — `node tests/learning.test.js` → `OK: 10 checks`, exit 0.

- [ ] **Крок 5: написати тести makeGateTask (падають)**

Встав у `tests/learning.test.js` ПЕРЕД рядком `done();`:

```js
// --- makeGateTask ---
const p2 = learning.createProgress();
const g1 = learning.makeGateTask(p2, seqRng([0.1, 0.5, 0.3, 0.7, 0.2]));
check('gate: rng<0.5 -> буква', g1.kind === 'letter' && g1.skill === 'letters');
check('gate: 2 опції букв на рівні 0', g1.options.length === 2);
check('gate: рівно одна правильна', g1.options.filter((o) => o.correct).length === 1);
check('gate: опції з пулу рівня 0', g1.options.every((o) => learning.LETTER_POOLS[0].indexOf(o.text) >= 0));
const gTarget = g1.options.filter((o) => o.correct)[0].text;
check('gate: say містить ціль', g1.say.indexOf(gTarget) >= 0);
p2.letters.level = 2;
const g2 = learning.makeGateTask(p2, seqRng([0.1, 0.5, 0.3, 0.7, 0.2]));
check('gate: 3 опції букв на рівні 2', g2.options.length === 3);
const cum = learning.LETTER_POOLS[0].concat(learning.LETTER_POOLS[1], learning.LETTER_POOLS[2]);
check('gate: дистрактори з кумулятивних пулів', g2.options.every((o) => cum.indexOf(o.text) >= 0));
check('gate: ціль з поточного пулу', learning.LETTER_POOLS[2].indexOf(g2.options.filter((o) => o.correct)[0].text) >= 0);
const g3 = learning.makeGateTask(p2, seqRng([0.9, 0.4, 0.6, 0.2, 0.8]));
check('gate: rng>=0.5 -> цифра', g3.kind === 'number' && g3.skill === 'numbers');
check('gate: 2 опції цифр на рівні 0', g3.options.length === 2);
check('gate: одна правильна цифра', g3.options.filter((o) => o.correct).length === 1);
check('gate: цифри в діапазоні рівня', g3.options.every((o) => Number(o.text) >= 1 && Number(o.text) <= learning.numberMax(p2.numbers.level)));
```

- [ ] **Крок 6: запустити, переконатися що падає** — `node tests/learning.test.js` → `TypeError: learning.makeGateTask is not a function`, exit ≠ 0.

- [ ] **Крок 7: реалізувати makeGateTask і хелпери**

Додай у `js/learning.js` ПЕРЕД рядком `root.learning = learning;`:

```js
  function cumulativeLetters(level) {
    let all = [];
    for (let i = 0; i <= level; i++) all = all.concat(learning.LETTER_POOLS[i]);
    return all;
  }

  function letterOptions(progress, count, rng) {
    const level = progress.letters.level;
    const target = utils.pick(learning.LETTER_POOLS[level], rng);
    const pool = cumulativeLetters(level).filter(function (ch) { return ch !== target; });
    const distractors = utils.shuffle(pool, rng).slice(0, count - 1);
    const options = [{ text: target, correct: true }];
    for (let i = 0; i < distractors.length; i++) {
      options.push({ text: distractors[i], correct: false });
    }
    return { target: target, options: utils.shuffle(options, rng) };
  }

  function numberOptions(answer, rng) {
    const values = answer <= 1 ? [1, 2, 3] : [answer - 1, answer, answer + 1];
    const options = values.map(function (v) {
      return { text: String(v), correct: v === answer };
    });
    return utils.shuffle(options, rng);
  }

  learning.makeGateTask = function (progress, rng) {
    rng = rng || Math.random;
    if (rng() < 0.5) {
      const count = progress.letters.level === 0 ? 2 : 3;
      const lt = letterOptions(progress, count, rng);
      return {
        kind: 'letter', skill: 'letters',
        prompt: utils.fmt('Проїдь через букву {x}!', { x: lt.target }),
        say: utils.fmt('Проїдь через букву {x}!', { x: lt.target }),
        options: lt.options
      };
    }
    const max = learning.numberMax(progress.numbers.level);
    const target = utils.randInt(1, max, rng);
    const count = progress.numbers.level === 0 ? 2 : 3;
    const pool = [];
    for (let v = 1; v <= max; v++) { if (v !== target) pool.push(v); }
    const distractors = utils.shuffle(pool, rng).slice(0, count - 1);
    const options = [{ text: String(target), correct: true }];
    for (let i = 0; i < distractors.length; i++) {
      options.push({ text: String(distractors[i]), correct: false });
    }
    return {
      kind: 'number', skill: 'numbers',
      prompt: utils.fmt('Проїдь через цифру {x}!', { x: target }),
      say: utils.fmt('Проїдь через цифру {x}!', { x: target }),
      options: utils.shuffle(options, rng)
    };
  };
```

- [ ] **Крок 8: запустити, переконатися що проходить** — `node tests/learning.test.js` → `OK: 22 checks`, exit 0.

- [ ] **Крок 9: написати тести makeStopTask — усі 3 контексти + math (падають)**

Встав ПЕРЕД `done();`:

```js
// --- makeStopTask ---
const p3 = learning.createProgress();
const tTrain = learning.makeStopTask(p3, 'train', seqRng([0.4, 0.6, 0.1]));
check('stop train: kind count', tTrain.kind === 'count' && tTrain.skill === 'numbers');
check('stop train: prompt про вагони', tTrain.prompt === 'Скільки вагонів у потяга?');
check('stop train: visual вагончики в діапазоні', tTrain.visual.emoji === '🚃' && tTrain.visual.count >= 1 && tTrain.visual.count <= 3);
check('stop train: 3 числові опції', tTrain.options.length === 3);
const tAns = tTrain.options.filter((o) => o.correct);
check('stop train: правильна = кількість', tAns.length === 1 && Number(tAns[0].text) === tTrain.visual.count);
check('stop train: усі опції >= 1', tTrain.options.every((o) => Number(o.text) >= 1));
const tPolice = learning.makeStopTask(p3, 'police', seqRng([0.2, 0.7, 0.4]));
check('stop police: kind letter', tPolice.kind === 'letter' && tPolice.skill === 'letters');
check('stop police: visual null', tPolice.visual === null);
check('stop police: 3 опції', tPolice.options.length === 3);
const pTarget = tPolice.options.filter((o) => o.correct)[0].text;
check('stop police: prompt Знайди букву', tPolice.prompt === 'Знайди букву ' + pTarget + '!');
const tCones = learning.makeStopTask(p3, 'roadwork', seqRng([0.3, 0.5, 0.2]));
check('stop roadwork: конуси поки math закрито', tCones.kind === 'count' && tCones.visual.emoji === '🚧');
check('stop roadwork: prompt про конуси', tCones.prompt === 'Скільки конусів на дорозі?');
p3.numbers.level = 2;
check('mathUnlocked: true після numbers 2', learning.mathUnlocked(p3) === true);
const tMath = learning.makeStopTask(p3, 'roadwork', seqRng([0.1, 0.4, 0.6, 0.3]));
check('stop math: kind math', tMath.kind === 'math' && tMath.skill === 'math');
check('stop math: prompt a + b = ?', /^\d+ \+ \d+ = \?$/.test(tMath.prompt));
const mParts = tMath.prompt.split(' ');
const mAns = tMath.options.filter((o) => o.correct)[0];
check('stop math: сума <= 4 і відповідь вірна', Number(mParts[0]) + Number(mParts[2]) <= 4 && Number(mAns.text) === Number(mParts[0]) + Number(mParts[2]));
check('stop math: visual дві групи машинок', tMath.visual.emoji === '🚗' && tMath.visual.count === Number(mParts[0]) && tMath.visual.emoji2 === '🚙' && tMath.visual.count2 === Number(mParts[2]));
p3.math.level = 3;
const tSub = learning.makeStopTask(p3, 'roadwork', seqRng([0.1, 0.4, 0.6, 0.3]));
check('stop sub: prompt a − b = ?', /^\d+ − \d+ = \?$/.test(tSub.prompt));
const sParts = tSub.prompt.split(' ');
const sAns = tSub.options.filter((o) => o.correct)[0];
check('stop sub: відповідь = різниця >= 1', Number(sAns.text) === Number(sParts[0]) - Number(sParts[2]) && Number(sAns.text) >= 1);
check('stop sub: say містить мінус', tSub.say.indexOf('мінус') >= 0);
```

- [ ] **Крок 10: запустити, переконатися що падає** — `node tests/learning.test.js` → `TypeError: learning.makeStopTask is not a function`, exit ≠ 0.

- [ ] **Крок 11: реалізувати makeStopTask і makeMathTask**

Додай у `js/learning.js` ПЕРЕД `root.learning = learning;`:

```js
  function makeMathTask(progress, rng) {
    const level = progress.math.level;
    if (level >= 3) {
      const a = utils.randInt(2, 10, rng);
      const b = utils.randInt(1, a - 1, rng);
      return {
        kind: 'math', skill: 'math',
        prompt: utils.fmt('{a} − {b} = ?', { a: a, b: b }),
        say: utils.fmt('Скільки буде {a} мінус {b}?', { a: a, b: b }),
        visual: null,
        options: numberOptions(a - b, rng)
      };
    }
    const max = [4, 6, 10][level];
    const a = utils.randInt(1, max - 1, rng);
    const b = utils.randInt(1, max - a, rng);
    return {
      kind: 'math', skill: 'math',
      prompt: utils.fmt('{a} + {b} = ?', { a: a, b: b }),
      say: utils.fmt('Скільки буде {a} плюс {b}?', { a: a, b: b }),
      visual: { emoji: '🚗', count: a, emoji2: '🚙', count2: b },
      options: numberOptions(a + b, rng)
    };
  }

  learning.makeStopTask = function (progress, context, rng) {
    rng = rng || Math.random;
    if (context === 'train') {
      const n = utils.randInt(1, learning.numberMax(progress.numbers.level), rng);
      return {
        kind: 'count', skill: 'numbers',
        prompt: 'Скільки вагонів у потяга?',
        say: 'Скільки вагонів у потяга?',
        visual: { emoji: '🚃', count: n },
        options: numberOptions(n, rng)
      };
    }
    if (context === 'police') {
      const lt = letterOptions(progress, 3, rng);
      return {
        kind: 'letter', skill: 'letters',
        prompt: utils.fmt('Знайди букву {x}!', { x: lt.target }),
        say: utils.fmt('Знайди букву {x}!', { x: lt.target }),
        visual: null,
        options: lt.options
      };
    }
    if (learning.mathUnlocked(progress) && rng() < 0.5) return makeMathTask(progress, rng);
    const n = utils.randInt(1, learning.numberMax(progress.numbers.level), rng);
    return {
      kind: 'count', skill: 'numbers',
      prompt: 'Скільки конусів на дорозі?',
      say: 'Скільки конусів на дорозі?',
      visual: { emoji: '🚧', count: n },
      options: numberOptions(n, rng)
    };
  };
```

- [ ] **Крок 12: запустити, переконатися що проходить** — `node tests/learning.test.js` → `OK: 42 checks`, exit 0.

- [ ] **Крок 13: написати тести applyAnswer — підйом, спуск, межі (падають)**

Встав ПЕРЕД `done();`:

```js
// --- applyAnswer: адаптивність ---
const p4 = learning.createProgress();
learning.applyAnswer(p4, 'letters', true);
check('applyAnswer: перша правильна -> streak 1', p4.letters.streak === 1);
learning.applyAnswer(p4, 'letters', true);
learning.applyAnswer(p4, 'letters', true);
check('applyAnswer: 3 поспіль -> рівень 1', p4.letters.level === 1);
check('applyAnswer: streak скинуто після підйому', p4.letters.streak === 0);
p4.letters.level = learning.MAX_LEVEL.letters;
p4.letters.streak = 2;
learning.applyAnswer(p4, 'letters', true);
check('applyAnswer: рівень не вище MAX_LEVEL', p4.letters.level === 7);
check('applyAnswer: streak скинуто на стелі', p4.letters.streak === 0);
learning.applyAnswer(p4, 'letters', false);
check('applyAnswer: помилка -> streak -1', p4.letters.streak === -1);
learning.applyAnswer(p4, 'letters', false);
check('applyAnswer: 2 помилки -> рівень вниз', p4.letters.level === 6);
check('applyAnswer: streak 0 після зниження', p4.letters.streak === 0);
const p5 = learning.createProgress();
learning.applyAnswer(p5, 'math', false);
learning.applyAnswer(p5, 'math', false);
check('applyAnswer: рівень не нижче 0', p5.math.level === 0 && p5.math.streak === 0);
learning.applyAnswer(p5, 'math', true);
check('applyAnswer: відновлення -> streak 1', p5.math.streak === 1);
learning.applyAnswer(p5, 'math', false);
check('applyAnswer: помилка після успіху -> streak -1', p5.math.streak === -1);
```

- [ ] **Крок 14: запустити, переконатися що падає** — `node tests/learning.test.js` → `TypeError: learning.applyAnswer is not a function`, exit ≠ 0.

- [ ] **Крок 15: реалізувати applyAnswer (точний код)**

Додай у `js/learning.js` ПЕРЕД `root.learning = learning;`:

```js
  learning.applyAnswer = function (progress, skill, correct) {
    const s = progress[skill];
    if (correct) {
      s.streak = s.streak < 0 ? 1 : s.streak + 1;
      if (s.streak >= 3) {
        if (s.level < learning.MAX_LEVEL[skill]) s.level++;
        s.streak = 0;
      }
    } else {
      s.streak = s.streak > 0 ? -1 : s.streak - 1;
      if (s.streak <= -2) {
        if (s.level > 0) s.level--;
        s.streak = 0;
      }
    }
  };
```

- [ ] **Крок 16: запустити, переконатися що проходить** — `node tests/learning.test.js` → `OK: 53 checks`, exit 0.

- [ ] **Крок 17: написати тести зірочок і наліпок (падають)**

Встав ПЕРЕД `done();`:

```js
// --- зірочки та наліпки ---
check('STICKERS: 24 наліпки', learning.STICKERS.length === 24);
const ids = {};
learning.STICKERS.forEach((s) => { ids[s.id] = true; });
check('STICKERS: id унікальні', Object.keys(ids).length === 24);
check('STICKERS: скрізь emoji і label', learning.STICKERS.every((s) => typeof s.emoji === 'string' && s.emoji.length > 0 && typeof s.label === 'string' && s.label.length > 0));
const p6 = learning.createProgress();
learning.awardStar(p6);
learning.awardStar(p6);
check('awardStar: зірочки накопичуються', p6.stars === 2);
const st1 = learning.awardSticker(p6);
check('awardSticker: перша за порядком', st1 !== null && st1.id === learning.STICKERS[0].id);
check('awardSticker: id додано в progress', p6.stickers.length === 1 && p6.stickers[0] === st1.id);
const st2 = learning.awardSticker(p6);
check('awardSticker: далі наступна', st2.id === learning.STICKERS[1].id);
p6.stickers = learning.STICKERS.map((s) => s.id);
check('awardSticker: всі зібрані -> null', learning.awardSticker(p6) === null);
```

- [ ] **Крок 18: запустити, переконатися що падає** — `node tests/learning.test.js` → `FAIL: STICKERS: 24 наліпки` (або TypeError), exit ≠ 0.

- [ ] **Крок 19: реалізувати STICKERS, awardStar, awardSticker**

Додай у `js/learning.js` ПЕРЕД `root.learning = learning;`:

```js
  learning.STICKERS = [
    { id: 'race',       emoji: '🏎️', label: 'Гоночна машинка' },
    { id: 'jeep',       emoji: '🚙', label: 'Джип' },
    { id: 'taxi',       emoji: '🚕', label: 'Таксі' },
    { id: 'police',     emoji: '🚓', label: 'Поліцейська машина' },
    { id: 'fire',       emoji: '🚒', label: 'Пожежна машина' },
    { id: 'tractor',    emoji: '🚜', label: 'Трактор' },
    { id: 'train',      emoji: '🚂', label: 'Потяг' },
    { id: 'wagon',      emoji: '🚃', label: 'Вагончик' },
    { id: 'bus',        emoji: '🚌', label: 'Автобус' },
    { id: 'truck',      emoji: '🚚', label: 'Вантажівка' },
    { id: 'heli',       emoji: '🚁', label: 'Гелікоптер' },
    { id: 'plane',      emoji: '✈️', label: 'Літак' },
    { id: 'rocket',     emoji: '🚀', label: 'Ракета' },
    { id: 'sail',       emoji: '⛵', label: 'Вітрильник' },
    { id: 'boat',       emoji: '🚤', label: 'Катер' },
    { id: 'lighthouse', emoji: '🗼', label: 'Маяк' },
    { id: 'dog',        emoji: '🐶', label: 'Песик' },
    { id: 'cat',        emoji: '🐱', label: 'Котик' },
    { id: 'fox',        emoji: '🦊', label: 'Лисичка' },
    { id: 'bear',       emoji: '🐻', label: 'Ведмедик' },
    { id: 'bunny',      emoji: '🐰', label: 'Зайчик' },
    { id: 'lion',       emoji: '🦁', label: 'Левеня' },
    { id: 'turtle',     emoji: '🐢', label: 'Черепашка' },
    { id: 'dolphin',    emoji: '🐬', label: 'Дельфін' }
  ];

  learning.awardStar = function (progress) {
    progress.stars++;
  };

  learning.awardSticker = function (progress) {
    for (let i = 0; i < learning.STICKERS.length; i++) {
      const st = learning.STICKERS[i];
      if (progress.stickers.indexOf(st.id) < 0) {
        progress.stickers.push(st.id);
        return st;
      }
    }
    return null;
  };
```

- [ ] **Крок 20: запустити, переконатися що проходить** — `node tests/learning.test.js` → `OK: 61 checks`, exit 0.

- [ ] **Крок 21: написати тести serialize/deserialize, у т.ч. зіпсований JSON (падають)**

Встав ПЕРЕД `done();`:

```js
// --- serialize / deserialize ---
const p7 = learning.createProgress();
p7.letters.level = 3;
p7.stars = 9;
p7.stickers = ['race'];
const restored = learning.deserialize(learning.serialize(p7));
check('serialize: roundtrip level', restored.letters.level === 3);
check('serialize: roundtrip stars', restored.stars === 9);
check('serialize: roundtrip stickers', restored.stickers.length === 1 && restored.stickers[0] === 'race');
check('deserialize: null -> дефолт', learning.deserialize(null).stars === 0);
check('deserialize: зіпсований JSON -> дефолт', learning.deserialize('{oops').letters.level === 0);
const partial = learning.deserialize('{"stars": 5}');
check('deserialize: часткові дані merge з дефолтами', partial.stars === 5 && partial.numbers.level === 0 && Array.isArray(partial.stickers));
check('deserialize: level клемп до MAX', learning.deserialize('{"letters":{"level":99,"streak":0}}').letters.level === 7);
```

- [ ] **Крок 22: запустити, переконатися що падає** — `node tests/learning.test.js` → `TypeError: learning.serialize is not a function`, exit ≠ 0.

- [ ] **Крок 23: реалізувати serialize/deserialize**

Додай у `js/learning.js` ПЕРЕД `root.learning = learning;`:

```js
  learning.serialize = function (progress) {
    return JSON.stringify(progress);
  };

  learning.deserialize = function (str) {
    const fresh = learning.createProgress();
    if (!str) return fresh;
    try {
      const data = JSON.parse(str);
      if (!data || typeof data !== 'object') return fresh;
      ['letters', 'numbers', 'math'].forEach(function (skill) {
        const s = data[skill];
        if (s && typeof s.level === 'number' && typeof s.streak === 'number') {
          fresh[skill].level = utils.clamp(Math.round(s.level), 0, learning.MAX_LEVEL[skill]);
          fresh[skill].streak = Math.round(s.streak);
        }
      });
      if (typeof data.stars === 'number' && data.stars >= 0) fresh.stars = Math.round(data.stars);
      if (Array.isArray(data.stickers)) {
        fresh.stickers = data.stickers.filter(function (id) { return typeof id === 'string'; });
      }
      return fresh;
    } catch (e) {
      return fresh;
    }
  };
```

- [ ] **Крок 24: запустити, переконатися що проходить** — `node tests/learning.test.js` → `OK: 68 checks`, exit 0 (68 ≥ 25 — вимогу кількості тестів виконано).

- [ ] **Крок 25: підключити тест до tests/all.js і запустити все**

У `tests/all.js` після рядка `require('./utils.test.js');` додай:

```js
require('./learning.test.js');
```

Запусти `node tests/all.js` → останній рядок `OK: <N> checks` (N = чеки utils з Task 1 + 68, лічильник у t.js накопичується), exit 0. Жодного рядка `FAIL:`.

- [ ] **Крок 26: коміт**

```
git add js/learning.js tests/learning.test.js tests/all.js && git commit -m "feat: навчальна логіка з адаптивністю"
```

Очікуваний результат: коміт створено, `git status` — робоче дерево чисте.

---

### Task 3: audio.js — звукові ефекти та українська озвучка

Модуль звуку гри «Ромчик-Гонщик»: синтезовані звукові ефекти через Web Audio API (жодних аудіофайлів), безперервний звук мотора та українська озвучка через Web Speech API. Ключові вимоги: усе працює як класичний `<script src>` (без import/export), модуль підключається в Node через `module.exports` для тестів, а за відсутності `AudioContext`/`speechSynthesis` (Node, старі браузери) КОЖНА функція — тихий no-op без винятків. Ініціалізація — лише з першого жесту користувача (політика автоплею). Збереження стану mute у localStorage — НЕ тут (це зробить main.js у пізнішій задачі), тут лише прапорець у пам'яті.

**Files:**
- Create: `js/audio.js`
- Create: `tests/audio.test.js`
- Create: `tools/audio-test.html`
- Modify: `tests/all.js` (додати require нового тесту)
- Test: `node tests/audio.test.js`

**Interfaces:**

*Consumes (з попередніх задач):*
- `tests/t.js`: `const { check, done } = require('./t.js');` — `check(name, cond)` рахує перевірки і друкує `FAIL: <name>` при провалі; `done()` наприкінці друкує `OK: N checks` (exit 0) або `FAILED: N checks` (exit 1).
- Глобальний неймспейс `window.RG` (модуль сам створює його за потреби через boilerplate).

*Produces (використовують наступні задачі — race, events, screens, main):*
- `RG.audio.init()` — лінива ініціалізація AudioContext + «розблокування» speechSynthesis на iOS; викликати з першого жесту користувача; повторні виклики безпечні.
- `RG.audio.setMuted(on: bool)`, `RG.audio.isMuted() -> bool` — прапорець тиші в пам'яті.
- `RG.audio.sfx(name)` — name ∈ `'honk','ding','wrong','train','whistle','win','pop','click','crash'`; усі < 1 с, крім `'win'` (~2 с); `'wrong'` — м'який низхідний тон.
- `RG.audio.startEngine()`, `RG.audio.engine(speedRatio /*0..1*/)`, `RG.audio.stopEngine()` — безперервний звук мотора.
- `RG.audio.speak(text)` — озвучка українською (`lang='uk-UA'`, rate 0.95, pitch 1.05), скасовує попередню фразу; no-op якщо muted або API відсутнє.
- `RG.audio.pickUkrainianVoice(voices) -> voice|null` — чиста функція вибору українського голосу.

- [ ] **Крок 1: Написати тест, що падає — `tests/audio.test.js`**

Повний вміст файлу `tests/audio.test.js`:

```js
const { check, done } = require('./t.js');
const audio = require('../js/audio.js');

function noThrow(fn) {
  try { fn(); return true; } catch (e) { return false; }
}

// --- pickUkrainianVoice: чиста функція на фейкових голосах ---
const v1 = [
  { lang: 'en-US', name: 'Samantha' },
  { lang: 'uk-UA', name: 'Lesya' },
  { lang: 'pl-PL', name: 'Zosia' }
];
check('picks voice with lang uk-UA', audio.pickUkrainianVoice(v1) === v1[1]);

const v2 = [
  { lang: 'en-GB', name: 'Daniel' },
  { lang: 'uk', name: 'Ukrainian Voice' }
];
check('lang "uk" without region matches', audio.pickUkrainianVoice(v2) === v2[1]);

const v3 = [
  { lang: 'uk-UA', name: 'Voice A' },
  { lang: 'uk-UA', name: 'Voice B' }
];
check('first of several uk voices wins', audio.pickUkrainianVoice(v3) === v3[0]);

const v4 = [
  { lang: 'en-US', name: 'Samantha' },
  { lang: '', name: 'Google Ukrainian' }
];
check('falls back to /ukrain/i in name', audio.pickUkrainianVoice(v4) === v4[1]);

const v5 = [
  { lang: 'en-US', name: 'Samantha' },
  { lang: 'und', name: 'LESYA Enhanced' }
];
check('falls back to /lesya/i in name', audio.pickUkrainianVoice(v5) === v5[1]);

const v6 = [
  { lang: 'en-US', name: 'Ukrainian Accent' },
  { lang: 'uk-UA', name: 'Kyivska' }
];
check('lang match wins over name match', audio.pickUkrainianVoice(v6) === v6[1]);

check('null when nothing matches',
  audio.pickUkrainianVoice([{ lang: 'en-US', name: 'Samantha' }]) === null);
check('null for empty list', audio.pickUkrainianVoice([]) === null);

// --- muted-стан і безпечні no-op без браузерних API (у Node їх нема) ---
check('isMuted() false by default',
  noThrow(function () { audio.isMuted(); }) && audio.isMuted() === false);
check('setMuted(true) -> isMuted() true',
  noThrow(function () { audio.setMuted(true); }) && audio.isMuted() === true);
check('setMuted(false) -> isMuted() false',
  noThrow(function () { audio.setMuted(false); }) && audio.isMuted() === false);
check('init() safe without AudioContext/speechSynthesis',
  noThrow(function () { audio.init(); audio.init(); }));
check('every sfx name is a safe no-op in Node',
  noThrow(function () {
    ['honk', 'ding', 'wrong', 'train', 'whistle', 'win', 'pop', 'click', 'crash']
      .forEach(function (n) { audio.sfx(n); });
  }));
check('speak() safe no-op in Node',
  noThrow(function () { audio.speak('Привіт, Ромчику!'); }));
check('engine start/update/stop safe no-op in Node',
  noThrow(function () { audio.startEngine(); audio.engine(0.5); audio.stopEngine(); }));

done();
```

- [ ] **Крок 2: Запустити тест — переконатися, що падає**

```
node tests/audio.test.js
```

Очікувано: помилка `Error: Cannot find module '../js/audio.js'`, exit code ≠ 0 (файла модуля ще нема — «червона» фаза).

- [ ] **Крок 3: Мінімальна реалізація — `js/audio.js` лише з pickUkrainianVoice**

Повний вміст файлу `js/audio.js` (boilerplate проєкту + стан модуля + чиста функція):

```js
(function (root) {
  'use strict';
  const audio = {};

  let ctx = null;
  let muted = false;
  let speechUnlocked = false;
  let voicesHooked = false;
  let ukVoice = null;
  let engineOsc = null;
  let engineFilter = null;
  let engineGain = null;

  audio.pickUkrainianVoice = function (voices) {
    if (!voices) return null;
    for (let i = 0; i < voices.length; i++) {
      const lang = (voices[i].lang || '').toLowerCase();
      if (lang.indexOf('uk') === 0) return voices[i];
    }
    for (let i = 0; i < voices.length; i++) {
      if (/ukrain|lesya/i.test(voices[i].name || '')) return voices[i];
    }
    return null;
  };

  root.audio = audio;
  if (typeof module !== 'undefined' && module.exports) module.exports = audio;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 4: Запустити тест — pickUkrainianVoice проходить, решта падає**

```
node tests/audio.test.js
```

Очікуваний вивід (перші 8 перевірок мовчки проходять, 7 наступних падають):

```
FAIL: isMuted() false by default
FAIL: setMuted(true) -> isMuted() true
FAIL: setMuted(false) -> isMuted() false
FAIL: init() safe without AudioContext/speechSynthesis
FAIL: every sfx name is a safe no-op in Node
FAIL: speak() safe no-op in Node
FAIL: engine start/update/stop safe no-op in Node
FAILED: 15 checks
```

Exit code 1.

- [ ] **Крок 5: Повна реалізація — init, mute, sfx, мотор, speak**

У `js/audio.js` вставити наступний код ПІСЛЯ закриваючого `};` функції `audio.pickUkrainianVoice` і ПЕРЕД рядком `root.audio = audio;` (оголошення `let ctx…` з Кроку 3 лишаються на місці):

```js
  function audioCtxClass() {
    if (typeof window === 'undefined') return null;
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function speechApi() {
    if (typeof window === 'undefined') return null;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return null;
    return window.speechSynthesis;
  }

  function refreshVoice() {
    const synth = speechApi();
    if (!synth || typeof synth.getVoices !== 'function') return;
    ukVoice = audio.pickUkrainianVoice(synth.getVoices());
  }

  audio.init = function () {
    if (!ctx) {
      const AC = audioCtxClass();
      if (AC) {
        try { ctx = new AC(); } catch (e) { ctx = null; }
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    const synth = speechApi();
    if (synth && !speechUnlocked) {
      speechUnlocked = true;
      try { synth.speak(new window.SpeechSynthesisUtterance('')); } catch (e) {}
    }
    if (synth && !voicesHooked) {
      voicesHooked = true;
      refreshVoice();
      if (typeof synth.addEventListener === 'function') {
        synth.addEventListener('voiceschanged', refreshVoice);
      } else {
        synth.onvoiceschanged = refreshVoice;
      }
    }
  };

  audio.setMuted = function (on) {
    muted = !!on;
    const synth = speechApi();
    if (muted && synth) synth.cancel();
    if (engineGain && ctx) {
      engineGain.gain.setTargetAtTime(muted ? 0 : 0.05, ctx.currentTime, 0.05);
    }
  };

  audio.isMuted = function () {
    return muted;
  };

  function tone(opts) {
    const t0 = ctx.currentTime + (opts.at || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.from, t0);
    if (opts.to && opts.to !== opts.from) {
      osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(opts.vol || 0.15, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.05);
  }

  function noiseBurst(dur, vol) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.value = vol;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(ctx.currentTime);
  }

  audio.sfx = function (name) {
    if (muted || !ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (name === 'honk') {
      tone({ from: 370, dur: 0.12, type: 'square', vol: 0.12 });
      tone({ from: 370, dur: 0.18, type: 'square', vol: 0.12, at: 0.16 });
    } else if (name === 'ding') {
      tone({ from: 880, to: 1320, dur: 0.15, vol: 0.2 });
      tone({ from: 1760, dur: 0.3, vol: 0.12, at: 0.1 });
    } else if (name === 'wrong') {
      tone({ from: 330, to: 240, dur: 0.35, vol: 0.1 });
    } else if (name === 'train') {
      tone({ from: 311, dur: 0.5, type: 'sawtooth', vol: 0.08 });
      tone({ from: 370, dur: 0.5, type: 'sawtooth', vol: 0.08 });
    } else if (name === 'whistle') {
      tone({ from: 1200, to: 1600, dur: 0.15, vol: 0.12 });
      tone({ from: 1600, to: 1200, dur: 0.2, vol: 0.12, at: 0.18 });
    } else if (name === 'win') {
      tone({ from: 523, dur: 0.2, type: 'triangle', vol: 0.18 });
      tone({ from: 659, dur: 0.2, type: 'triangle', vol: 0.18, at: 0.2 });
      tone({ from: 784, dur: 0.2, type: 'triangle', vol: 0.18, at: 0.4 });
      tone({ from: 1047, dur: 0.8, type: 'triangle', vol: 0.2, at: 0.6 });
      tone({ from: 784, dur: 0.25, type: 'triangle', vol: 0.12, at: 1.45 });
      tone({ from: 1047, dur: 0.5, type: 'triangle', vol: 0.16, at: 1.55 });
    } else if (name === 'pop') {
      tone({ from: 400, to: 900, dur: 0.08, vol: 0.15 });
    } else if (name === 'click') {
      tone({ from: 600, dur: 0.05, type: 'square', vol: 0.08 });
    } else if (name === 'crash') {
      noiseBurst(0.25, 0.15);
      tone({ from: 180, to: 90, dur: 0.25, type: 'sawtooth', vol: 0.1 });
    }
  };

  audio.startEngine = function () {
    if (!ctx || engineOsc) return;
    engineOsc = ctx.createOscillator();
    engineFilter = ctx.createBiquadFilter();
    engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 50;
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 300;
    engineGain.gain.value = muted ? 0 : 0.05;
    engineOsc.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(ctx.destination);
    engineOsc.start();
  };

  audio.engine = function (speedRatio) {
    if (!ctx || !engineOsc) return;
    let r = speedRatio || 0;
    if (r < 0) r = 0;
    if (r > 1) r = 1;
    engineOsc.frequency.setTargetAtTime(50 + 70 * r, ctx.currentTime, 0.1);
    engineFilter.frequency.setTargetAtTime(300 + 500 * r, ctx.currentTime, 0.1);
  };

  audio.stopEngine = function () {
    if (!engineOsc) return;
    try {
      engineOsc.stop();
      engineOsc.disconnect();
      engineFilter.disconnect();
      engineGain.disconnect();
    } catch (e) {}
    engineOsc = null;
    engineFilter = null;
    engineGain = null;
  };

  audio.speak = function (text) {
    if (muted) return;
    const synth = speechApi();
    if (!synth) return;
    try {
      synth.cancel();
      const u = new window.SpeechSynthesisUtterance(text);
      u.lang = 'uk-UA';
      u.rate = 0.95;
      u.pitch = 1.05;
      if (ukVoice) u.voice = ukVoice;
      synth.speak(u);
    } catch (e) {}
  };
```

- [ ] **Крок 6: Запустити тест — переконатися, що проходить**

```
node tests/audio.test.js
```

Очікуваний вивід: `OK: 15 checks`, exit code 0.

- [ ] **Крок 7: Підключити тест до tests/all.js і прогнати всі тести**

У файлі `tests/all.js` після наявних рядків `require('./….test.js');` додати рядок:

```js
require('./audio.test.js');
```

Запустити:

```
node tests/all.js
```

Очікувано: по рядку `OK: N checks` на кожен тест-файл; лічильник у `tests/t.js` спільний для процесу, тому числа кумулятивні — окремого рядка з числом лише цього модуля НЕ буде. Головне: жодного рядка `FAIL:`, exit code 0.

- [ ] **Крок 8: Створити сторінку ручної перевірки tools/audio-test.html**

Повний вміст файлу `tools/audio-test.html`:

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Тест звуку — Ромчик-Гонщик</title>
  <style>
    body {
      font-family: "Chalkboard SE","Comic Sans MS",cursive,sans-serif;
      background: #E1F5FE; margin: 0; padding: 16px;
    }
    h1 { font-size: 24px; }
    h2 { font-size: 20px; margin: 16px 0 8px; }
    button {
      font-family: inherit; font-size: 20px; min-height: 48px;
      margin: 4px; padding: 8px 16px; border-radius: 12px;
      border: 2px solid #0288D1; background: #fff; cursor: pointer;
    }
    input[type='range'] { width: 240px; vertical-align: middle; }
  </style>
</head>
<body>
  <h1>Тест звуку 🔊</h1>
  <h2>Ефекти</h2>
  <div id="sfx"></div>
  <h2>Мотор</h2>
  <button id="engine-start">Завести мотор</button>
  <button id="engine-stop">Заглушити</button>
  <label>Швидкість <input id="speed" type="range" min="0" max="1" step="0.01" value="0"></label>
  <h2>Озвучка</h2>
  <div id="phrases"></div>
  <h2>Тиша</h2>
  <button id="mute">🔊 Звук увімкнено</button>
  <script src="../js/audio.js"></script>
  <script>
    (function () {
      'use strict';
      const audio = window.RG.audio;
      const SFX = ['honk', 'ding', 'wrong', 'train', 'whistle', 'win', 'pop', 'click', 'crash'];
      const PHRASES = [
        'Привіт, Ромчику!',
        'Проїдь через букву А!',
        'Скільки вагонів у потяга?',
        'Молодець, Ромчику!'
      ];
      const sfxBox = document.getElementById('sfx');
      SFX.forEach(function (name) {
        const b = document.createElement('button');
        b.textContent = name;
        b.addEventListener('click', function () { audio.init(); audio.sfx(name); });
        sfxBox.appendChild(b);
      });
      const phraseBox = document.getElementById('phrases');
      PHRASES.forEach(function (text) {
        const b = document.createElement('button');
        b.textContent = text;
        b.addEventListener('click', function () { audio.init(); audio.speak(text); });
        phraseBox.appendChild(b);
      });
      document.getElementById('engine-start').addEventListener('click', function () {
        audio.init();
        audio.startEngine();
      });
      document.getElementById('engine-stop').addEventListener('click', function () {
        audio.stopEngine();
      });
      document.getElementById('speed').addEventListener('input', function (e) {
        audio.engine(parseFloat(e.target.value));
      });
      const muteBtn = document.getElementById('mute');
      muteBtn.addEventListener('click', function () {
        audio.setMuted(!audio.isMuted());
        muteBtn.textContent = audio.isMuted() ? '🔇 Звук вимкнено' : '🔊 Звук увімкнено';
      });
    })();
  </script>
</body>
</html>
```

- [ ] **Крок 9: Ручна перевірка звуку в браузері**

З кореня проєкту:

```
python3 -m http.server 8080
```

Відкрити `http://localhost:8080/tools/audio-test.html` і перевірити (звук з'являється лише після першого кліку — це нормально, політика автоплею):

1. Кожна з 9 кнопок ефектів дає звук; `wrong` — тихий м'який низхідний тон (не лякає); `win` — фанфари ~2 секунди; решта коротші за 1 с.
2. «Завести мотор» — тихе безперервне гудіння; повзунок швидкості плавно піднімає тон; «Заглушити» — тиша. Повторний клік «Завести мотор» не додає другий мотор.
3. Кнопки фраз промовляють текст українською. Якщо українського голосу в системі нема — фраза йде системним голосом або мовчить, але помилок у консолі нема.
4. «🔇 Звук вимкнено» — ефекти й озвучка мовчать, мотор затихає; повторний клік повертає звук (мотор знову гуде, якщо був заведений).
5. У консолі DevTools — нуль помилок за весь час перевірки.

Зупинити сервер: Ctrl+C.

- [ ] **Крок 10: Коміт**

```
git add js/audio.js tests/audio.test.js tests/all.js tools/audio-test.html && git commit -m "feat: звукові ефекти та українська озвучка"
```

Очікувано: коміт створено, у ньому 4 файли.

---

### Task 4: sprites.js — машинки, персонажі, емодзі-спрайти

Мета: модуль `RG.sprites` — уся «графіка кодом» для гри: 4 персонажі, 6 машинок (вид ззаду, Canvas-фігури), портрети персонажів та кешований рендер емодзі в offscreen-канваси. Жодних зовнішніх зображень. Модуль НЕ підключається в `index.html` у цій задачі (це зробить інша задача) — перевіряємо через Node-тести та окрему сторінку-галерею `tools/sprites-test.html`.

Стиль коду: 2 пробіли, одинарні лапки, крапка з комою, `const`/`let`. Класичний скрипт (БЕЗ import/export).

**Files:**
- Create: `js/sprites.js`
- Create: `tests/sprites.test.js`
- Create: `tools/sprites-test.html`
- Modify: `tests/all.js` (додати require нового тесту)
- Test: `tests/sprites.test.js`

**Interfaces:**

*Consumes (уже існує в репозиторії з Task 1):*
- `tests/t.js`: `const { check, done } = require('./t.js');` — `check(name, cond)` рахує перевірку і друкує `FAIL: <name>` при провалі; `done()` друкує `OK: N checks` (exit 0) або `FAILED: N checks` (exit 1).
- Патерн неймспейсу `window.RG` (спільний boilerplate-обгортка, див. код нижче). `sprites.js` ні від чого більше не залежить (навіть від `utils.js`) — локальний `clamp` всередині.

*Produces (використають наступні задачі — race.js, events.js, screens.js):*
- `sprites.CHARACTERS` — масив 4 персонажів `{id, name, hair, shirt, skin, bow?}` (hex-кольори).
- `sprites.CAR_TYPES` — масив 6 машин `{id, label, color, accent, shape, rainbow?}`.
- `sprites.drawCar(ctx, cx, bottomY, w, carDef, opts)` — машинка ВИД ЗЗАДУ; якір: `cx` — центр по x, `bottomY` — низ по y; висоту рахує сама (~`0.8*w`); `opts = {steer: -1..1, driver: charDef|null, brake: bool}` (усі опційні, `opts` можна не передавати).
- `sprites.drawCharacter(ctx, cx, topY, size, charDef)` — портрет (голова + футболка), якір: центр по x, верх по y.
- `sprites.emoji(char, sizePx) -> HTMLCanvasElement` — кешований offscreen-рендер емодзі (кеш `Map`, ключ `char + '@' + sizePx`). ЛИШЕ браузер (використовує `document`) — у Node не викликаємо.
- `sprites.drawSprite(ctx, spriteCanvas, cx, bottomY, w)` — малює канвас із масштабуванням, якір: центр по x, низ по y.

- [ ] **Крок 1: Написати тест валідації даних (падає)**

Створи `tests/sprites.test.js`:

```js
const { check, done } = require('./t.js');
const sprites = require('../js/sprites.js');

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const chars = sprites.CHARACTERS;
check('CHARACTERS: 4 записи', Array.isArray(chars) && chars.length === 4);
check('CHARACTERS: унікальні id', new Set(chars.map(c => c.id)).size === 4);
check('CHARACTERS: точні id', chars.map(c => c.id).join(',') === 'romchyk,matviyko,andriyko,miya');
check('CHARACTERS: точні імена', chars.map(c => c.name).join(',') === 'Ромчик,Матвійко,Андрійко,Мія');
check('CHARACTERS: hair — hex', chars.every(c => HEX.test(c.hair)));
check('CHARACTERS: shirt — hex', chars.every(c => HEX.test(c.shirt)));
check('CHARACTERS: skin — hex', chars.every(c => HEX.test(c.skin)));
check('CHARACTERS: у Мії є бантик', HEX.test(chars[3].bow));

const cars = sprites.CAR_TYPES;
check('CAR_TYPES: 6 записів', Array.isArray(cars) && cars.length === 6);
check('CAR_TYPES: унікальні id', new Set(cars.map(c => c.id)).size === 6);
check('CAR_TYPES: точні id', cars.map(c => c.id).join(',') === 'race,jeep,buggy,pickup,cabrio,bolid');
check('CAR_TYPES: color — hex', cars.every(c => HEX.test(c.color)));
check('CAR_TYPES: accent — hex', cars.every(c => HEX.test(c.accent)));
check('CAR_TYPES: label не порожній', cars.every(c => typeof c.label === 'string' && c.label.length > 0));
const SHAPES = ['race', 'jeep', 'buggy', 'pickup', 'cabrio'];
check('CAR_TYPES: shape валідний', cars.every(c => SHAPES.indexOf(c.shape) !== -1));
check('CAR_TYPES: болід райдужний', cars[5].rainbow === true);
check('CAR_TYPES: решта не райдужні', cars.slice(0, 5).every(c => !c.rainbow));

done();
```

- [ ] **Крок 2: Запустити тест, переконатися що падає**

```
node tests/sprites.test.js
```

Очікувано: помилка `Cannot find module '../js/sprites.js'`, exit code ≠ 0 (модуля ще нема).

- [ ] **Крок 3: Створити js/sprites.js з даними персонажів і машин**

Створи `js/sprites.js` (дані — ТОЧНО як нижче, нічого не міняти):

```js
(function (root) {
  'use strict';
  const sprites = {};

  sprites.CHARACTERS = [
    { id: 'romchyk',  name: 'Ромчик',   hair: '#8B5A2B', shirt: '#E53935', skin: '#FFD8B5' },
    { id: 'matviyko', name: 'Матвійко', hair: '#3E2723', shirt: '#1E88E5', skin: '#FFD8B5' },
    { id: 'andriyko', name: 'Андрійко', hair: '#FBC02D', shirt: '#43A047', skin: '#FFE0BD' },
    { id: 'miya',     name: 'Мія',      hair: '#5D4037', shirt: '#8E24AA', skin: '#FFD8B5', bow: '#F06292' }
  ];

  sprites.CAR_TYPES = [
    { id: 'race',   label: 'Червона гоночна',     color: '#E53935', accent: '#FFCDD2', shape: 'race' },
    { id: 'jeep',   label: 'Синій джип',           color: '#1E88E5', accent: '#BBDEFB', shape: 'jeep' },
    { id: 'buggy',  label: 'Зелений баггі',        color: '#43A047', accent: '#C8E6C9', shape: 'buggy' },
    { id: 'pickup', label: 'Жовтий пікап',         color: '#FDD835', accent: '#FFF9C4', shape: 'pickup' },
    { id: 'cabrio', label: 'Фіолетовий кабріолет', color: '#8E24AA', accent: '#E1BEE7', shape: 'cabrio' },
    { id: 'bolid',  label: 'Райдужний болід',      color: '#E53935', accent: '#FFF', shape: 'race', rainbow: true }
  ];

  root.sprites = sprites;
  if (typeof module !== 'undefined' && module.exports) module.exports = sprites;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 4: Запустити, переконатися що дані валідні**

```
node tests/sprites.test.js
```

Очікувано: `OK: 17 checks`, exit code 0.

- [ ] **Крок 5: Додати smoke-тести малювання з mock-ctx (падають)**

У `tests/sprites.test.js` встав ПЕРЕД фінальним рядком `done();` цей блок. Mock-ctx — об'єкт, у якого всі методи Canvas — лічильники викликів (а `createLinearGradient` повертає заглушку з `addColorStop`, бо райдужний болід створює градієнт):

```js
function makeMockCtx() {
  const calls = {};
  const names = ['save', 'restore', 'translate', 'rotate', 'beginPath', 'closePath',
    'moveTo', 'lineTo', 'arcTo', 'arc', 'fill', 'stroke', 'fillRect', 'strokeRect',
    'fillText', 'drawImage'];
  const ctx = { calls: calls };
  names.forEach(function (n) {
    calls[n] = 0;
    ctx[n] = function () { calls[n]++; };
  });
  ctx.createLinearGradient = function () {
    calls.createLinearGradient = (calls.createLinearGradient || 0) + 1;
    return { addColorStop: function () {} };
  };
  return ctx;
}

cars.forEach(function (car) {
  const ctx = makeMockCtx();
  let threw = false;
  try {
    sprites.drawCar(ctx, 100, 200, 80, car, { steer: 0.5, driver: chars[3], brake: true });
  } catch (e) { threw = true; }
  check('drawCar ' + car.id + ': не кидає', !threw);
  check('drawCar ' + car.id + ': малює (fill > 0)', ctx.calls.fill > 0);
  check('drawCar ' + car.id + ': save === restore', ctx.calls.save === ctx.calls.restore);
});

(function () {
  const ctx = makeMockCtx();
  let threw = false;
  try { sprites.drawCar(ctx, 50, 50, 40, cars[0]); } catch (e) { threw = true; }
  check('drawCar без opts: не кидає', !threw);
})();

(function () {
  const ctx = makeMockCtx();
  try { sprites.drawCar(ctx, 100, 200, 80, cars[5]); } catch (e) {}
  check('drawCar bolid: створює градієнт', (ctx.calls.createLinearGradient || 0) > 0);
})();

chars.forEach(function (ch) {
  const ctx = makeMockCtx();
  let threw = false;
  try { sprites.drawCharacter(ctx, 60, 10, 100, ch); } catch (e) { threw = true; }
  check('drawCharacter ' + ch.id + ': не кидає', !threw);
  check('drawCharacter ' + ch.id + ': малює (arc і fill > 0)', ctx.calls.arc > 0 && ctx.calls.fill > 0);
});

(function () {
  const ctx = makeMockCtx();
  let threw = false;
  try { sprites.drawSprite(ctx, { width: 64, height: 32 }, 100, 200, 48); } catch (e) { threw = true; }
  check('drawSprite: не кидає', !threw);
  check('drawSprite: рівно один drawImage', ctx.calls.drawImage === 1);
})();
```

`sprites.emoji` у Node не тестуємо — вона потребує `document` (перевіримо очима в галереї на кроці 10–11).

- [ ] **Крок 6: Запустити, переконатися що smoke-тести падають**

```
node tests/sprites.test.js
```

Очікувано: 24 рядки `FAIL: ...` (функцій малювання ще нема) і фінальний рядок `FAILED: 47 checks`, exit code 1.

- [ ] **Крок 7: Реалізувати всі функції малювання**

У `js/sprites.js` встав цей блок ПЕРЕД рядком `root.sprites = sprites;`:

```js
  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function bodyFill(ctx, carDef, top, h) {
    if (!carDef.rainbow) return carDef.color;
    const g = ctx.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, '#E53935');
    g.addColorStop(0.25, '#FDD835');
    g.addColorStop(0.5, '#43A047');
    g.addColorStop(0.75, '#1E88E5');
    g.addColorStop(1, '#8E24AA');
    return g;
  }

  sprites.drawCar = function (ctx, cx, bottomY, w, carDef, opts) {
    opts = opts || {};
    const steer = clamp(opts.steer || 0, -1, 1);
    const shape = carDef.shape;
    const big = shape === 'buggy' || shape === 'jeep';
    const wheelR = (big ? 0.17 : 0.13) * w;
    const bodyW = 0.9 * w;
    const bodyH = 0.32 * w;
    const bodyBottom = -0.4 * wheelR;
    const bodyTop = bodyBottom - bodyH;
    const cabW = 0.56 * w;
    const cabH = 0.24 * w;
    const cabTop = bodyTop - cabH;

    ctx.save();
    ctx.translate(cx, bottomY);
    ctx.rotate(steer * 0.08);

    function wheel(x) {
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.arc(x, -wheelR, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#B0BEC5';
      ctx.beginPath();
      ctx.arc(x, -wheelR, wheelR * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    wheel(-0.38 * w);
    wheel(0.38 * w);

    ctx.fillStyle = bodyFill(ctx, carDef, bodyTop, bodyH);
    roundedRect(ctx, -bodyW / 2, bodyTop, bodyW, bodyH, 0.08 * w);
    ctx.fill();

    if (shape === 'race') {
      ctx.fillStyle = carDef.color;
      roundedRect(ctx, -cabW / 2, cabTop + 0.06 * w, cabW, cabH - 0.06 * w, 0.05 * w);
      ctx.fill();
      ctx.fillStyle = '#37474F';
      roundedRect(ctx, -cabW / 2 + 0.06 * w, cabTop + 0.1 * w, cabW - 0.12 * w, cabH - 0.13 * w, 0.03 * w);
      ctx.fill();
      ctx.fillStyle = '#37474F';
      ctx.fillRect(-0.4 * w, cabTop - 0.02 * w, 0.05 * w, 0.09 * w);
      ctx.fillRect(0.35 * w, cabTop - 0.02 * w, 0.05 * w, 0.09 * w);
      ctx.fillStyle = carDef.accent;
      roundedRect(ctx, -0.45 * w, cabTop - 0.09 * w, 0.9 * w, 0.07 * w, 0.03 * w);
      ctx.fill();
    } else if (shape === 'jeep') {
      ctx.fillStyle = carDef.color;
      roundedRect(ctx, -cabW / 2 - 0.04 * w, cabTop - 0.04 * w, cabW + 0.08 * w, cabH + 0.04 * w, 0.04 * w);
      ctx.fill();
      ctx.fillStyle = '#37474F';
      roundedRect(ctx, -cabW / 2, cabTop, cabW, cabH - 0.1 * w, 0.03 * w);
      ctx.fill();
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.arc(0, bodyTop + bodyH * 0.55, 0.1 * w, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = carDef.accent;
      ctx.beginPath();
      ctx.arc(0, bodyTop + bodyH * 0.55, 0.045 * w, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'buggy') {
      ctx.strokeStyle = '#37474F';
      ctx.lineWidth = 0.04 * w;
      ctx.beginPath();
      ctx.moveTo(-cabW / 2, bodyTop);
      ctx.lineTo(-cabW / 2 + 0.07 * w, cabTop);
      ctx.lineTo(cabW / 2 - 0.07 * w, cabTop);
      ctx.lineTo(cabW / 2, bodyTop);
      ctx.stroke();
    } else if (shape === 'pickup') {
      ctx.fillStyle = carDef.color;
      roundedRect(ctx, -bodyW / 2, bodyTop - 0.09 * w, bodyW, 0.11 * w, 0.03 * w);
      ctx.fill();
      ctx.fillStyle = carDef.accent;
      roundedRect(ctx, -bodyW / 2 + 0.05 * w, bodyTop - 0.06 * w, bodyW - 0.1 * w, 0.05 * w, 0.02 * w);
      ctx.fill();
      ctx.fillStyle = carDef.color;
      roundedRect(ctx, -0.28 * w, cabTop + 0.04 * w, 0.56 * w, 0.12 * w, 0.04 * w);
      ctx.fill();
    } else if (shape === 'cabrio') {
      ctx.fillStyle = '#4E342E';
      roundedRect(ctx, -cabW / 2, bodyTop - 0.06 * w, cabW, 0.08 * w, 0.03 * w);
      ctx.fill();
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 0.025 * w;
      ctx.strokeRect(-0.26 * w, cabTop + 0.08 * w, 0.52 * w, 0.06 * w);
    }

    ctx.fillStyle = opts.brake ? '#FF5252' : '#B71C1C';
    roundedRect(ctx, -bodyW / 2 + 0.04 * w, bodyBottom - 0.11 * w, 0.13 * w, 0.07 * w, 0.02 * w);
    ctx.fill();
    roundedRect(ctx, bodyW / 2 - 0.17 * w, bodyBottom - 0.11 * w, 0.13 * w, 0.07 * w, 0.02 * w);
    ctx.fill();
    ctx.fillStyle = carDef.accent;
    roundedRect(ctx, -0.1 * w, bodyBottom - 0.1 * w, 0.2 * w, 0.06 * w, 0.01 * w);
    ctx.fill();

    if (opts.driver) {
      const d = opts.driver;
      const headR = 0.1 * w;
      const open = shape === 'cabrio' || shape === 'buggy';
      const headY = open ? bodyTop - 0.1 * w : cabTop;
      ctx.fillStyle = d.shirt;
      roundedRect(ctx, -0.14 * w, headY + headR * 0.5, 0.28 * w, 0.12 * w, 0.04 * w);
      ctx.fill();
      ctx.fillStyle = d.skin;
      ctx.beginPath();
      ctx.arc(0, headY, headR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = d.hair;
      ctx.beginPath();
      ctx.arc(0, headY - headR * 0.15, headR, Math.PI, Math.PI * 2);
      ctx.fill();
      if (d.bow) {
        ctx.fillStyle = d.bow;
        ctx.beginPath();
        ctx.arc(headR * 0.75, headY - headR * 0.7, headR * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  sprites.drawCharacter = function (ctx, cx, topY, size, charDef) {
    const headR = 0.28 * size;
    const headY = topY + headR + 0.04 * size;
    ctx.save();
    ctx.fillStyle = charDef.shirt;
    roundedRect(ctx, cx - 0.32 * size, topY + 0.56 * size, 0.64 * size, 0.44 * size, 0.12 * size);
    ctx.fill();
    ctx.fillStyle = charDef.skin;
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = charDef.hair;
    ctx.beginPath();
    ctx.arc(cx, headY - 0.06 * size, headR, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(cx - 0.1 * size, headY + 0.02 * size, 0.035 * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 0.1 * size, headY + 0.02 * size, 0.035 * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 0.025 * size;
    ctx.beginPath();
    ctx.arc(cx, headY + 0.08 * size, 0.12 * size, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    if (charDef.bow) {
      ctx.fillStyle = charDef.bow;
      ctx.beginPath();
      ctx.arc(cx + headR * 0.7, headY - headR * 0.75, 0.07 * size, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + headR * 0.95, headY - headR * 0.5, 0.07 * size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const emojiCache = new Map();

  sprites.emoji = function (char, sizePx) {
    const key = char + '@' + sizePx;
    const cached = emojiCache.get(key);
    if (cached) return cached;
    const c = document.createElement('canvas');
    c.width = sizePx;
    c.height = sizePx;
    const ectx = c.getContext('2d');
    ectx.font = Math.floor(sizePx * 0.92) + 'px sans-serif';
    ectx.textAlign = 'center';
    ectx.textBaseline = 'middle';
    ectx.fillText(char, sizePx / 2, sizePx / 2 + sizePx * 0.04);
    emojiCache.set(key, c);
    return c;
  };

  sprites.drawSprite = function (ctx, spriteCanvas, cx, bottomY, w) {
    const h = w * spriteCanvas.height / spriteCanvas.width;
    ctx.drawImage(spriteCanvas, cx - w / 2, bottomY - h, w, h);
  };
```

- [ ] **Крок 8: Запустити тести, переконатися що проходять**

```
node tests/sprites.test.js
```

Очікувано: `OK: 47 checks`, exit code 0.

- [ ] **Крок 9: Підключити тест у tests/all.js і прогнати всі тести**

Відкрий `tests/all.js` і додай наприкінці списку require рядок:

```js
require('./sprites.test.js');
```

Запусти:

```
node tests/all.js
```

Очікувано: по рядку `OK: N checks` на кожен тест-файл; лічильник у `tests/t.js` спільний для процесу, тому числа кумулятивні — окремого рядка з числом лише цього модуля НЕ буде. Головне: жодного рядка `FAIL:`, exit code 0.

- [ ] **Крок 10: Створити галерею tools/sprites-test.html для ручної перевірки**

Створи `tools/sprites-test.html`:

```html
<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8">
<title>Галерея спрайтів — Ромчик-Гонщик</title>
<style>
  body { font-family: "Chalkboard SE","Comic Sans MS",cursive,sans-serif; background: #E1F5FE; margin: 16px; }
  h2 { margin: 14px 0 6px; }
  .row { display: flex; flex-wrap: wrap; gap: 12px; }
  .cell { background: #fff; border-radius: 12px; padding: 8px; text-align: center; }
  .cell div { font-size: 14px; }
  canvas { display: block; margin: 0 auto; }
</style>
</head>
<body>
<h1>Галерея спрайтів</h1>
<h2>Машинки (вид ззаду)</h2>
<div class="row" id="cars"></div>
<h2>Машинки з водієм, поворотом і гальмами</h2>
<div class="row" id="carsOpts"></div>
<h2>Персонажі</h2>
<div class="row" id="chars"></div>
<h2>Емодзі-спрайти</h2>
<div class="row" id="emojis"></div>
<script src="../js/sprites.js"></script>
<script>
  const sprites = RG.sprites;
  function cell(parentId, label, w, h, draw) {
    const box = document.createElement('div');
    box.className = 'cell';
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'));
    const cap = document.createElement('div');
    cap.textContent = label;
    box.appendChild(c);
    box.appendChild(cap);
    document.getElementById(parentId).appendChild(box);
  }
  sprites.CAR_TYPES.forEach(function (car) {
    cell('cars', car.label, 140, 130, function (ctx) {
      sprites.drawCar(ctx, 70, 120, 110, car);
    });
    cell('carsOpts', car.label, 140, 130, function (ctx) {
      sprites.drawCar(ctx, 70, 120, 110, car, { steer: 0.7, driver: sprites.CHARACTERS[3], brake: true });
    });
  });
  sprites.CHARACTERS.forEach(function (ch) {
    cell('chars', ch.name, 120, 130, function (ctx) {
      sprites.drawCharacter(ctx, 60, 10, 110, ch);
    });
  });
  ['🌲', '🌴', '🚧', '🚂', '🚃', '⛵', '🏠'].forEach(function (e) {
    cell('emojis', e, 80, 80, function (ctx) {
      sprites.drawSprite(ctx, sprites.emoji(e, 64), 40, 76, 64);
    });
  });
</script>
</body>
</html>
```

- [ ] **Крок 11: Ручна перевірка галереї в браузері**

З кореня проєкту:

```
python3 -m http.server 8080
```

Відкрий `http://localhost:8080/tools/sprites-test.html` (сторінка також працює подвійним кліком через `file://`). Перевір очима:

- Перший ряд — 6 машинок ззаду: «Червона гоночна» зі спойлером; «Синій джип» і «Зелений баггі» з помітно більшими колесами (у джипа — запаска, у баггі — дуги каркаса); «Жовтий пікап» з бортом кузова; «Фіолетовий кабріолет» з відкритим верхом; «Райдужний болід» з вертикальним градієнтом червоний→жовтий→зелений→синій→фіолетовий.
- Другий ряд — ті самі машинки нахилені (steer), з головою Мії (бантик) над кузовом і яскраво-червоними стоп-сигналами.
- Персонажі — 4 усміхнені портрети з різним волоссям і футболками; у Мії рожевий бантик.
- Емодзі — 7 чітких (не розмитих) картинок, притиснутих до низу клітинок.

Якщо щось виглядає криво — поправ координати в `js/sprites.js` і онови сторінку (тести від цього зламатися не повинні: перезапусти `node tests/sprites.test.js` → `OK: 47 checks`).

- [ ] **Крок 12: Коміт**

```
git add js/sprites.js tests/sprites.test.js tests/all.js tools/sprites-test.html && git commit -m "feat: спрайти машинок і персонажів"
```

Очікувано: рядок виду `[main <hash>] feat: спрайти машинок і персонажів`, `4 files changed`.

---

### Task 5: road.js — псевдо-3D дорога

**Контекст.** Гра — дитяча гонка з ракурсом «псевдо-3D ззаду» (стиль OutRun): дорога складається з сегментів, що тікають удалечінь; повороти задаються кривизною сегментів, пагорби — координатою y, а тривимірність імітується проєкцією точок світу на екран. Цей модуль — ЧИСТА математика дороги: жодного DOM, Canvas чи браузерних API. Він повністю тестується в Node. Рендером займеться інший модуль (race.js), який споживає ці функції.

**Files:**
- Create: `js/road.js`, `tests/road.test.js`
- Modify: `tests/all.js` (додати require нового тесту)
- Test: `tests/road.test.js`

**Interfaces:**

*Consumes (вже існують у репозиторії з попередніх задач):*
- `js/utils.js` — модуль `RG.utils`; потрібна функція `utils.easeInOut(t) -> number` (реалізована як `-Math.cos(t * Math.PI) / 2 + 0.5`). У Node підключається `require('./utils.js')` (відносно `js/road.js`).
- `tests/t.js` — тестовий хелпер: `const { check, done } = require('./t.js');`; `check(name, cond)` рахує перевірку і друкує `FAIL: name` при провалі; `done()` наприкінці друкує `OK: N checks` (або `FAILED: N checks` з exit code 1).

*Produces (споживатимуть tracks.js, race.js, events.js):*
- Константи: `road.SEG_LEN = 200`, `road.ROAD_WIDTH = 2000`, `road.RUMBLE = 3`, `road.DRAW_DIST = 100`, `road.CAM_HEIGHT = 1000`, `road.FOV = 100`, `road.camDepth = 1 / Math.tan(road.FOV / 2 * Math.PI / 180)`.
- `road.addRoad(segments, enter, hold, leave, curve, dy)` — додає `enter+hold+leave` сегментів у масив `segments` (мутація), з плавним входом/виходом кривизни та підйомом на `dy` світових одиниць.
- `road.project(p, camX, camY, camZ, width, height)` — проєктує точку `p` (мутує `p.camera` і `p.screen`).
- `road.findSegment(segments, z) -> segment` — сегмент за світовою координатою z, із зацикленням.
- `road.buildTrack(trackDef) -> { segments, length }` — будує трасу з DSL-розкладки `trackDef.layout`.
- Формат сегмента: `{ index, curve, p1: {world:{x:0,y,z}, camera:{}, screen:{}}, p2: {world:{x:0,y,z}, camera:{}, screen:{}}, sprites: [], color: 0|1 }`. `color` — чергування смуг кожні `RUMBLE` сегментів: `Math.floor(index / road.RUMBLE) % 2`.
- Конвенція спрайтів узбіччя (заповнюють наступні задачі): `segment.sprites.push({ key: '🌲', offset: -1.6, scale: 1 })`; `offset` — у одиницях половини ширини дороги (`offset < -1` або `> 1` — за межами полотна), `scale` — множник розміру.

Усі команди виконуються з кореня репозиторію `/Users/romanprokopyshyn/Desktop/work/romchyk-racing`. Стиль коду: 2 пробіли, одинарні лапки, крапка з комою, const/let.

- [ ] **Крок 1: Написати тести констант і addRoad (що падають)**

Створи файл `tests/road.test.js`:

```js
const { check, done } = require('./t.js');
const utils = require('../js/utils.js');
const road = require('../js/road.js');

// --- Константи ---
check('SEG_LEN = 200', road.SEG_LEN === 200);
check('ROAD_WIDTH = 2000', road.ROAD_WIDTH === 2000);
check('RUMBLE = 3', road.RUMBLE === 3);
check('DRAW_DIST = 100', road.DRAW_DIST === 100);
check('CAM_HEIGHT = 1000', road.CAM_HEIGHT === 1000);
check('FOV = 100', road.FOV === 100);
check('camDepth', Math.abs(road.camDepth - 1 / Math.tan(road.FOV / 2 * Math.PI / 180)) < 1e-9);

// --- addRoad: пряма рівна ділянка ---
let segs = [];
road.addRoad(segs, 10, 10, 10, 0, 0);
check('addRoad: кількість = enter+hold+leave', segs.length === 30);
check('addRoad: індекси послідовні', segs[0].index === 0 && segs[29].index === 29);
check('addRoad: z за індексом (p1)', segs[5].p1.world.z === 5 * road.SEG_LEN);
check('addRoad: z за індексом (p2)', segs[5].p2.world.z === 6 * road.SEG_LEN);
check('addRoad: рівна дорога y=0', segs[0].p1.world.y === 0 && segs[29].p2.world.y === 0);
check('addRoad: curve=0 на прямій', segs.every(function (s) { return s.curve === 0; }));
check('addRoad: world.x завжди 0', segs[7].p1.world.x === 0 && segs[7].p2.world.x === 0);
check('addRoad: sprites порожній масив', Array.isArray(segs[0].sprites) && segs[0].sprites.length === 0);

// --- color: чергування кожні RUMBLE сегментів ---
check('color: сегменти 0..2 -> 0', segs[0].color === 0 && segs[2].color === 0);
check('color: сегменти 3..5 -> 1', segs[3].color === 1 && segs[5].color === 1);
check('color: сегмент 6 -> 0', segs[6].color === 0);

// --- addRoad: крива (enter -> hold -> leave) ---
segs = [];
road.addRoad(segs, 10, 10, 10, 6, 0);
check('curve: старт enter = 0', segs[0].curve === 0);
check('curve: середина enter', segs[5].curve === 6 * utils.easeInOut(0.5));
check('curve: hold = повна кривизна', segs[10].curve === 6 && segs[19].curve === 6);
check('curve: leave згасає', segs[29].curve === 6 * utils.easeInOut(1 / 10));

// --- addRoad: пагорб (підйом y) ---
segs = [];
road.addRoad(segs, 10, 10, 10, 0, 1000);
check('hill: старт y = 0', segs[0].p1.world.y === 0);
check('hill: кінець y = dy', segs[29].p2.world.y === 1000);
check('hill: неперервність p2->p1', segs[10].p2.world.y === segs[11].p1.world.y);
check('hill: y росте в середині', segs[14].p1.world.y < segs[14].p2.world.y);

// --- addRoad: накопичення висоти між викликами ---
road.addRoad(segs, 5, 5, 5, 0, -400);
check('accumulate: сегменти додаються', segs.length === 45);
check('accumulate: індекси продовжуються', segs[30].index === 30);
check('accumulate: y стартує з висоти попередньої ділянки', segs[30].p1.world.y === 1000);
check('accumulate: спуск на dy', segs[44].p2.world.y === 600);

done();
```

- [ ] **Крок 2: Запустити тест, переконатися що падає**

```
node tests/road.test.js
```
Очікувано: помилка `Error: Cannot find module '../js/road.js'`, exit code ненульовий (модуля ще нема).

- [ ] **Крок 3: Мінімальна реалізація — константи та addRoad**

Створи файл `js/road.js`:

```js
(function (root) {
  'use strict';
  const utils = (typeof require !== 'undefined') ? require('./utils.js') : root.utils;
  const road = {};

  road.SEG_LEN = 200;
  road.ROAD_WIDTH = 2000;
  road.RUMBLE = 3;
  road.DRAW_DIST = 100;
  road.CAM_HEIGHT = 1000;
  road.FOV = 100;
  road.camDepth = 1 / Math.tan(road.FOV / 2 * Math.PI / 180);

  function lastY(segments) {
    return segments.length === 0 ? 0 : segments[segments.length - 1].p2.world.y;
  }

  road.addRoad = function (segments, enter, hold, leave, curve, dy) {
    const startY = lastY(segments);
    const endY = startY + dy;
    const total = enter + hold + leave;
    for (let n = 0; n < total; n++) {
      const i = segments.length;
      let c;
      if (n < enter) c = curve * utils.easeInOut(n / enter);
      else if (n < enter + hold) c = curve;
      else c = curve * utils.easeInOut((total - n) / leave);
      const y1 = startY + (endY - startY) * utils.easeInOut(n / total);
      const y2 = startY + (endY - startY) * utils.easeInOut((n + 1) / total);
      segments.push({
        index: i, curve: c,
        p1: { world: { x: 0, y: y1, z: i * road.SEG_LEN }, camera: {}, screen: {} },
        p2: { world: { x: 0, y: y2, z: (i + 1) * road.SEG_LEN }, camera: {}, screen: {} },
        sprites: [], color: Math.floor(i / road.RUMBLE) % 2
      });
    }
  };

  root.road = road;
  if (typeof module !== 'undefined' && module.exports) module.exports = road;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 4: Запустити, переконатися що проходить**

```
node tests/road.test.js
```
Очікувано: `OK: 30 checks`, exit code 0.

- [ ] **Крок 5: Написати тести project (що падають)**

У `tests/road.test.js` додай цей блок ПЕРЕД рядком `done();`:

```js
// --- project: точка попереду камери по центру ---
const p = { world: { x: 0, y: 0, z: 1000 }, camera: {}, screen: {} };
road.project(p, 0, road.CAM_HEIGHT, 0, 800, 600);
check('project: camera.x', p.camera.x === 0);
check('project: camera.y', p.camera.y === -road.CAM_HEIGHT);
check('project: camera.z', p.camera.z === 1000);
check('project: screen.x у центрі', p.screen.x === 400);
check('project: дорога нижче горизонту', p.screen.y > 300);
check('project: scale = camDepth/z', Math.abs(p.screen.scale - road.camDepth / 1000) < 1e-9);
check('project: screen.w', p.screen.w === Math.round(p.screen.scale * road.ROAD_WIDTH * 400));

// --- project: масштаб спадає з відстанню ---
const far = { world: { x: 0, y: 0, z: 4000 }, camera: {}, screen: {} };
road.project(far, 0, road.CAM_HEIGHT, 0, 800, 600);
check('project: далі -> менший scale', far.screen.scale < p.screen.scale);
check('project: далі -> вужча дорога', far.screen.w < p.screen.w);
check('project: далі -> ближче до горизонту', far.screen.y < p.screen.y && far.screen.y >= 300);

// --- project: точка позаду камери не ламає ділення ---
const behind = { world: { x: 0, y: 0, z: 100 }, camera: {}, screen: {} };
road.project(behind, 0, road.CAM_HEIGHT, 500, 800, 600);
check('project: z позаду клемпиться до 0.01', behind.camera.z === 0.01);

// --- project: x-зсув точки зміщує екранну позицію ---
const side = { world: { x: 500, y: 0, z: 1000 }, camera: {}, screen: {} };
road.project(side, 0, road.CAM_HEIGHT, 0, 800, 600);
check('project: правіше центру', side.screen.x > 400);
```

- [ ] **Крок 6: Запустити, переконатися що падає**

```
node tests/road.test.js
```
Очікувано: аварійне завершення з `TypeError: road.project is not a function`, exit code ненульовий.

- [ ] **Крок 7: Мінімальна реалізація project**

У `js/road.js` додай ПЕРЕД рядком `root.road = road;`:

```js
  road.project = function (p, camX, camY, camZ, width, height) {
    p.camera.x = p.world.x - camX;
    p.camera.y = p.world.y - camY;
    p.camera.z = p.world.z - camZ;
    if (p.camera.z <= 0) p.camera.z = 0.01;
    const scale = road.camDepth / p.camera.z;
    p.screen.scale = scale;
    p.screen.x = Math.round(width / 2 + scale * p.camera.x * width / 2);
    p.screen.y = Math.round(height / 2 - scale * p.camera.y * height / 2);
    p.screen.w = Math.round(scale * road.ROAD_WIDTH * width / 2);
  };
```

- [ ] **Крок 8: Запустити, переконатися що проходить**

```
node tests/road.test.js
```
Очікувано: `OK: 42 checks`, exit code 0.

- [ ] **Крок 9: Написати тести findSegment (що падають)**

У `tests/road.test.js` додай ПЕРЕД рядком `done();`:

```js
// --- findSegment: межі та зациклення ---
segs = [];
road.addRoad(segs, 5, 5, 5, 0, 0);
const trackLen = segs.length * road.SEG_LEN;
check('findSegment: z=0 -> перший', road.findSegment(segs, 0) === segs[0]);
check('findSegment: всередині сегмента', road.findSegment(segs, 250) === segs[1]);
check('findSegment: точна межа', road.findSegment(segs, 400) === segs[2]);
check('findSegment: останній', road.findSegment(segs, trackLen - 1) === segs[14]);
check('findSegment: z = довжина -> зациклення', road.findSegment(segs, trackLen) === segs[0]);
check('findSegment: кілька кіл', road.findSegment(segs, trackLen * 2 + 450) === segs[2]);
```

- [ ] **Крок 10: Запустити, переконатися що падає**

```
node tests/road.test.js
```
Очікувано: `TypeError: road.findSegment is not a function`, exit code ненульовий.

- [ ] **Крок 11: Мінімальна реалізація findSegment**

У `js/road.js` додай ПЕРЕД рядком `root.road = road;`:

```js
  road.findSegment = function (segments, z) {
    return segments[Math.floor(z / road.SEG_LEN) % segments.length];
  };
```

- [ ] **Крок 12: Запустити, переконатися що проходить**

```
node tests/road.test.js
```
Очікувано: `OK: 48 checks`, exit code 0.

- [ ] **Крок 13: Написати тести buildTrack (що падають)**

DSL розкладки траси: `layout` — масив елементів `['straight', n]` → `addRoad(n,n,n,0,0)`; `['curve', n, c]` → `addRoad(n,n,n,c,0)`; `['hill', n, h]` → `addRoad(n,n,n,0,h*road.SEG_LEN)`; `['curvyhill', n, c, h]` → `addRoad(n,n,n,c,h*road.SEG_LEN)`.

У `tests/road.test.js` додай ПЕРЕД рядком `done();`:

```js
// --- buildTrack: DSL розкладки ---
const trackDef = {
  layout: [
    ['straight', 5],
    ['curve', 4, 3],
    ['hill', 4, 2],
    ['curvyhill', 3, -2, -1]
  ]
};
const built = road.buildTrack(trackDef);
check('buildTrack: кількість сегментів', built.segments.length === 15 + 12 + 12 + 9);
check('buildTrack: length = segments * SEG_LEN', built.length === built.segments.length * road.SEG_LEN);
check('buildTrack: straight прямий і рівний', built.segments[0].curve === 0 && built.segments[14].p2.world.y === 0);
check('buildTrack: curve hold', built.segments[19].curve === 3);
check('buildTrack: hill піднімає на h*SEG_LEN', built.segments[38].p2.world.y === 2 * road.SEG_LEN);
check('buildTrack: curvyhill кривизна', built.segments[42].curve === -2);
check('buildTrack: curvyhill спуск', built.segments[47].p2.world.y === 1 * road.SEG_LEN);
check('buildTrack: свіжі сегменти щоразу', road.buildTrack(trackDef).segments !== built.segments);
```

- [ ] **Крок 14: Запустити, переконатися що падає**

```
node tests/road.test.js
```
Очікувано: `TypeError: road.buildTrack is not a function`, exit code ненульовий.

- [ ] **Крок 15: Мінімальна реалізація buildTrack**

У `js/road.js` додай ПЕРЕД рядком `root.road = road;`:

```js
  road.buildTrack = function (trackDef) {
    const segments = [];
    for (let i = 0; i < trackDef.layout.length; i++) {
      const item = trackDef.layout[i];
      const kind = item[0];
      const n = item[1];
      if (kind === 'straight') road.addRoad(segments, n, n, n, 0, 0);
      else if (kind === 'curve') road.addRoad(segments, n, n, n, item[2], 0);
      else if (kind === 'hill') road.addRoad(segments, n, n, n, 0, item[2] * road.SEG_LEN);
      else if (kind === 'curvyhill') road.addRoad(segments, n, n, n, item[2], item[3] * road.SEG_LEN);
    }
    return { segments: segments, length: segments.length * road.SEG_LEN };
  };
```

- [ ] **Крок 16: Запустити, переконатися що проходить**

```
node tests/road.test.js
```
Очікувано: `OK: 56 checks`, exit code 0.

- [ ] **Крок 17: Підключити тест до tests/all.js і прогнати всі тести**

У кінець файлу `tests/all.js` додай рядок:

```js
require('./road.test.js');
```

Запусти:

```
node tests/all.js
```
Очікувано: рядки `OK: … checks` для всіх тестових файлів, ЖОДНОГО рядка `FAIL:`, exit code 0.

- [ ] **Крок 18: Коміт**

```
git add js/road.js tests/road.test.js tests/all.js && git commit -m "feat: псевдо-3D дорога"
```
Очікувано: коміт створено, у виводі `3 files changed` і повідомлення `feat: псевдо-3D дорога`.

---

### Task 6: tracks.js — три траси: гори, море, місто

Мета задачі: створити модуль даних `js/tracks.js` з масивом `tracks.TRACKS` — три траси (Гори, Море, Місто) з палітрами кольорів, емодзі-декораціями узбіч, прапорцями фонових анімацій та layout-описом дороги у DSL, який розгортає `road.buildTrack` (Task 5). Модуль — чисті дані без DOM/Canvas, тому повністю тестується в Node. Розробка через TDD: спершу тест, що падає, потім реалізація.

**Передумови:** виконані Task 1 (є `js/utils.js`, `tests/t.js`, `tests/all.js`) і Task 5 (є `js/road.js` з `road.buildTrack` і `road.SEG_LEN`).

**Стиль коду (обов'язково):** 2 пробіли відступу, одинарні лапки, крапка з комою, `const`/`let`. Ідентифікатори англійською, рядки для UI (назви трас) — українською.

**Files:**
- Create: `js/tracks.js`
- Create: `tests/tracks.test.js`
- Modify: `tests/all.js` (додати require нового тесту)
- Test: `tests/tracks.test.js`

**Interfaces:**

*Consumes* (з попередніх задач):
- `road.buildTrack(trackDef) -> {segments, length}` з `js/road.js` (Node: `require('../js/road.js')`) — читає `trackDef.layout`: `['straight', n]` → 3n сегментів прямої; `['curve', n, c]` → 3n сегментів повороту сили `c`; `['hill', n, h]` → 3n сегментів підйому/спуску на `h * road.SEG_LEN`; `['curvyhill', n, c, h]` → поворот + пагорб. `length = segments.length * road.SEG_LEN`.
- `road.SEG_LEN` — число `200`.
- `tests/t.js`: `const { check, done } = require('./t.js');` — `check(name, cond)` рахує перевірки, `done()` друкує `OK: N checks` (exit 0) або `FAILED: N checks` (exit 1).

*Produces* (використовують наступні задачі):
- `tracks.TRACKS` — масив із РІВНО 3 об'єктів у порядку mountains, sea, city. Точна форма кожного:

```js
{
  id: 'mountains' | 'sea' | 'city',
  name: 'Гори' | 'Море' | 'Місто',          // UI-рядок, українською
  emoji: '🏔️' | '🌊' | '🏙️',
  palette: { skyTop, skyBottom, hillFar, hillNear, ground, groundAlt,
             road, roadAlt, rumbleA, rumbleB, lane },   // усі — hex-рядки '#RRGGBB'
  scenery: ['🌲', ...],   // емодзі узбіч, з повтореннями для ваги
  bgTrain: bool,          // потяг у фоновому паралаксі (гори: віадук, місто: біля вокзалу)
  bgBoats: bool,          // кораблики у паралаксі (тільки море)
  layout: [ ['straight', 25], ['curve', 30, 4], ... ]  // разом 450–550 сегментів
}
```

- Споживачі: Task 7 (`race.create({ trackDef, ... })` — використовує `palette`, `layout`, `bgTrain`, `bgBoats`; після `buildTrack` розкидає `scenery`-спрайти кожні 2–4 сегменти по обидва боки з offset -2.5..-1.3 та 1.3..2.5), Task 9 (екран вибору траси — картки з `emoji` + `name`, колбек `onTrackPicked(trackDef)`).
- У браузері модуль доступний як `RG.tracks` (класичний `<script src>`, БЕЗ import/export), у Node — через `module.exports`.

Характер трас (закріплюється тестом): **гори** — серпантин (часті повороти силою ±4..6) і пагорби (±40..80); **море** — плавні довгі повороти ±2..3, майже без пагорбів; **місто** — довгі прямі та короткі «прямокутні» повороти ±5..6, повна рівнина.

- [ ] **Крок 1: написати тест, що падає — `tests/tracks.test.js`**

Створити файл `tests/tracks.test.js` з ПОВНИМ вмістом:

```js
const { check, done } = require('./t.js');
const road = require('../js/road.js');
const tracks = require('../js/tracks.js');

const HEX = /^#[0-9A-Fa-f]{6}$/;
const PALETTE_KEYS = [
  'skyTop', 'skyBottom', 'hillFar', 'hillNear', 'ground', 'groundAlt',
  'road', 'roadAlt', 'rumbleA', 'rumbleB', 'lane'
];

function curveStrengths(t) {
  return t.layout
    .filter(function (el) { return el[0] === 'curve' || el[0] === 'curvyhill'; })
    .map(function (el) { return Math.abs(el[2]); });
}

function hillHeights(t) {
  return t.layout
    .filter(function (el) { return el[0] === 'hill' || el[0] === 'curvyhill'; })
    .map(function (el) { return Math.abs(el[0] === 'hill' ? el[2] : el[3]); });
}

// --- загальна структура ---
check('TRACKS is an array of 3 tracks',
  Array.isArray(tracks.TRACKS) && tracks.TRACKS.length === 3);
check('track ids in order mountains,sea,city',
  tracks.TRACKS.map(function (t) { return t.id; }).join(',') === 'mountains,sea,city');
check('track names in order Гори,Море,Місто',
  tracks.TRACKS.map(function (t) { return t.name; }).join(',') === 'Гори,Море,Місто');

// --- обов'язкові поля і збірка кожної траси ---
tracks.TRACKS.forEach(function (t) {
  check(t.id + ': emoji is a non-empty string',
    typeof t.emoji === 'string' && t.emoji.length > 0);
  check(t.id + ': bgTrain is boolean', typeof t.bgTrain === 'boolean');
  check(t.id + ': bgBoats is boolean', typeof t.bgBoats === 'boolean');
  check(t.id + ': scenery has at least 5 entries',
    Array.isArray(t.scenery) && t.scenery.length >= 5);
  check(t.id + ': scenery entries are non-empty strings',
    t.scenery.every(function (s) { return typeof s === 'string' && s.length > 0; }));
  check(t.id + ': palette has all 11 keys',
    PALETTE_KEYS.every(function (k) { return typeof t.palette[k] === 'string'; }));
  check(t.id + ': palette colors are valid hex',
    PALETTE_KEYS.every(function (k) { return HEX.test(t.palette[k]); }));
  check(t.id + ': layout is a non-empty array',
    Array.isArray(t.layout) && t.layout.length > 0);

  const built = road.buildTrack(t);
  check(t.id + ': builds 450..550 segments',
    built.segments.length >= 450 && built.segments.length <= 550);
  check(t.id + ': length = segments * SEG_LEN',
    built.length === built.segments.length * road.SEG_LEN);
});

const mountains = tracks.TRACKS[0];
const sea = tracks.TRACKS[1];
const city = tracks.TRACKS[2];

// --- точні емодзі ---
check('mountains emoji', mountains.emoji === '🏔️');
check('sea emoji', sea.emoji === '🌊');
check('city emoji', city.emoji === '🏙️');

// --- характер: гори = серпантин + пагорби ---
check('mountains: at least 4 hill elements', hillHeights(mountains).length >= 4);
check('mountains: hill heights within 40..80',
  hillHeights(mountains).every(function (h) { return h >= 40 && h <= 80; }));
check('mountains: curve strengths within 4..6',
  curveStrengths(mountains).every(function (c) { return c >= 4 && c <= 6; }));

// --- характер: море = плавні повороти, майже рівнина ---
check('sea: gentle curves within 2..3',
  curveStrengths(sea).every(function (c) { return c >= 2 && c <= 3; }));
check('sea: almost flat (max 2 hills, height <= 20)',
  hillHeights(sea).length <= 2 &&
  hillHeights(sea).every(function (h) { return h <= 20; }));

// --- характер: місто = прямі + короткі круті повороти, рівнина ---
check('city: completely flat (no hill elements)', hillHeights(city).length === 0);
check('city: at least 5 straights',
  city.layout.filter(function (el) { return el[0] === 'straight'; }).length >= 5);
check('city: sharp curves within 5..6',
  curveStrengths(city).every(function (c) { return c >= 5 && c <= 6; }));

// --- фонові анімації ---
check('bgTrain: mountains and city only',
  mountains.bgTrain === true && city.bgTrain === true && sea.bgTrain === false);
check('bgBoats: sea only',
  sea.bgBoats === true && mountains.bgBoats === false && city.bgBoats === false);

done();
```

- [ ] **Крок 2: запустити тест і переконатися, що він падає**

```
node tests/tracks.test.js
```

Очікуваний результат: помилка завантаження модуля, exit-код 1. Вивід містить рядок:

```
Error: Cannot find module '../js/tracks.js'
```

Якщо натомість бачиш `Cannot find module '../js/road.js'` — Task 5 не виконано, зупинись і виконай спершу її.

- [ ] **Крок 3: створити `js/tracks.js` з трьома трасами**

Створити файл `js/tracks.js` з ПОВНИМ вмістом (стандартна обгортка проєкту: IIFE, глобал `RG.tracks` у браузері, `module.exports` у Node; модуль — чисті дані, залежностей не має):

```js
(function (root) {
  'use strict';
  const tracks = {};

  // Кожен елемент layout розгортається у road.buildTrack (Task 5):
  //   ['straight', n]        -> 3n сегментів прямої
  //   ['curve', n, c]        -> 3n сегментів повороту сили c
  //   ['hill', n, h]         -> 3n сегментів зі зміною висоти h * SEG_LEN
  //   ['curvyhill', n, c, h] -> поворот і пагорб одночасно
  // Сумарна висота кожної траси зведена до нуля (фініш на рівні старту).
  tracks.TRACKS = [
    {
      id: 'mountains',
      name: 'Гори',
      emoji: '🏔️',
      palette: {
        skyTop: '#4FC3F7', skyBottom: '#B3E5FC',
        hillFar: '#B0BEC5', hillNear: '#81C784',
        ground: '#66BB6A', groundAlt: '#5DAF61',
        road: '#6B6B6B', roadAlt: '#646464',
        rumbleA: '#FFFFFF', rumbleB: '#E53935',
        lane: '#FFFFFF'
      },
      scenery: ['🌲', '🌲', '🌲', '🌳', '🌲', '🪨', '⛰️', '🌲', '🌼'],
      bgTrain: true,   // потяг на віадуку в паралаксі
      bgBoats: false,
      // Серпантин: часті повороти ±4..6, пагорби ±40..80. Разом 501 сегмент.
      layout: [
        ['straight', 12],
        ['curve', 9, 4],
        ['hill', 10, 60],
        ['curve', 9, -5],
        ['curvyhill', 10, 5, 40],
        ['curve', 8, -6],
        ['hill', 10, -80],
        ['curve', 9, 6],
        ['straight', 8],
        ['curvyhill', 10, -4, 70],
        ['curve', 9, 5],
        ['hill', 10, -50],
        ['curve', 9, -6],
        ['curvyhill', 10, 6, -80],
        ['curve', 8, -4],
        ['hill', 8, 40],
        ['curve', 8, 5],
        ['straight', 10]
      ]
    },
    {
      id: 'sea',
      name: 'Море',
      emoji: '🌊',
      palette: {
        skyTop: '#29B6F6', skyBottom: '#FFF9C4',
        hillFar: '#0288D1', hillNear: '#4DD0E1',
        ground: '#FFE082', groundAlt: '#F7D670',
        road: '#8D8D8D', roadAlt: '#858585',
        rumbleA: '#FFFFFF', rumbleB: '#039BE5',
        lane: '#FFFFFF'
      },
      scenery: ['🌴', '🌴', '🌴', '⛱️', '🌴', '🐚', '🌺', '🌴'],
      bgTrain: false,
      bgBoats: true,   // кораблики гойдаються в паралаксі
      // Узбережжя: довгі плавні повороти ±2..3, два ледь помітні пагорби ±20.
      // Разом 498 сегментів.
      layout: [
        ['straight', 15],
        ['curve', 15, 2],
        ['straight', 8],
        ['curve', 15, -3],
        ['straight', 10],
        ['curve', 18, 2],
        ['hill', 8, 20],
        ['curve', 15, -2],
        ['straight', 12],
        ['curve', 16, 3],
        ['hill', 8, -20],
        ['curve', 14, -2],
        ['straight', 12]
      ]
    },
    {
      id: 'city',
      name: 'Місто',
      emoji: '🏙️',
      palette: {
        skyTop: '#64B5F6', skyBottom: '#E1F5FE',
        hillFar: '#9FA8DA', hillNear: '#7986CB',
        ground: '#A5A5A5', groundAlt: '#9B9B9B',
        road: '#5F5F5F', roadAlt: '#585858',
        rumbleA: '#FFFFFF', rumbleB: '#FDD835',
        lane: '#FFEE58'
      },
      scenery: ['🏢', '🏠', '🏢', '🚦', '🌳', '🏪', '🏢', '🏫', '🌳'],
      bgTrain: true,   // потяг біля вокзалу в паралаксі
      bgBoats: false,
      // Місто: довгі прямі та короткі "прямокутні" повороти ±5..6, рівнина.
      // Разом 462 сегменти.
      layout: [
        ['straight', 18],
        ['curve', 6, 6],
        ['straight', 14],
        ['curve', 6, -6],
        ['straight', 12],
        ['curve', 6, -5],
        ['straight', 16],
        ['curve', 6, 6],
        ['straight', 10],
        ['curve', 6, 5],
        ['straight', 14],
        ['curve', 6, -6],
        ['straight', 12],
        ['curve', 6, 5],
        ['straight', 16]
      ]
    }
  ];

  root.tracks = tracks;
  if (typeof module !== 'undefined' && module.exports) module.exports = tracks;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 4: запустити тест і переконатися, що він проходить**

```
node tests/tracks.test.js
```

Очікуваний вивід (рівно один рядок, exit-код 0):

```
OK: 46 checks
```

Якщо є рядки `FAIL: ...` — звір layout і палітри з кроком 3 посимвольно (найчастіші помилки: пропущений ключ палітри, поворот поза діапазоном характеру траси, сума сегментів поза 450–550).

- [ ] **Крок 5: підключити тест до `tests/all.js` і прогнати всі тести**

Відкрити `tests/all.js` і додати В КІНЕЦЬ списку require (після рядка з тестом road) один рядок:

```js
require('./tracks.test.js');
```

Запустити:

```
node tests/all.js
echo $?
```

Очікуваний результат: жодного рядка `FAIL:`; кілька рядків виду `OK: N checks` (лічильник у `tests/t.js` спільний для процесу, тому числа кумулятивні — останнє число ≥ 46 і дорівнює сумі перевірок усіх задач); `echo $?` друкує `0`.

- [ ] **Крок 6: коміт**

```
git add js/tracks.js tests/tracks.test.js tests/all.js && git commit -m "feat: три траси — гори, море, місто"
```

Очікуваний результат: коміт створено, у виводі `3 files changed`. Примітка: `js/tracks.js` ПОКИ НЕ підключається до `index.html` — це зробить задача зшивання (порядок скриптів: `utils.js, learning.js, audio.js, sprites.js, road.js, tracks.js, race.js, events.js, screens.js, main.js`).

---

### Task 7: race.js — ігровий цикл гонки з суперниками

**Мета:** модуль `RG.race` — стан гонки та її Canvas-рендер: авто-газ, кермування пальцем/клавішами, центробіжна сила, м'які зіткнення з конусами, троє суперників із rubber-banding, пауза для сюжетних зупинок, детекція фінішу, конфеті, повний draw (небо, паралакс, псевдо-3D дорога, спрайти, машинки). Гра не має стану програшу: зіткнення лише сповільнює, фініш завжди настає.

**Files:**
- Create: `js/race.js`, `tests/race.test.js`, `tools/race-test.html`
- Modify: `tests/all.js`
- Test: `tests/race.test.js`

**Interfaces:**

Consumes (усе вже є в репозиторії):
- `tests/t.js`: `check(name, cond)`, `done()`; успіх друкує `OK: N checks`, exit 0.
- `js/utils.js` (`RG.utils`): `clamp(v, min, max)`, `lerp(a, b, t)`, `randInt(min, max, rng)` (включно), `pick(arr, rng)`.
- `js/road.js` (`RG.road`): константи `SEG_LEN = 200`, `ROAD_WIDTH = 2000`, `DRAW_DIST = 100`, `CAM_HEIGHT = 1000`, `camDepth`; `road.buildTrack(trackDef) -> {segments, length}`; `road.project(p, camX, camY, camZ, width, height)` — заповнює `p.camera.{x,y,z}` і `p.screen.{x,y,w,scale}`; `road.findSegment(segments, z) -> segment`. Сегмент: `{index, curve, p1, p2, sprites: [], color: 0|1}` (0 — «світла» смуга).
- `js/tracks.js` (`RG.tracks`): описи трас `{id, name, emoji, palette: {skyTop, skyBottom, hillFar, hillNear, ground, groundAlt, road, roadAlt, rumbleA, rumbleB, lane}, scenery, bgTrain, bgBoats, layout}`.
- `js/sprites.js` (`RG.sprites`): `sprites.drawCar(ctx, cx, bottomY, w, carDef, opts /* {steer, driver, brake} */)`, `sprites.emoji(char, sizePx) -> canvas`, `sprites.drawSprite(ctx, spriteCanvas, cx, bottomY, w)`, `sprites.CHARACTERS`, `sprites.CAR_TYPES`.
- `js/audio.js` (`RG.audio`): `audio.sfx(name)` (тут — `'honk'`), `audio.engine(speedRatio /* 0..1 */)`; обидва — безпечні no-op у Node.

Produces (використають Task 8 events.js і Task 10 main.js):
- `race.MAX_SPEED` — `road.SEG_LEN * 12`.
- `race.rubberBand(playerZ, oppZ, base) -> number` — чиста функція.
- `race.create(opts) -> r`; opts: `{canvas, trackDef, playerChar, carDef, opponents: [{charDef, carDef}] (3 шт), shortTrack: bool}`.
- Поля `r`: `playerZ`, `playerX` (клемп -2..2; дорога -1..1), `speed`, `state: 'running'|'paused'|'finished'`, `segments`, `length`, `opponents: [{z, x, lane, phase, speed, charDef, carDef}]`, `stars`, `stopScene` (null або `{type, t}`; `t` накопичує dt в update).
- Методи: `r.update(dt)`, `r.draw()`, `r.setPointerX(xNorm|null)` (0..1 або null — палець відпущено), `r.setKeys(left, right)`, `r.pause()`, `r.resume()` (повертає 'running' і очищає stopScene), `r.confetti()`.
- Хуки: `r.onTick = fn(r, dt)` — щокадру ПІСЛЯ руху; `r.onFinish = fn()` — один раз при `playerZ >= length - 2*SEG_LEN`.

- [ ] **Крок 1: написати тест чистої логіки (rubberBand, create), що падає**

Створити `tests/race.test.js`:

```js
const { check, done } = require('./t.js');
const road = require('../js/road.js');
const race = require('../js/race.js');

const PAL = {
  skyTop: '#4FC3F7', skyBottom: '#B3E5FC', hillFar: '#90A4AE', hillNear: '#78909C',
  ground: '#66BB6A', groundAlt: '#81C784', road: '#616161', roadAlt: '#757575',
  rumbleA: '#F44336', rumbleB: '#FAFAFA', lane: '#FAFAFA'
};
const CHAR = { id: 'romchyk', name: 'Ромчик', hair: '#8B5A2B', shirt: '#E53935', skin: '#FFD8B5' };
const CAR = { id: 'race', label: 'Червона гоночна', color: '#E53935', accent: '#FFCDD2', shape: 'race' };

function fakeTrack(layout) {
  return {
    id: 'test', name: 'Тест', emoji: '🏁', palette: PAL, scenery: ['🌲'],
    bgTrain: false, bgBoats: false,
    layout: layout || [['straight', 10], ['curve', 10, 4], ['straight', 20]]
  };
}
function makeRace(shortTrack, layout) {
  return race.create({
    canvas: { width: 800, height: 600, getContext: function () { return null; } },
    trackDef: fakeTrack(layout),
    playerChar: CHAR, carDef: CAR,
    opponents: [
      { charDef: CHAR, carDef: CAR },
      { charDef: CHAR, carDef: CAR },
      { charDef: CHAR, carDef: CAR }
    ],
    shortTrack: !!shortTrack
  });
}

check('MAX_SPEED = SEG_LEN * 12', race.MAX_SPEED === road.SEG_LEN * 12);
check('rubberBand: рівні позиції -> base', race.rubberBand(0, 0, 100) === 100);
check('rubberBand: далеко позаду -> 0.6*base', race.rubberBand(0, 100000, 100) === 60);
check('rubberBand: далеко попереду -> 1.15*base', Math.abs(race.rubberBand(100000, 0, 100) - 115) < 1e-9);
check('rubberBand: +400 -> 1.05*base', Math.abs(race.rubberBand(400, 0, 100) - 105) < 1e-9);

const r1 = makeRace(false);
check('початковий стан', r1.state === 'running' && r1.playerZ === 0 && r1.playerX === 0 && r1.speed === 0);
check('120 сегментів з тестового layout', r1.segments.length === 120);
check('length = segments * SEG_LEN', r1.length === r1.segments.length * road.SEG_LEN);
check('3 суперники', r1.opponents.length === 3);
check('стартові z: +400/+800/+1200', r1.opponents[0].z === 400 && r1.opponents[1].z === 800 && r1.opponents[2].z === 1200);
check('смуги: -0.5/0/0.5', r1.opponents[0].lane === -0.5 && r1.opponents[1].lane === 0 && r1.opponents[2].lane === 0.5);

const rs = makeRace(true,
  [['straight', 20], ['straight', 20], ['straight', 20], ['straight', 20], ['straight', 20]]);
check('shortTrack обрізає 300 -> ~80+ сегментів', rs.segments.length === 120);

done();
```

- [ ] **Крок 2: запустити тест, переконатися що падає**

```
node tests/race.test.js
```

Очікувано: `Error: Cannot find module '../js/race.js'`, exit code ≠ 0.

- [ ] **Крок 3: мінімальна реалізація — каркас модуля, rubberBand, create**

Створити `js/race.js` (update/draw поки заглушки — їх замінимо в кроках 7 і 9):

```js
(function (root) {
  'use strict';
  const utils = (typeof require !== 'undefined') ? require('./utils.js') : root.utils;
  const road = (typeof require !== 'undefined') ? require('./road.js') : root.road;
  const sprites = (typeof require !== 'undefined') ? require('./sprites.js') : root.sprites;
  const audio = (typeof require !== 'undefined') ? require('./audio.js') : root.audio;
  const race = {};

  race.MAX_SPEED = road.SEG_LEN * 12;
  const ACCEL = race.MAX_SPEED / 3;

  race.rubberBand = function (playerZ, oppZ, base) {
    return base * utils.clamp(1 + (playerZ - oppZ) / 8000, 0.6, 1.15);
  };

  function decorate(segments, scenery) {
    if (!scenery || scenery.length === 0) return;
    let i = utils.randInt(2, 4);
    while (i < segments.length) {
      segments[i].sprites.push({ key: utils.pick(scenery), offset: -(1.3 + Math.random() * 1.2), scale: 1 + Math.random() * 0.5 });
      segments[i].sprites.push({ key: utils.pick(scenery), offset: 1.3 + Math.random() * 1.2, scale: 1 + Math.random() * 0.5 });
      i += utils.randInt(2, 4);
    }
  }

  race.create = function (opts) {
    const canvas = opts.canvas;
    const ctx = (canvas && canvas.getContext) ? canvas.getContext('2d') : null;
    const trackDef = opts.trackDef;
    let layout = trackDef.layout;
    if (opts.shortTrack) {
      const cut = [];
      let count = 0;
      for (let i = 0; i < layout.length && count < 80; i++) {
        cut.push(layout[i]);
        count += layout[i][1] * 3;
      }
      layout = cut;
    }
    const built = road.buildTrack({ layout: layout });
    decorate(built.segments, trackDef.scenery);

    const lanes = [-0.5, 0, 0.5];
    const r = {
      playerZ: 0, playerX: 0, speed: 0, state: 'running',
      segments: built.segments, length: built.length,
      opponents: (opts.opponents || []).map(function (o, i) {
        return { z: 400 + 400 * i, x: lanes[i % 3], lane: lanes[i % 3], phase: i * 2.1, speed: 0, charDef: o.charDef, carDef: o.carDef };
      }),
      stars: 0, trackDef: trackDef, playerChar: opts.playerChar, carDef: opts.carDef,
      stopScene: null, onTick: null, onFinish: null
    };

    let pointerX = null;
    let keyLeft = false;
    let keyRight = false;
    let steer = 0;
    let t = 0;
    let bgShift = 0;
    let particles = [];

    r.setPointerX = function (xNorm) { pointerX = xNorm; };
    r.setKeys = function (left, right) { keyLeft = !!left; keyRight = !!right; };
    r.pause = function () { r.state = 'paused'; };
    r.resume = function () {
      if (r.state === 'paused') r.state = 'running';
      r.stopScene = null;
    };
    r.confetti = function () {
      const w = canvas ? canvas.width : 800;
      const h = canvas ? canvas.height : 600;
      const colors = ['#E53935', '#FDD835', '#43A047', '#1E88E5', '#8E24AA', '#F06292'];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: w / 2 + (Math.random() - 0.5) * w * 0.3, y: h * 0.3,
          vx: (Math.random() - 0.5) * w * 0.6, vy: -Math.random() * h * 0.5,
          size: 4 + Math.random() * 6, color: colors[i % colors.length], life: 1.5 + Math.random()
        });
      }
    };
    r.update = function (dt) {};
    r.draw = function () {};

    return r;
  };

  root.race = race;
  if (typeof module !== 'undefined' && module.exports) module.exports = race;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 4: запустити тест, переконатися що проходить**

```
node tests/race.test.js
```

Очікувано: `OK: 12 checks`, exit 0.

- [ ] **Крок 5: дописати тести update/керування/зіткнень/фінішу/паузи/хуків**

У `tests/race.test.js` вставити ПЕРЕД рядком `done();`:

```js
const r2 = makeRace(false);
r2.update(1);
check('авто-газ: ACCEL за секунду і рух', r2.speed === race.MAX_SPEED / 3 && r2.playerZ === race.MAX_SPEED / 3);
r2.update(1); r2.update(1); r2.update(1);
check('швидкість не перевищує MAX_SPEED', r2.speed === race.MAX_SPEED);

const r3 = makeRace(false);
r3.setPointerX(1);
r3.update(0.1);
check('палець: тягне до цілі зі швидкістю 3.5/с', Math.abs(r3.playerX - 0.35) < 1e-9);

const r4 = makeRace(false);
r4.setKeys(false, true);
r4.update(0.1);
check('клавіші: 1.8/с', Math.abs(r4.playerX - 0.18) < 1e-9);

const r5 = makeRace(false);
r5.setKeys(true, false);
r5.setPointerX(0.5);
r5.update(0.1);
check('палець пріоритетніший за клавіші', r5.playerX === 0);

const r6 = makeRace(false);
r6.playerX = 5;
r6.update(0.016);
check('off-road клемп: playerX <= 2', r6.playerX === 2);
r6.playerX = -5;
r6.update(0.016);
check('off-road клемп: playerX >= -2', r6.playerX === -2);

const r7 = makeRace(false);
const cone = { key: '🚧', offset: 0, scale: 1 };
r7.segments[0].sprites.push(cone);
r7.speed = 1000;
r7.update(0.016);
check('конус: speed *= 0.3', r7.speed < 400);
check('конус: відскок playerX', Math.abs(r7.playerX - 0.3) < 1e-9);
const afterHit = r7.speed;
r7.update(0.016);
check('конус: без повторного удару', cone.hit === true && r7.speed > afterHit);

const r8 = makeRace(true);
let finishCount = 0;
r8.onFinish = function () { finishCount++; };
let guard = 0;
while (r8.state === 'running' && guard < 10000) { r8.update(0.05); guard++; }
check('фініш за 2 сегменти до кінця', r8.state === 'finished' && r8.playerZ >= r8.length - 2 * road.SEG_LEN);
r8.update(0.05); r8.update(0.05);
check('onFinish рівно один раз', finishCount === 1);

const r9 = makeRace(false);
r9.update(0.5);
check('суперники їдуть уперед', r9.opponents[0].z > 400 && r9.opponents[2].z > 1200);
check('x-коливання в межах ±0.15 від смуги', r9.opponents.every(function (o) { return Math.abs(o.x - o.lane) <= 0.15 + 1e-9; }));
r9.pause();
const oppZ = r9.opponents[0].z;
r9.update(0.5);
check('на паузі суперники стоять', r9.opponents[0].z === oppZ);

const r10 = makeRace(false);
r10.update(1);
r10.pause();
const z10 = r10.playerZ;
r10.update(2);
check('пауза: швидкість плавно до 0, машина стоїть', r10.state === 'paused' && r10.speed === 0 && r10.playerZ === z10);
r10.resume();
r10.update(0.1);
check('resume: знову running і розгін', r10.state === 'running' && r10.speed > 0);

const r11 = makeRace(false);
let ticks = 0;
let tickArg = null;
r11.onTick = function (rr) { ticks++; tickArg = rr; };
r11.update(0.1);
check('onTick щокадру з r', ticks === 1 && tickArg === r11);
r11.stopScene = { type: 'train', t: 0 };
r11.update(0.5);
check('stopScene.t накопичується', Math.abs(r11.stopScene.t - 0.5) < 1e-9);
r11.pause();
r11.resume();
check('resume очищає stopScene', r11.stopScene === null && r11.state === 'running');
r11.confetti();
r11.update(0.1);
check('confetti не ламає update', r11.state === 'running');
```

- [ ] **Крок 6: запустити, переконатися що нові тести падають**

```
node tests/race.test.js
```

Очікувано: кілька рядків `FAIL: …` (авто-газ, керування, конус, фініш тощо), останній рядок `FAILED: 33 checks`, exit 1.

- [ ] **Крок 7: реалізувати r.update**

У `js/race.js` замінити рядок `r.update = function (dt) {};` на:

```js
    r.update = function (dt) {
      t += dt;
      if (r.stopScene) r.stopScene.t += dt;
      if (r.state === 'running') r.speed = Math.min(race.MAX_SPEED, r.speed + ACCEL * dt);
      else r.speed = Math.max(0, r.speed - ACCEL * 3 * dt);

      const seg = road.findSegment(r.segments, r.playerZ);
      let move = 0;
      if (r.state === 'running') {
        if (pointerX !== null) {
          const step = 3.5 * dt;
          move = utils.clamp((pointerX * 2 - 1) * 1.1 - r.playerX, -step, step);
        } else {
          if (keyLeft) move -= 1.8 * dt;
          if (keyRight) move += 1.8 * dt;
        }
      }
      r.playerX += move;
      r.playerX -= dt * 0.3 * (r.speed / race.MAX_SPEED) * seg.curve;
      r.playerX = utils.clamp(r.playerX, -2, 2);
      steer += ((move > 0 ? 1 : (move < 0 ? -1 : 0)) - steer) * Math.min(1, dt * 8);
      bgShift += seg.curve * (r.speed / race.MAX_SPEED) * dt * 60;

      r.playerZ = Math.min(r.playerZ + r.speed * dt, r.length - road.SEG_LEN);

      const cur = road.findSegment(r.segments, r.playerZ);
      for (let i = 0; i < cur.sprites.length; i++) {
        const sp = cur.sprites[i];
        if (sp.key === '🚧' && !sp.hit && Math.abs(sp.offset) < 1 && Math.abs(r.playerX - sp.offset) < 0.3) {
          sp.hit = true;
          r.speed *= 0.3;
          r.playerX = utils.clamp(r.playerX + (r.playerX < sp.offset ? -0.3 : 0.3), -2, 2);
          if (audio.sfx) audio.sfx('honk');
        }
      }

      if (r.state === 'running' && r.playerZ >= r.length - 2 * road.SEG_LEN) {
        r.state = 'finished';
        if (r.onFinish) r.onFinish();
      }

      const base = 0.92 * race.MAX_SPEED;
      for (let i = 0; i < r.opponents.length; i++) {
        const o = r.opponents[i];
        if (r.state !== 'paused') {
          o.speed = race.rubberBand(r.playerZ, o.z, base);
          o.z = Math.min(o.z + o.speed * dt, r.length - road.SEG_LEN);
        }
        o.x = o.lane + 0.15 * Math.sin(t + o.phase);
      }

      const alive = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life -= dt;
        p.vy += 500 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life > 0) alive.push(p);
      }
      particles = alive;

      if (audio.engine) audio.engine(r.speed / race.MAX_SPEED);
      if (r.onTick) r.onTick(r, dt);
    };
```

- [ ] **Крок 8: запустити, переконатися що всі тести проходять**

```
node tests/race.test.js
```

Очікувано: `OK: 33 checks`, exit 0.

- [ ] **Крок 9: реалізувати r.draw — повний рендер кадру**

У `js/race.js` замінити рядок `r.draw = function () {};` на блок (хелпери лишаються всередині `race.create`, перед `return r;`):

```js
    function polygon(x1, y1, x2, y2, x3, y3, x4, y4, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();
    }

    function hillLayer(color, baseY, amp, shift, W) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= W; x += 12) {
        ctx.lineTo(x, baseY - amp * Math.abs(Math.sin((x + shift) * 0.004)));
      }
      ctx.lineTo(W, baseY);
      ctx.closePath();
      ctx.fill();
    }

    r.draw = function () {
      if (!ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      const pal = trackDef.palette;
      const horizon = H / 2;

      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, pal.skyTop);
      sky.addColorStop(1, pal.skyBottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      hillLayer(pal.hillFar, horizon + 2, H * 0.10, bgShift * 0.3, W);
      hillLayer(pal.hillNear, horizon + 2, H * 0.16, bgShift * 0.6 + 500, W);

      const cloud = sprites.emoji('☁️', 64);
      for (let i = 0; i < 4; i++) {
        const cx = (((i * 0.27 + 0.1) * W + t * 10 + bgShift * 0.1) % (W + 120)) - 60;
        sprites.drawSprite(ctx, cloud, cx, horizon * (0.3 + 0.15 * (i % 2)), W * 0.08);
      }

      if (trackDef.bgTrain) {
        const tx = W + 200 - ((t * 60) % (W + 400));
        const cars = ['🚂', '🚃', '🚃', '🚃'];
        for (let i = 0; i < cars.length; i++) {
          sprites.drawSprite(ctx, sprites.emoji(cars[i], 48), tx + i * W * 0.05, horizon - H * 0.04, W * 0.05);
        }
      }
      if (trackDef.bgBoats) {
        const boats = ['⛵', '🚤', '⛵'];
        for (let i = 0; i < boats.length; i++) {
          sprites.drawSprite(ctx, sprites.emoji(boats[i], 48), (0.2 + 0.3 * i) * W,
            horizon - H * 0.01 + Math.sin(t * 2 + i * 1.7) * 4, W * 0.05);
        }
      }

      const baseSeg = road.findSegment(r.segments, r.playerZ);
      const basePercent = (r.playerZ % road.SEG_LEN) / road.SEG_LEN;
      const playerY = utils.lerp(baseSeg.p1.world.y, baseSeg.p2.world.y, basePercent);
      const camX = r.playerX * road.ROAD_WIDTH;
      let maxY = H;
      let x = 0;
      let dx = -(baseSeg.curve * basePercent);

      for (let n = 0; n < road.DRAW_DIST; n++) {
        const seg = r.segments[(baseSeg.index + n) % r.segments.length];
        const camZ = r.playerZ - (seg.index < baseSeg.index ? r.length : 0);
        road.project(seg.p1, camX - x, playerY + road.CAM_HEIGHT, camZ, W, H);
        road.project(seg.p2, camX - x - dx, playerY + road.CAM_HEIGHT, camZ, W, H);
        x += dx;
        dx += seg.curve;
        seg.clip = maxY;
        if (seg.p1.camera.z <= road.camDepth || seg.p2.screen.y >= seg.p1.screen.y || seg.p2.screen.y >= maxY) continue;
        const p1 = seg.p1.screen;
        const p2 = seg.p2.screen;
        const light = seg.color === 0;
        ctx.fillStyle = light ? pal.groundAlt : pal.ground;
        ctx.fillRect(0, p2.y, W, p1.y - p2.y);
        polygon(p1.x - p1.w - p1.w / 6, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - p2.w / 6, p2.y, light ? pal.rumbleA : pal.rumbleB);
        polygon(p1.x + p1.w + p1.w / 6, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w + p2.w / 6, p2.y, light ? pal.rumbleA : pal.rumbleB);
        polygon(p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, light ? pal.road : pal.roadAlt);
        if (light) polygon(p1.x - p1.w / 32, p1.y, p1.x + p1.w / 32, p1.y, p2.x + p2.w / 32, p2.y, p2.x - p2.w / 32, p2.y, pal.lane);
        maxY = p2.y;
      }

      for (let n = road.DRAW_DIST - 1; n >= 1; n--) {
        const seg = r.segments[(baseSeg.index + n) % r.segments.length];
        if (seg.p1.camera.z <= road.camDepth || seg.p1.screen.y >= seg.clip) continue;
        const s = seg.p1.screen;
        for (let i = 0; i < seg.sprites.length; i++) {
          const sp = seg.sprites[i];
          sprites.drawSprite(ctx, sprites.emoji(sp.key, 64), s.x + s.w * sp.offset, s.y, s.w * 0.4 * (sp.scale || 1));
        }
        for (let k = 0; k < r.opponents.length; k++) {
          const o = r.opponents[k];
          if (Math.floor(o.z / road.SEG_LEN) % r.segments.length !== seg.index) continue;
          sprites.drawCar(ctx, s.x + s.w * o.x, s.y, s.w * 0.3, o.carDef, { driver: o.charDef, steer: 0, brake: false });
        }
      }

      sprites.drawCar(ctx, W / 2, H - H * 0.03, W * 0.16, r.carDef, {
        driver: r.playerChar, steer: steer, brake: r.state === 'paused'
      });

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = Math.min(1, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };
```

Перевірити, що файл валідний і тести не зламались:

```
node tests/race.test.js
```

Очікувано: `OK: 33 checks`, exit 0 (у тестах `getContext` повертає null, тож draw одразу виходить).

- [ ] **Крок 10: сторінка ручної перевірки tools/race-test.html**

Створити `tools/race-test.html` (гонка на трасі «Гори» без подій):

```html
<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Тест гонки</title>
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #000; touch-action: none; }
  canvas { display: block; }
  #bar { position: fixed; top: 8px; left: 8px; font-family: "Chalkboard SE","Comic Sans MS",cursive,sans-serif; }
  button { font-size: 18px; padding: 6px 12px; }
</style>
</head>
<body>
<canvas id="game"></canvas>
<div id="bar">
  <button id="pause">Пауза</button>
  <button id="resume">Далі</button>
  <button id="confetti">Конфеті</button>
</div>
<script src="../js/utils.js"></script>
<script src="../js/audio.js"></script>
<script src="../js/sprites.js"></script>
<script src="../js/road.js"></script>
<script src="../js/tracks.js"></script>
<script src="../js/race.js"></script>
<script>
(function () {
  'use strict';
  const RG = window.RG;
  const canvas = document.getElementById('game');
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  const chars = RG.sprites.CHARACTERS;
  const cars = RG.sprites.CAR_TYPES;
  const r = RG.race.create({
    canvas: canvas,
    trackDef: RG.tracks.TRACKS[0],
    playerChar: chars[0],
    carDef: cars[0],
    opponents: [
      { charDef: chars[1], carDef: cars[1] },
      { charDef: chars[2], carDef: cars[2] },
      { charDef: chars[3], carDef: cars[3] }
    ]
  });
  r.onFinish = function () { r.confetti(); };
  document.getElementById('pause').onclick = function () { r.pause(); };
  document.getElementById('resume').onclick = function () { r.resume(); };
  document.getElementById('confetti').onclick = function () { r.confetti(); };
  canvas.addEventListener('pointerdown', function (e) { r.setPointerX(e.clientX / window.innerWidth); });
  canvas.addEventListener('pointermove', function (e) { if (e.buttons) r.setPointerX(e.clientX / window.innerWidth); });
  canvas.addEventListener('pointerup', function () { r.setPointerX(null); });
  const keys = {};
  function sync() {
    r.setKeys(!!(keys.ArrowLeft || keys.a || keys.A), !!(keys.ArrowRight || keys.d || keys.D));
  }
  window.addEventListener('keydown', function (e) { keys[e.key] = true; sync(); });
  window.addEventListener('keyup', function (e) { keys[e.key] = false; sync(); });
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    r.update(dt);
    r.draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

- [ ] **Крок 11: підключити тест до tests/all.js і прогнати всі тести**

У кінець `tests/all.js` додати рядок:

```js
require('./race.test.js');
```

Запустити:

```
node tests/all.js
```

Очікувано: по рядку `OK: N checks` на кожен тест-файл; лічильник у `tests/t.js` спільний для процесу, тому числа кумулятивні — окремого рядка з числом лише цього модуля НЕ буде. Головне: жодного рядка `FAIL:`, exit code 0.

- [ ] **Крок 12: ручна перевірка рендера**

```
python3 -m http.server 8080
```

Відкрити `http://localhost:8080/tools/race-test.html` і переконатися:
- небо — градієнт, два шари пагорбів, хмарки повільно пливуть;
- дорога «тікає» вперед сама (авто-газ), смуги узбіччя миготять, центральна переривчаста лінія на світлих сегментах;
- на поворотах дорога згинається, пагорби зсуваються в протилежний бік (паралакс), машинку зносить назовні;
- дерева/декорації обабіч ростуть з наближенням; 3 суперники попереду, їх можна наздогнати й обігнати (проїжджають наскрізь, без зіткнень);
- керування мишкою (затиснута кнопка) і стрілками/A-D працює, за межі узбіччя не виїхати;
- «Пауза» плавно зупиняє, «Далі» відновлює, «Конфеті» дає залп частинок; на фініші — конфеті.

- [ ] **Крок 13: коміт**

```
git add js/race.js tests/race.test.js tests/all.js tools/race-test.html && git commit -m "feat: ігровий цикл гонки з суперниками"
```

Очікувано: `[main <hash>] feat: ігровий цикл гонки з суперниками`, 4 files changed.

---

### Task 8: events.js — ворота знань і сюжетні зупинки

Модуль `RG.events` планує події на трасі (6 «воріт знань» на ходу + 3 сюжетні зупинки: потяг, поліція, ремонт дороги), керує ними через хук `r.onTick` гонки та домальовує анімації зупинок поверх кадру гонки. Передумова: у репозиторії вже є робочі `js/utils.js`, `js/learning.js`, `js/audio.js`, `js/sprites.js`, `js/road.js`, `js/tracks.js`, `js/race.js` (Task 1–7) і тестовий хелпер `tests/t.js` (`check(name, cond)` / `done()`, успіх — рядок `OK: N checks`).

**Files:**
- Create: `js/events.js`
- Create: `tests/events.test.js`
- Create: `tools/events-test.html`
- Modify: `js/race.js` (рендер `r.stopScene` у `r.draw`; `r.onTick` щокадру навіть у паузі)
- Modify: `tests/all.js` (додати require нового тесту)
- Test: `tests/events.test.js`

**Interfaces:**

Consumes:
- `RG.utils` (js/utils.js): `clamp(v, min, max) -> number`, `easeInOut(t) -> number`, `pick(arr, rng) -> element`, `shuffle(arr, rng) -> новий масив`, `fmt(template, map) -> string` (напр. `fmt('Привіт, {name}!', {name:'Ромчик'})`); `rng` — функція типу `Math.random`.
- `RG.road` (js/road.js): `road.SEG_LEN` (= 200), `road.findSegment(segments, z) -> segment` (сегмент має масив `sprites`, куди кладуться `{key, offset, scale}`; offset у одиницях половини ширини дороги, |offset| ≤ 1 — на дорозі).
- `RG.learning` (js/learning.js): `learning.createProgress()`, `learning.makeGateTask(progress, rng) -> {kind, skill, prompt, say, options:[{text, correct}]}` (2 або 3 опції, рівно одна `correct:true`), `learning.makeStopTask(progress, context, rng)` з context ∈ `'train'|'police'|'roadwork'` → `{kind, skill, prompt, say, visual, options}` (`visual` — `{emoji, count, ...}` або `null`), `learning.applyAnswer(progress, skill, correct)`, `learning.awardStar(progress)`.
- `RG.audio` (js/audio.js): `audio.sfx(name)` (name ∈ `'ding','wrong','train','whistle',...`; у Node — no-op), `audio.speak(text)` (у Node — no-op).
- Об'єкт гонки `r` із `race.create` (js/race.js): поля `r.playerZ`, `r.playerX` (-2..2, дорога -1..1), `r.segments`, `r.length`, `r.playerChar` (charDef із полем `name`), методи `r.pause()`, `r.resume()`, `r.confetti()`, хук `r.onTick = fn(r, dt)` (викликається щокадру після руху).
- `ui` — об'єкт екранів (у грі це `RG.screens` із Task 9; у тестах — фейк): `ui.showTask(task, onAnswer(optionIndex))`, `ui.hideTask()`, `ui.updateHUD({stars})`, `ui.markWrong(index)`, `ui.markCorrect(index)`.

Produces (використовує Task 10 main.js та Task 12):
- `events.plan(trackLength, progress, rng) -> [ev]` — ЧИСТА функція; `ev = { type: 'gate'|'train'|'police'|'roadwork', z, task: null, done: false }`, масив відсортований за z.
- `events.gateChoice(laneXs, playerX) -> index` — ЧИСТА функція, індекс найближчої смуги.
- `events.createController(r, progress, ui, rng) -> ctrl` — вішається на `r.onTick`; `ctrl.events` — план подій. main.js викликає його одразу після `race.create`.
- `r.stopScene = { type, t, count }` — стан анімації зупинки; малюється в `r.draw` (доробка race.js у цій задачі).

---

- [ ] **Крок 1: Написати тест плану подій і вибору смуги (має падати)**

Створи файл `tests/events.test.js`:

```js
const { check, done } = require('./t.js');
const road = require('../js/road.js');
const learning = require('../js/learning.js');
const events = require('../js/events.js');

function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// --- events.plan ---
const L = 500 * road.SEG_LEN; // 100000 — типова довжина траси
const progress = learning.createProgress();
const plan = events.plan(L, progress, makeRng(1));

check('plan: 9 подій', plan.length === 9);
check('plan: 6 воріт', plan.filter(e => e.type === 'gate').length === 6);
check('plan: рівно один train', plan.filter(e => e.type === 'train').length === 1);
check('plan: рівно один police', plan.filter(e => e.type === 'police').length === 1);
check('plan: рівно один roadwork', plan.filter(e => e.type === 'roadwork').length === 1);
check('plan: відсортовано за z', plan.every((e, i) => i === 0 || plan[i - 1].z <= e.z));
check('plan: task=null, done=false', plan.every(e => e.task === null && e.done === false));
check('plan: всі z в межах траси', plan.every(e => e.z > 0 && e.z < L));

function minGateStopDist(evs) {
  let min = Infinity;
  const gates = evs.filter(e => e.type === 'gate');
  const stops = evs.filter(e => e.type !== 'gate');
  gates.forEach(g => stops.forEach(s => { min = Math.min(min, Math.abs(g.z - s.z)); }));
  return min;
}
check('plan: ворота не ближче 20 сегментів до зупинок',
  minGateStopDist(plan) >= 20 * road.SEG_LEN);

// Коротша траса (300 сегментів): ворота на 0.55 конфліктують із зупинкою на 0.6
// (|33000-36000| < 4000) і мають зсунутися на -20 сегментів.
const plan2 = events.plan(300 * road.SEG_LEN, progress, makeRng(2));
check('plan: зсув воріт на короткій трасі', minGateStopDist(plan2) >= 20 * road.SEG_LEN);
check('plan: після зсуву відсортовано', plan2.every((e, i) => i === 0 || plan2[i - 1].z <= e.z));

const order = seed => events.plan(L, progress, makeRng(seed))
  .filter(e => e.type !== 'gate').map(e => e.type).join(',');
const orders = new Set([order(1), order(2), order(3), order(4), order(5), order(6), order(7)]);
check('plan: порядок зупинок залежить від rng', orders.size > 1);

// --- events.gateChoice ---
check('gateChoice: ліва з двох', events.gateChoice([-0.45, 0.45], -1) === 0);
check('gateChoice: права з двох', events.gateChoice([-0.45, 0.45], 0.2) === 1);
check('gateChoice: середня з трьох', events.gateChoice([-0.55, 0, 0.55], -0.2) === 1);
check('gateChoice: права з трьох', events.gateChoice([-0.55, 0, 0.55], 0.6) === 2);
check('gateChoice: далеко зліва', events.gateChoice([-0.55, 0, 0.55], -2) === 0);
check('gateChoice: нічия — перша смуга', events.gateChoice([-0.45, 0.45], 0) === 0);

done();
```

- [ ] **Крок 2: Запустити тест — переконатися, що падає**

`node tests/events.test.js` → очікувано падає з помилкою `Error: Cannot find module '../js/events.js'`, exit code ≠ 0.

- [ ] **Крок 3: Мінімальна реалізація — plan і gateChoice**

Створи файл `js/events.js`:

```js
(function (root) {
  'use strict';
  const utils = (typeof require !== 'undefined') ? require('./utils.js') : root.utils;
  const road = (typeof require !== 'undefined') ? require('./road.js') : root.road;
  const learning = (typeof require !== 'undefined') ? require('./learning.js') : root.learning;
  const audio = (typeof require !== 'undefined') ? require('./audio.js') : root.audio;
  const events = {};

  const GATE_FRACS = [0.12, 0.25, 0.4, 0.55, 0.72, 0.88];
  const STOP_FRACS = [0.33, 0.6, 0.8];

  events.plan = function (trackLength, progress, rng) {
    rng = rng || Math.random;
    const minDist = 20 * road.SEG_LEN;
    const stopTypes = utils.shuffle(['train', 'police', 'roadwork'], rng);
    const evs = [];
    const stops = [];
    for (let i = 0; i < STOP_FRACS.length; i++) {
      const ev = { type: stopTypes[i], z: Math.round(STOP_FRACS[i] * trackLength), task: null, done: false };
      stops.push(ev);
      evs.push(ev);
    }
    for (let i = 0; i < GATE_FRACS.length; i++) {
      let z = Math.round(GATE_FRACS[i] * trackLength);
      for (let j = 0; j < stops.length; j++) {
        if (Math.abs(z - stops[j].z) < minDist) z -= minDist;
      }
      evs.push({ type: 'gate', z: z, task: null, done: false });
    }
    evs.sort(function (a, b) { return a.z - b.z; });
    return evs;
  };

  events.gateChoice = function (laneXs, playerX) {
    let best = 0;
    for (let i = 1; i < laneXs.length; i++) {
      if (Math.abs(playerX - laneXs[i]) < Math.abs(playerX - laneXs[best])) best = i;
    }
    return best;
  };

  root.events = events;
  if (typeof module !== 'undefined' && module.exports) module.exports = events;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 4: Запустити тест — переконатися, що проходить**

`node tests/events.test.js` → `OK: 18 checks`, exit code 0.

- [ ] **Крок 5: Написати тест контролера (має падати)**

У `tests/events.test.js` встав такий блок ПЕРЕД останнім рядком `done();`:

```js
// --- events.createController ---
const segments = [];
road.addRoad(segments, 100, 100, 100, 0, 0); // 300 сегментів, довжина 60000

const ui = {
  shownTask: null, hiddenN: 0, hud: null, wrongIdx: null, correctIdx: null,
  showTask(task, cb) { this.shownTask = { task, cb }; },
  hideTask() { this.hiddenN++; this.shownTask = null; },
  updateHUD(d) { this.hud = d; },
  markWrong(i) { this.wrongIdx = i; },
  markCorrect(i) { this.correctIdx = i; }
};
const r = {
  length: segments.length * road.SEG_LEN,
  playerZ: 0, playerX: 0, segments: segments,
  state: 'running', stopScene: null, onTick: null,
  pausedN: 0, resumedN: 0, confettiN: 0,
  playerChar: { name: 'Ромчик' },
  pause() { this.state = 'paused'; this.pausedN++; },
  resume() { this.state = 'running'; this.resumedN++; },
  confetti() { this.confettiN++; }
};
const prg = learning.createProgress();
const ctrl = events.createController(r, prg, ui, makeRng(5));

check('controller: повісився на onTick', typeof r.onTick === 'function');
check('controller: план створено', ctrl.events.length === 9);

// Ворота: перші на z = 0.12*60000 = 7200; вже за 40 сегментів (8000) від старту.
const gate1 = ctrl.events.filter(e => e.type === 'gate')[0];
r.onTick(r, 0.016);
check('gate: завдання згенеровано заздалегідь', gate1.task !== null);
check('gate: laneXs відповідає кількості опцій',
  gate1.laneXs.length === gate1.task.options.length);
const gseg = road.findSegment(segments, gate1.z);
check('gate: таблички додано у сегмент', gseg.sprites.length === gate1.task.options.length);

const gCorrect = gate1.task.options.findIndex(o => o.correct);
r.playerX = gate1.laneXs[gCorrect];
r.playerZ = gate1.z;
r.onTick(r, 0.016);
check('gate: правильний проїзд дає зірочку', prg.stars === 1);
check('gate: конфеті', r.confettiN === 1);
check('gate: HUD оновлено', ui.hud !== null && ui.hud.stars === 1);
check('gate: подія завершена', gate1.done === true);

// Зупинка: перша не-gate подія (z = 0.33*60000 = 19800).
const stop1 = ctrl.events.filter(e => e.type !== 'gate')[0];
r.playerZ = stop1.z;
r.onTick(r, 0.016);
check('stop: пауза', r.state === 'paused' && r.pausedN === 1);
check('stop: сцена на канвасі', r.stopScene !== null && r.stopScene.type === stop1.type);
check('stop: завдання згенеровано', stop1.task !== null);
check('stop: лічильник сцени відповідає visual',
  r.stopScene.count === (stop1.task.visual ? stop1.task.visual.count : 0));
check('stop: оверлей ще не показано', ui.shownTask === null);

for (let i = 0; i < 70; i++) { r.stopScene.t += 0.016; r.onTick(r, 0.016); } // ~1.1 с; t інкрементуємо вручну, як робить race.update
check('stop: оверлей показано після анімації', ui.shownTask !== null);

const sCorrect = stop1.task.options.findIndex(o => o.correct);
const sWrong = (sCorrect + 1) % stop1.task.options.length;
const starsBefore = prg.stars;
ui.shownTask.cb(sWrong);
check('stop: неправильна — кнопка трясеться', ui.wrongIdx === sWrong);
check('stop: неправильна — підказка пульсує', ui.correctIdx === sCorrect);
check('stop: неправильна — гонка стоїть', r.state === 'paused');
ui.shownTask.cb(sCorrect);
check('stop: правильна — зірочка', prg.stars === starsBefore + 1);
check('stop: правильна — оверлей сховано', ui.hiddenN === 1);
check('stop: правильна — гонка їде далі', r.state === 'running' && r.resumedN === 1);
check('stop: сцену прибрано', r.stopScene === null);
```

- [ ] **Крок 6: Запустити — переконатися, що падає**

`node tests/events.test.js` → очікувано падає з `TypeError: events.createController is not a function`.

- [ ] **Крок 7: Реалізувати createController**

У `js/events.js` встав такий блок ПЕРЕД рядком `root.events = events;`:

```js
  const PRAISES = ['Молодець, {name}!', 'Супер, {name}!', 'Чудово!', 'Так тримати!', 'Вау!'];
  const GENTLE = ['Ой, спробуй ще!', 'Майже!'];

  events.createController = function (r, progress, ui, rng) {
    rng = rng || Math.random;
    const ctrl = { events: events.plan(r.length, progress, rng), active: null };
    const name = (r.playerChar && r.playerChar.name) ? r.playerChar.name : 'Ромчик';

    function praise() {
      return utils.fmt(utils.pick(PRAISES, rng), { name: name });
    }

    function prepareGate(ev) {
      ev.task = learning.makeGateTask(progress, rng);
      ev.laneXs = ev.task.options.length === 2 ? [-0.45, 0.45] : [-0.55, 0, 0.55];
      const seg = road.findSegment(r.segments, ev.z);
      for (let i = 0; i < ev.task.options.length; i++) {
        seg.sprites.push({ key: String(ev.task.options[i].text), offset: ev.laneXs[i], scale: 1.5 });
      }
      audio.speak(ev.task.say);
    }

    function passGate(ev) {
      ev.done = true;
      const idx = events.gateChoice(ev.laneXs, r.playerX);
      const correct = ev.task.options[idx].correct;
      learning.applyAnswer(progress, ev.task.skill, correct);
      if (correct) {
        audio.sfx('ding');
        learning.awardStar(progress);
        ui.updateHUD({ stars: progress.stars });
        r.confetti();
        audio.speak(praise());
      } else {
        audio.sfx('wrong');
        const right = ev.task.options.filter(function (o) { return o.correct; })[0].text;
        const word = ev.task.kind === 'letter' ? 'буква' : 'цифра';
        audio.speak(utils.fmt('Це {word} {x}. Наступного разу вийде!', { word: word, x: right }));
      }
    }

    function startStop(ev) {
      ev.done = true;
      ctrl.active = ev;
      ev.task = learning.makeStopTask(progress, ev.type, rng);
      r.pause();
      r.stopScene = { type: ev.type, t: 0, count: ev.task.visual ? ev.task.visual.count : 0 };
      if (ev.type === 'train') audio.sfx('train');
    }

    function showStopTask(ev) {
      ev.taskShown = true;
      audio.speak(ev.task.say || ev.task.prompt);
      ui.showTask(ev.task, function (idx) { onStopAnswer(ev, idx); });
    }

    function onStopAnswer(ev, idx) {
      const correct = ev.task.options[idx].correct;
      learning.applyAnswer(progress, ev.task.skill, correct);
      if (correct) {
        audio.sfx('ding');
        learning.awardStar(progress);
        ui.updateHUD({ stars: progress.stars });
        ui.markCorrect(idx);
        audio.speak(praise());
        ui.hideTask();
        ctrl.active = null;
        r.stopScene = null;
        r.resume();
        if (ev.type === 'train') audio.sfx('whistle');
      } else {
        audio.sfx('wrong');
        ui.markWrong(idx);
        let ci = 0;
        for (let i = 0; i < ev.task.options.length; i++) {
          if (ev.task.options[i].correct) ci = i;
        }
        ui.markCorrect(ci);
        audio.speak(utils.pick(GENTLE, rng));
      }
    }

    r.onTick = function (rr, dt) {
      if (r.stopScene) {
        // t накопичує race.update (Task 7) — тут НЕ інкрементуємо, інакше анімація йтиме вдвічі швидше
        if (ctrl.active && !ctrl.active.taskShown && r.stopScene.t >= 1) showStopTask(ctrl.active);
        return;
      }
      const ahead = 40 * road.SEG_LEN;
      for (let i = 0; i < ctrl.events.length; i++) {
        const ev = ctrl.events[i];
        if (ev.done) continue;
        if (ev.type === 'gate') {
          if (!ev.task && r.playerZ >= ev.z - ahead && r.playerZ < ev.z) prepareGate(ev);
          else if (ev.task && r.playerZ >= ev.z) passGate(ev);
        } else if (r.playerZ >= ev.z) {
          startStop(ev);
          return;
        }
      }
    };

    return ctrl;
  };
```

- [ ] **Крок 8: Запустити тест — переконатися, що проходить**

`node tests/events.test.js` → `OK: 40 checks`, exit code 0.

- [ ] **Крок 9: Домалювати анімації зупинок у js/race.js**

Відкрий `js/race.js`. Три правки:

1. Переконайся, що `race.create` зберігає персонажа гравця на об'єкті стану: якщо в `r` нема поля `playerChar` — додай у `race.create` рядок `r.playerChar = opts.playerChar;`.
2. Переконайся, що `r.onTick` викликається щокадру НАВІТЬ у стані `'paused'` (контролер саме так рухає анімацію зупинки). Якщо виклик стоїть під умовою `state === 'running'` — перенеси його в самий кінець `r.update` без умови: `if (r.onTick) r.onTick(r, dt);`.
3. Додай на рівні модуля (поруч з іншими приватними функціями малювання) функцію нижче. Вона використовує лише `utils` (він уже підключений у race.js) і малює емодзі напряму через `fillText`:

```js
  function drawStopScene(ctx, w, h, scene) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (scene.type === 'train') {
      // Потяг 🚂 + рівно scene.count вагонів 🚃 в'їжджає і зупиняється по центру,
      // щоб вагони можна було порахувати на екрані.
      const size = Math.round(Math.min(w / (scene.count + 3), h * 0.14));
      ctx.font = size + 'px sans-serif';
      const total = (scene.count + 1) * size * 1.05;
      const p = utils.easeInOut(Math.min(scene.t / 2.5, 1));
      const cx = (w + total / 2) + (w / 2 - (w + total / 2)) * p;
      const y = h * 0.42 + Math.sin(scene.t * 6) * 2;
      for (let i = 0; i <= scene.count; i++) {
        ctx.fillText(i === 0 ? '🚂' : '🚃', cx - total / 2 + size * 1.05 * i + size / 2, y);
      }
      // Опущений шлагбаум — смугаста перекладина.
      const barY = h * 0.58;
      const stripes = 8;
      const stripeW = w * 0.7 / stripes;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#E53935' : '#FFFFFF';
        ctx.fillRect(w * 0.15 + i * stripeW, barY, stripeW, h * 0.02);
      }
    } else if (scene.type === 'police') {
      // Доброзичлива поліцейська машина з мигалками, що блимають.
      const size = Math.round(h * 0.2);
      ctx.font = size + 'px sans-serif';
      ctx.fillText('🚓', w / 2, h * 0.5);
      const on = Math.floor(scene.t * 4) % 2 === 0;
      ctx.globalAlpha = on ? 1 : 0.25;
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.arc(w / 2 - size * 0.35, h * 0.5 - size * 0.65, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = on ? 0.25 : 1;
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(w / 2 + size * 0.35, h * 0.5 - size * 0.65, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (scene.type === 'roadwork') {
      // Екскаватор 🚜 і рівно scene.count конусів 🚧, що з'являються по черзі.
      const size = Math.round(Math.min(w / (scene.count + 3), h * 0.12));
      ctx.font = Math.round(size * 1.6) + 'px sans-serif';
      ctx.fillText('🚜', w * 0.16, h * 0.45);
      ctx.font = size + 'px sans-serif';
      const startX = w * 0.3;
      const step = (w * 0.62 - startX) / Math.max(scene.count - 1, 1);
      for (let i = 0; i < scene.count; i++) {
        const appear = utils.clamp(scene.t * 3 - i * 0.4, 0, 1);
        if (appear <= 0) continue;
        ctx.globalAlpha = appear;
        ctx.fillText('🚧', startX + i * step, h * 0.45);
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
```

У самому кінці тіла `r.draw` (останнім, поверх усього намальованого) додай:

```js
    if (r.stopScene) drawStopScene(ctx, canvas.width, canvas.height, r.stopScene);
```

(`ctx` і `canvas` — локальні змінні контексту та канваса, які `r.draw` уже використовує; якщо у твоїй версії race.js вони називаються інакше — підстав фактичні імена.)

Перевір регресію: `node tests/race.test.js` → `OK: <N> checks` (та сама кількість, що була після Task 7), exit code 0.

- [ ] **Крок 10: Підключити тест до збірки всіх тестів**

У `tests/all.js` додай рядок (за зразком уже наявних require):

```js
require('./events.test.js');
```

Запусти: `node tests/all.js` → по рядку `OK: N checks` на кожен тест-файл; лічильник у `tests/t.js` спільний для процесу, тому числа кумулятивні — окремого рядка з числом лише цього модуля НЕ буде. Головне: жодного рядка `FAIL:`, exit code 0.

- [ ] **Крок 11: Ручна перевірка анімацій — tools/events-test.html**

Створи файл `tools/events-test.html`:

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Тест подій — Ромчик-Гонщик</title>
  <style>
    body { margin: 0; background: #000; font-family: "Chalkboard SE","Comic Sans MS",cursive,sans-serif; }
    canvas { display: block; margin: 0 auto; }
    #start { position: fixed; top: 40%; left: 50%; transform: translate(-50%,-50%);
             font-size: 40px; padding: 20px 40px; }
    #task { display: none; position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%);
            background: #fff; border-radius: 16px; padding: 16px; text-align: center; }
    #task button { font-size: 32px; min-width: 80px; min-height: 64px; margin: 8px; }
    #task p { font-size: 24px; margin: 4px; }
  </style>
</head>
<body>
<canvas id="c" width="900" height="560"></canvas>
<button id="start">СТАРТ ▶</button>
<div id="task"></div>
<script src="../js/utils.js"></script>
<script src="../js/learning.js"></script>
<script src="../js/audio.js"></script>
<script src="../js/sprites.js"></script>
<script src="../js/road.js"></script>
<script src="../js/tracks.js"></script>
<script src="../js/race.js"></script>
<script src="../js/events.js"></script>
<script>
  const canvas = document.getElementById('c');
  const taskDiv = document.getElementById('task');
  const ui = {
    showTask: function (task, cb) {
      taskDiv.style.display = 'block';
      let html = '<p>' + task.prompt + '</p>';
      if (task.visual) {
        html += '<p>' + task.visual.emoji.repeat(task.visual.count);
        if (task.visual.emoji2) html += ' + ' + task.visual.emoji2.repeat(task.visual.count2);
        html += '</p>';
      }
      taskDiv.innerHTML = html;
      task.options.forEach(function (o, i) {
        const b = document.createElement('button');
        b.textContent = o.text;
        b.onclick = function () { cb(i); };
        taskDiv.appendChild(b);
      });
    },
    hideTask: function () { taskDiv.style.display = 'none'; },
    updateHUD: function (d) { document.title = '⭐ ' + d.stars; },
    markWrong: function () {},
    markCorrect: function () {}
  };
  document.getElementById('start').onclick = function () {
    this.style.display = 'none';
    RG.audio.init();
    const S = RG.sprites;
    const r = RG.race.create({
      canvas: canvas,
      trackDef: RG.tracks.TRACKS[0],
      playerChar: S.CHARACTERS[0],
      carDef: S.CAR_TYPES[0],
      opponents: [
        { charDef: S.CHARACTERS[1], carDef: S.CAR_TYPES[1] },
        { charDef: S.CHARACTERS[2], carDef: S.CAR_TYPES[2] },
        { charDef: S.CHARACTERS[3], carDef: S.CAR_TYPES[3] }
      ]
    });
    RG.events.createController(r, RG.learning.createProgress(), ui, Math.random);
    let left = false, right = false;
    addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') right = true;
      r.setKeys(left, right);
    });
    addEventListener('keyup', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') right = false;
      r.setKeys(left, right);
    });
    let last = performance.now();
    function loop(now) {
      r.update(Math.min((now - last) / 1000, 0.05));
      last = now;
      r.draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };
</script>
</body>
</html>
```

Запусти з кореня проєкту: `python3 -m http.server 8080` і відкрий `http://localhost:8080/tools/events-test.html`. Натисни «СТАРТ ▶» і проїдь трасу стрілками. Чекліст очікуваного:
- перед воротами звучить озвучка завдання, на дорозі видно 2–3 таблички (букви або цифри) на смугах;
- проїзд через правильну табличку → «дзинь», конфеті, у заголовку вкладки росте ⭐; через неправильну → м'який звук + пояснення голосом, гонка НЕ зупиняється;
- на першій зупинці гонка плавно стає на паузу, на екрані анімація за типом: потяг 🚂 з вагонами (кількість = число з питання «Скільки вагонів…»), або поліцейська 🚓 з блимаючими синьо-червоними мигалками, або екскаватор 🚜 з рядком конусів 🚧;
- приблизно через секунду з'являється панель із питанням і великими кнопками; неправильна відповідь — звук + можна тиснути ще (гонка стоїть); правильна — похвала, панель зникає, гонка їде далі (для потяга — гудок);
- на трасі рівно 3 зупинки різних типів і 6 воріт; у консолі браузера нуль помилок.

- [ ] **Крок 12: Коміт**

```
git add js/events.js js/race.js tests/events.test.js tests/all.js tools/events-test.html && git commit -m "feat: ворота знань і сюжетні зупинки"
```

Очікуваний вивід: `[main <hash>] feat: ворота знань і сюжетні зупинки` із 5 зміненими файлами.

---

### Task 9: screens.js — екрани меню, вибору та фінішу

**Files:**
- Create: `js/screens.js`, `tests/screens.test.js`, `tools/screens-test.html`
- Modify: `css/style.css` (дописати стилі UI в кінець файлу), `tests/all.js` (додати require нового тесту)
- Test: `node tests/screens.test.js` (API-поверхня модуля в Node) + ручна перевірка через `tools/screens-test.html`

**Interfaces:**

*Consumes (з попередніх задач):*
- Task 1: `index.html` містить `<canvas id="game"></canvas><div id="ui"></div>`; у `css/style.css` `#ui` вже має `position:absolute; inset:0; pointer-events:none` (дочірні екрани самі вмикають `pointer-events:auto`); тестовий хелпер `tests/t.js`: `check(name, cond)`, `done()`.
- Task 3 (`RG.audio`): `audio.speak(text)`, `audio.sfx(name)` (використовуємо `'pop'`, `'click'`), `audio.isMuted() -> bool`, `audio.setMuted(bool)`, `audio.init()`.
- Task 4 (`RG.sprites`): `sprites.CHARACTERS` (4 записи `{id, name, hair, shirt, skin, bow?}`), `sprites.CAR_TYPES` (6 записів `{id, label, color, accent, shape, rainbow?}`), `sprites.drawCharacter(ctx, cx, topY, size, charDef)`, `sprites.drawCar(ctx, cx, bottomY, w, carDef, opts)`.
- Task 6 (`RG.tracks`): `tracks.TRACKS` — масив `{id, name, emoji, palette: {skyTop, ..., ground, ...}, ...}`.

*Produces (використовують Task 8 `events.js` як `ui` та Task 10 `main.js`):*
- `screens.init(callbacks)` — callbacks: `{ onPlay(), onPlayerPicked(charDef), onCarPicked(carDef), onTrackPicked(trackDef), onAgain(), onOtherTrack(), onHome(), onMuteToggle() }`.
- `screens.show(name, data)` / `screens.hide()` — name ∈ `'menu'|'player'|'car'|'track'|'finish'`; для `'finish'` data = `{ stars, sticker|null, charName }` (sticker — `{id, emoji, label}`).
- `screens.showTask(task, onAnswer(optionIndex))`, `screens.markWrong(index)` (трусить кнопку), `screens.markCorrect(index)` (пульсація), `screens.hideTask()`. task — `{prompt, say, visual|null, options:[{text, correct}]}`; `visual` = `{emoji, count, emoji2?, count2?}`.
- `screens.showHUD()`, `screens.updateHUD({stars})`, `screens.hideHUD()`.

Модуль — чистий DOM поверх `#ui`, без Canvas-рендера гонки. Кожен екран озвучується при появі (`audio.speak`), бо дитина не читає.

- [ ] **Крок 1: написати тест API, що падає**

Створи `tests/screens.test.js` — перевіряє, що модуль вантажиться в Node (тобто не чіпає `document` на верхньому рівні) і експортує всі публічні функції:

```js
const { check, done } = require('./t.js');
const screens = require('../js/screens.js');

check('init is function', typeof screens.init === 'function');
check('show is function', typeof screens.show === 'function');
check('hide is function', typeof screens.hide === 'function');
check('showTask is function', typeof screens.showTask === 'function');
check('markWrong is function', typeof screens.markWrong === 'function');
check('markCorrect is function', typeof screens.markCorrect === 'function');
check('hideTask is function', typeof screens.hideTask === 'function');
check('showHUD is function', typeof screens.showHUD === 'function');
check('updateHUD is function', typeof screens.updateHUD === 'function');
check('hideHUD is function', typeof screens.hideHUD === 'function');

done();
```

- [ ] **Крок 2: переконатися, що тест падає**

`node tests/screens.test.js` → помилка `Error: Cannot find module '../js/screens.js'`, exit code ≠ 0.

- [ ] **Крок 3: каркас js/screens.js — init/show/hide, HUD, оверлей завдань**

Створи `js/screens.js` (білдери екранів `buildMenu`/`buildPlayer`/`buildCar`/`buildTrack`/`buildFinish` додамо наступними кроками — оголошення функцій хойстяться, тому `show` уже посилається на них):

```js
(function (root) {
  'use strict';
  const screens = {};

  let ui = null;
  let cb = {};
  let current = null;
  let hud = null;
  let hudStars = null;
  let taskEl = null;
  let taskButtons = [];

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  screens.init = function (callbacks) {
    cb = callbacks || {};
    ui = document.getElementById('ui');
  };

  screens.show = function (name, data) {
    screens.hide();
    let scr = null;
    if (name === 'menu') scr = buildMenu();
    else if (name === 'player') scr = buildPlayer();
    else if (name === 'car') scr = buildCar();
    else if (name === 'track') scr = buildTrack();
    else if (name === 'finish') scr = buildFinish(data || {});
    if (!scr) return;
    current = scr;
    ui.appendChild(scr);
  };

  screens.hide = function () {
    if (current && current.parentNode) current.parentNode.removeChild(current);
    current = null;
  };

  // --- HUD ---

  screens.showHUD = function () {
    if (hud) return;
    hud = el('div', 'hud');
    hudStars = el('div', 'hud-stars', '⭐ 0');
    const mute = el('button', 'btn btn-corner btn-mute', root.audio.isMuted() ? '🔇' : '🔊');
    mute.addEventListener('click', function () {
      if (cb.onMuteToggle) cb.onMuteToggle();
      mute.textContent = root.audio.isMuted() ? '🔇' : '🔊';
    });
    const home = el('button', 'btn btn-corner btn-home', '🏠');
    home.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onHome) cb.onHome();
    });
    hud.appendChild(hudStars);
    hud.appendChild(mute);
    hud.appendChild(home);
    ui.appendChild(hud);
  };

  screens.updateHUD = function (data) {
    if (hudStars && data && typeof data.stars === 'number') {
      hudStars.textContent = '⭐ ' + data.stars;
    }
  };

  screens.hideHUD = function () {
    if (hud && hud.parentNode) hud.parentNode.removeChild(hud);
    hud = null;
    hudStars = null;
  };

  // --- Оверлей завдань (сюжетні зупинки) ---

  function emojiRow(emoji, count) {
    const row = el('span', 'task-emoji-row');
    for (let i = 0; i < count; i++) row.appendChild(el('span', 'task-emoji', emoji));
    return row;
  }

  function buildVisual(v) {
    const wrap = el('div', 'task-visual');
    wrap.appendChild(emojiRow(v.emoji, v.count));
    if (v.emoji2) {
      wrap.appendChild(el('span', 'task-plus', '+'));
      wrap.appendChild(emojiRow(v.emoji2, v.count2));
    }
    return wrap;
  }

  screens.showTask = function (task, onAnswer) {
    screens.hideTask();
    taskEl = el('div', 'task');
    const box = el('div', 'task-box');
    box.appendChild(el('div', 'task-prompt', task.prompt));
    if (task.visual) box.appendChild(buildVisual(task.visual));
    const row = el('div', 'task-options');
    taskButtons = [];
    task.options.forEach(function (opt, i) {
      const b = el('button', 'btn task-option', String(opt.text));
      b.addEventListener('click', function () { onAnswer(i); });
      taskButtons.push(b);
      row.appendChild(b);
    });
    box.appendChild(row);
    taskEl.appendChild(box);
    ui.appendChild(taskEl);
    if (task.say) root.audio.speak(task.say);
  };

  screens.markWrong = function (index) {
    const b = taskButtons[index];
    if (!b) return;
    b.classList.remove('shake');
    void b.offsetWidth;
    b.classList.add('shake');
  };

  screens.markCorrect = function (index) {
    const b = taskButtons[index];
    if (b) b.classList.add('pulse');
  };

  screens.hideTask = function () {
    if (taskEl && taskEl.parentNode) taskEl.parentNode.removeChild(taskEl);
    taskEl = null;
    taskButtons = [];
  };

  // --- Білдери екранів (кроки 5–7) ---

  root.screens = screens;
  if (typeof module !== 'undefined' && module.exports) module.exports = screens;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
```

- [ ] **Крок 4: переконатися, що тест проходить**

`node tests/screens.test.js` → `OK: 10 checks`, exit code 0.

- [ ] **Крок 5: екран меню + спільний білдер карток**

Додай у `js/screens.js` перед рядком `root.screens = screens;` (на місці коментаря «Білдери екранів»):

```js
  function buildMenu() {
    const s = el('div', 'screen');
    s.appendChild(el('h1', 'title', 'Ромчик-Гонщик 🏎️'));
    const play = el('button', 'btn btn-big', 'ГРАТИ ▶');
    play.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onPlay) cb.onPlay();
    });
    s.appendChild(play);
    const mute = el('button', 'btn btn-small', root.audio.isMuted() ? '🔇' : '🔊');
    mute.addEventListener('click', function () {
      if (cb.onMuteToggle) cb.onMuteToggle();
      mute.textContent = root.audio.isMuted() ? '🔇' : '🔊';
    });
    s.appendChild(mute);
    root.audio.speak('Ромчик-Гонщик! Натисни грати!');
    return s;
  }

  function buildCardScreen(titleText, items, renderCard, speakFor, onDone) {
    const s = el('div', 'screen');
    s.appendChild(el('h2', 'title', titleText));
    const grid = el('div', 'cards');
    const next = el('button', 'btn btn-next hidden', 'Далі ▶');
    let picked = null;
    items.forEach(function (item) {
      const card = el('button', 'card');
      renderCard(card, item);
      card.addEventListener('click', function () {
        picked = item;
        const all = grid.querySelectorAll('.card');
        for (let i = 0; i < all.length; i++) all[i].classList.remove('selected');
        card.classList.add('selected');
        root.audio.sfx('pop');
        root.audio.speak(speakFor(item));
        next.classList.remove('hidden');
      });
      grid.appendChild(card);
    });
    next.addEventListener('click', function () {
      root.audio.sfx('click');
      if (picked) onDone(picked);
    });
    s.appendChild(grid);
    s.appendChild(next);
    root.audio.speak(titleText);
    return s;
  }
```

- [ ] **Крок 6: екрани вибору персонажа, машини і траси**

Додай одразу після `buildCardScreen`:

```js
  function buildPlayer() {
    return buildCardScreen('Хто сьогодні гонщик?', root.sprites.CHARACTERS,
      function (card, ch) {
        const cv = document.createElement('canvas');
        cv.width = 120; cv.height = 130;
        root.sprites.drawCharacter(cv.getContext('2d'), 60, 8, 96, ch);
        card.appendChild(cv);
        card.appendChild(el('div', 'card-label', ch.name));
      },
      function (ch) { return ch.name; },
      function (ch) { if (cb.onPlayerPicked) cb.onPlayerPicked(ch); });
  }

  function buildCar() {
    return buildCardScreen('Обери машинку!', root.sprites.CAR_TYPES,
      function (card, car) {
        const cv = document.createElement('canvas');
        cv.width = 120; cv.height = 110;
        root.sprites.drawCar(cv.getContext('2d'), 60, 100, 84, car, {});
        card.appendChild(cv);
        card.appendChild(el('div', 'card-label', car.label));
      },
      function (car) { return car.label; },
      function (car) { if (cb.onCarPicked) cb.onCarPicked(car); });
  }

  function buildTrack() {
    return buildCardScreen('Куди поїдемо?', root.tracks.TRACKS,
      function (card, tr) {
        card.classList.add('card-track');
        card.style.background = 'linear-gradient(' + tr.palette.skyTop + ',' + tr.palette.ground + ')';
        card.appendChild(el('div', 'card-emoji', tr.emoji));
        card.appendChild(el('div', 'card-label', tr.name));
      },
      function (tr) { return tr.name; },
      function (tr) { if (cb.onTrackPicked) cb.onTrackPicked(tr); });
  }
```

- [ ] **Крок 7: екран фінішу з конфеті та наліпкою**

Додай після `buildTrack`:

```js
  function buildFinish(data) {
    const s = el('div', 'screen screen-finish');
    const conf = el('div', 'confetti');
    const colors = ['#E53935', '#FDD835', '#43A047', '#1E88E5', '#8E24AA', '#FF9800'];
    for (let i = 0; i < 40; i++) {
      const p = el('div', 'confetti-piece');
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 2) + 's';
      p.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      conf.appendChild(p);
    }
    s.appendChild(conf);
    s.appendChild(el('div', 'trophy', '🏆'));
    s.appendChild(el('h2', 'title', 'Перемога!'));
    s.appendChild(el('div', 'finish-stars', '⭐ ' + (data.stars || 0)));
    let sayText = 'Перемога, ' + (data.charName || '') + '! У тебе ' + (data.stars || 0) + ' зірочок!';
    if (data.sticker) {
      const st = el('div', 'sticker');
      st.appendChild(el('div', 'sticker-emoji', data.sticker.emoji));
      st.appendChild(el('div', 'sticker-label', 'Нова наліпка!'));
      st.appendChild(el('div', 'sticker-name', data.sticker.label));
      s.appendChild(st);
      sayText += ' Нова наліпка: ' + data.sticker.label + '!';
    }
    const row = el('div', 'btn-row');
    const again = el('button', 'btn', 'Ще раз!');
    again.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onAgain) cb.onAgain();
    });
    const other = el('button', 'btn', 'Інша траса');
    other.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onOtherTrack) cb.onOtherTrack();
    });
    row.appendChild(again);
    row.appendChild(other);
    s.appendChild(row);
    root.audio.speak(sayText);
    return s;
  }
```

- [ ] **Крок 8: стилі UI у css/style.css**

Допиши в КІНЕЦЬ `css/style.css` (нічого наявного не змінюй). Великі кнопки (завдання: min-height 64px, шрифт 32px+), жоден текст не дрібніший за 20px; HUD прозорий для дотиків (кермування пальцем іде в канвас), клікабельні лише його кнопки:

```css
/* === UI-екрани (Task 9) === */
#ui { font-family: 'Chalkboard SE', 'Comic Sans MS', cursive, sans-serif; }
#ui .screen {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 20px; padding: 16px;
  box-sizing: border-box; text-align: center; overflow: hidden;
  pointer-events: auto; background: linear-gradient(#4FC3F7, #B3E5FC);
  animation: screen-in 0.35s ease-out;
}
#ui .title { margin: 0; color: #fff; font-size: clamp(28px, 6vw, 56px); text-shadow: 0 3px 0 rgba(0, 0, 0, 0.2); }
#ui .btn {
  min-height: 64px; padding: 12px 32px; font-size: 32px; font-family: inherit;
  color: #fff; background: #43A047; border: none; border-radius: 20px;
  box-shadow: 0 6px 0 #2E7D32; cursor: pointer; pointer-events: auto;
}
#ui .btn:active { transform: translateY(4px); box-shadow: 0 2px 0 #2E7D32; }
#ui .btn-big { font-size: 44px; padding: 20px 48px; background: #E53935; box-shadow: 0 6px 0 #B71C1C; }
#ui .btn-big:active { box-shadow: 0 2px 0 #B71C1C; }
#ui .btn-small { min-height: 56px; font-size: 28px; padding: 8px 20px; background: #1E88E5; box-shadow: 0 5px 0 #1565C0; }
#ui .btn-small:active { box-shadow: 0 2px 0 #1565C0; }
#ui .hidden { display: none; }
#ui .btn-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
#ui .cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; max-width: 92vw; }
#ui .card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 10px; min-width: 130px; min-height: 64px; background: #fff;
  border: 4px solid transparent; border-radius: 20px; font-family: inherit;
  cursor: pointer; pointer-events: auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
#ui .card.selected { border-color: #FDD835; transform: scale(1.06); }
#ui .card-label { font-size: 20px; color: #37474F; }
#ui .card-emoji { font-size: 64px; line-height: 1; }
#ui .card-track .card-label { color: #fff; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); }
/* HUD */
#ui .hud { position: absolute; inset: 0; pointer-events: none; }
#ui .hud-stars {
  position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
  font-size: 28px; color: #fff; text-shadow: 0 2px 0 rgba(0, 0, 0, 0.3);
}
#ui .btn-corner {
  position: absolute; min-height: 56px; width: 56px; height: 56px; padding: 0;
  font-size: 26px; border-radius: 50%; background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.2);
}
#ui .btn-corner:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2); }
#ui .hud .btn-mute { top: 10px; left: 10px; }
#ui .hud .btn-home { top: 10px; right: 10px; }
/* Оверлей завдань */
#ui .task {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  pointer-events: auto; background: rgba(0, 0, 0, 0.35); animation: screen-in 0.25s ease-out;
}
#ui .task-box {
  display: flex; flex-direction: column; gap: 16px; align-items: center;
  background: #FFF8E1; border-radius: 24px; padding: 24px; max-width: 92vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
#ui .task-prompt { font-size: 34px; color: #37474F; }
#ui .task-visual { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
#ui .task-emoji { font-size: 40px; }
#ui .task-plus { font-size: 40px; color: #37474F; margin: 0 8px; }
#ui .task-options { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
#ui .task-option { min-width: 96px; background: #1E88E5; box-shadow: 0 6px 0 #1565C0; }
#ui .task-option:active { box-shadow: 0 2px 0 #1565C0; }
/* Фініш */
#ui .screen-finish { background: linear-gradient(#7E57C2, #4FC3F7); }
#ui .trophy { font-size: 110px; line-height: 1; animation: trophy-pop 0.6s ease-out; }
#ui .finish-stars { font-size: 40px; color: #fff; text-shadow: 0 2px 0 rgba(0, 0, 0, 0.3); }
#ui .sticker {
  background: #fff; border-radius: 20px; padding: 12px 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); animation: screen-in 0.5s ease-out;
}
#ui .sticker-emoji { font-size: 64px; }
#ui .sticker-label { font-size: 22px; color: #E53935; font-weight: bold; }
#ui .sticker-name { font-size: 20px; color: #37474F; }
#ui .confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
#ui .confetti-piece { position: absolute; top: -16px; width: 12px; height: 12px; border-radius: 3px; animation: confetti-fall linear infinite; }
/* Анімації */
@keyframes screen-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-10px); } 40%, 80% { transform: translateX(10px); } }
#ui .shake { animation: shake 0.4s ease-in-out; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
#ui .pulse { animation: pulse 0.8s ease-in-out infinite; background: #43A047; box-shadow: 0 6px 0 #2E7D32; }
@keyframes trophy-pop { from { transform: scale(0); } 60% { transform: scale(1.2); } to { transform: scale(1); } }
@keyframes confetti-fall { to { transform: translateY(110vh) rotate(720deg); } }
```

- [ ] **Крок 9: сторінка ручної перевірки tools/screens-test.html**

Створи `tools/screens-test.html` (панель унизу перемикає екрани; колбеки логуються в консоль):

```html
<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Тест екранів — Ромчик-Гонщик</title>
<link rel="stylesheet" href="../css/style.css">
<style>
  #bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 10; display: flex;
         flex-wrap: wrap; gap: 4px; padding: 6px; background: #263238; }
  #bar button { font-size: 14px; padding: 6px 10px; }
</style>
</head>
<body>
<canvas id="game"></canvas>
<div id="ui"></div>
<div id="bar">
  <button onclick="RG.screens.show('menu')">menu</button>
  <button onclick="RG.screens.show('player')">player</button>
  <button onclick="RG.screens.show('car')">car</button>
  <button onclick="RG.screens.show('track')">track</button>
  <button onclick="showFinish()">finish</button>
  <button onclick="RG.screens.hide()">hide</button>
  <button onclick="hudOn()">HUD on</button>
  <button onclick="RG.screens.updateHUD({stars: ++stars})">+star</button>
  <button onclick="RG.screens.hideHUD()">HUD off</button>
  <button onclick="showCount()">task: count</button>
  <button onclick="showMath()">task: math</button>
  <button onclick="RG.screens.hideTask()">hideTask</button>
</div>
<script src="../js/utils.js"></script>
<script src="../js/audio.js"></script>
<script src="../js/sprites.js"></script>
<script src="../js/road.js"></script>
<script src="../js/tracks.js"></script>
<script src="../js/screens.js"></script>
<script>
  let stars = 0;
  function log(msg) { console.log('[screens-test] ' + msg); }
  document.body.addEventListener('pointerdown', function () { RG.audio.init(); }, { once: true });
  RG.screens.init({
    onPlay: function () { log('onPlay'); },
    onPlayerPicked: function (ch) { log('onPlayerPicked: ' + ch.name); },
    onCarPicked: function (car) { log('onCarPicked: ' + car.label); },
    onTrackPicked: function (tr) { log('onTrackPicked: ' + tr.name); },
    onAgain: function () { log('onAgain'); },
    onOtherTrack: function () { log('onOtherTrack'); },
    onHome: function () { log('onHome'); },
    onMuteToggle: function () { RG.audio.setMuted(!RG.audio.isMuted()); log('onMuteToggle'); }
  });
  function hudOn() { RG.screens.showHUD(); RG.screens.updateHUD({ stars: stars }); }
  function showFinish() {
    RG.screens.show('finish', {
      stars: 7,
      sticker: { id: 'demo', emoji: '🏎️', label: 'Гоночна машинка' },
      charName: 'Ромчик'
    });
  }
  function showCount() {
    RG.screens.showTask({
      kind: 'count', skill: 'numbers',
      prompt: 'Скільки вагонів у потяга?', say: 'Скільки вагонів у потяга?',
      visual: { emoji: '🚃', count: 4 },
      options: [{ text: 3, correct: false }, { text: 4, correct: true }, { text: 5, correct: false }]
    }, function (i) {
      log('answer: ' + i);
      if (i === 1) { RG.screens.markCorrect(1); }
      else { RG.screens.markWrong(i); RG.screens.markCorrect(1); }
    });
  }
  function showMath() {
    RG.screens.showTask({
      kind: 'math', skill: 'math',
      prompt: '2 + 1 = ?', say: 'Скільки буде 2 плюс 1?',
      visual: { emoji: '🚗', count: 2, emoji2: '🚙', count2: 1 },
      options: [{ text: 2, correct: false }, { text: 3, correct: true }, { text: 4, correct: false }]
    }, function (i) { log('answer: ' + i); });
  }
</script>
</body>
</html>
```

- [ ] **Крок 10: ручна перевірка в браузері**

Запусти з кореня проєкту: `python3 -m http.server 8080`, відкрий `http://localhost:8080/tools/screens-test.html`. Чекліст:
- **menu**: градієнтне тло, великий заголовок «Ромчик-Гонщик 🏎️», червона «ГРАТИ ▶» (клік → у консолі `[screens-test] onPlay`), кнопка звуку перемикає 🔊/🔇.
- **player**: 4 картки з намальованими портретами та іменами; тап — жовта рамка, звук 'pop', озвучка імені, з'являється «Далі ▶»; «Далі ▶» → `onPlayerPicked: Ромчик`.
- **car**: 6 карток машинок (вид ззаду), райдужний болід із градієнтом; тап озвучує колір.
- **track**: 3 картки 🏔️🌊🏙️ із градієнтами палітр і назвами.
- **finish**: конфеті падає (CSS-анімація), кубок 🏆 «вистрибує», «⭐ 7», наліпка з «Нова наліпка!», кнопки «Ще раз!» / «Інша траса» → `onAgain` / `onOtherTrack`.
- **HUD on**: «⭐ 0» вгорі по центру, 🔊 у лівому куті, 🏠 у правому; `+star` збільшує лічильник; 🏠 → `onHome`.
- **task: count**: 4 вагончики 🚃 у рядок (можна рахувати пальчиком), 3 великі кнопки; клік «3» → кнопка трясеться, «4» пульсує зеленим; клік «4» → пульсація.
- **task: math**: 🚗🚗 «+» 🚙 двома групами.
- Озвучка українською при появі кожного екрана (якщо на пристрої є uk-голос; без нього — тиша, без помилок у консолі).
- У консолі нуль помилок.

- [ ] **Крок 11: додати тест до tests/all.js і прогнати всі тести**

Додай у кінець `tests/all.js` рядок:

```js
require('./screens.test.js');
```

Запусти `node tests/all.js` → усі підсумкові рядки виду `OK: … checks`, жодного `FAIL`, exit code 0.

- [ ] **Крок 12: коміт**

```
git add js/screens.js css/style.css tests/screens.test.js tests/all.js tools/screens-test.html && git commit -m "feat: екрани меню, вибору та фінішу"
```

Очікувано: `[main <hash>] feat: екрани меню, вибору та фінішу`, 5 files changed; `git status` — робоче дерево чисте.

---

### Task 10: main.js — зшивання гри, збереження прогресу

Мета: замінити заглушку `js/main.js` головним файлом гри — машина станів екранів, повноекранний канвас із rAF-циклом, склейка race + events + screens + audio, збереження прогресу і звуку в localStorage, підтримка `?test=1`, реєстрація service worker, обробка вводу (палець + клавіатура). Також підключити всі скрипти в `index.html` у правильному порядку. Передумова: задачі 1–9 виконані, файли `js/utils.js … js/screens.js` існують, `node tests/all.js` зелений.

**Files:**
- Modify: `index.html` — підключити всі 10 скриптів у строгому порядку.
- Modify: `js/main.js` — повністю замінити заглушку з Task 1.

**Interfaces:**

Consumes (точні сигнатури з попередніх задач):
- `RG.utils`: `clamp(v, min, max) -> number`.
- `RG.learning`: `deserialize(str|null) -> Progress` (безпечний до сміття/null), `serialize(progress) -> string`, `awardSticker(progress) -> sticker|null`; поле `progress.stars`.
- `RG.audio`: `init()` (лінива, безпечна до повторів, викликати з першого жесту), `setMuted(bool)`, `isMuted() -> bool`, `sfx(name)`, `speak(text)`, `startEngine()`, `engine(speedRatio /*0..1*/)`, `stopEngine()`. Сховище muted — обов'язок main.js (ключ `'rg_muted'`).
- `RG.sprites`: масиви `CHARACTERS` (4 записи, поля `id`, `name`) і `CAR_TYPES` (6 записів, поле `id`).
- `RG.race`: `race.create({ canvas, trackDef, playerChar, carDef, opponents: [{charDef, carDef}] (3 шт), shortTrack: bool }) -> r`; `race.MAX_SPEED`; у `r`: `update(dt)`, `draw()`, `setPointerX(xNorm|null)`, `setKeys(left, right)`, `confetti()`, поля `state ('running'|'paused'|'finished')`, `speed`; хук `r.onFinish = fn` (призначає main.js).
- `RG.events`: `events.createController(r, progress, ui, rng) -> ctrl` — сам вішається на `r.onTick`; `ui` має надавати `showTask(task, onAnswer)`, `markWrong(index)`, `markCorrect(index)`, `hideTask()`, `updateHUD({stars})`.
- `RG.screens`: `init(callbacks)` з callbacks `{ onPlay(), onPlayerPicked(charDef), onCarPicked(carDef), onTrackPicked(trackDef), onAgain(), onOtherTrack(), onHome(), onMuteToggle() }`; `show(name, data)` (name ∈ `'menu','player','car','track','finish'`; finish data `{ stars, sticker|null, charName }`), `hide()`, `showHUD()`, `hideHUD()`, `updateHUD({stars})`, `showTask(task, onAnswer(optionIndex))`, `markWrong(index)`, `markCorrect(index)`, `hideTask()`.
- DOM з Task 1: `<canvas id="game">` і `<div id="ui">`.

Produces (для наступних задач):
- Глобальний неймспейс `RG.main` (порожній — main.js нічого не експортує для інших модулів, він верхівка склейки).
- Ключі localStorage: `'rg_progress'` (рядок `learning.serialize`) і `'rg_muted'` (`'1'`/`'0'`) — Task 12 перевіряє їх збереження після перезавантаження.
- URL-параметр `?test=1` → `shortTrack: true` — коротка траса для наскрізних тестів Task 12.
- Реєстрація `sw.js` лише на http/https — Task 11 створить сам файл `sw.js`; до того реєстрація тихо падає в `catch`.
- Фінальний блок `<script src>` в `index.html` — Task 11 додасть до `index.html` лише manifest/іконки, порядок скриптів більше не змінюється.

Кроки:

- [ ] **Крок 1: Підключити всі скрипти в index.html у строгому порядку**

  В `index.html` знайди наявні теги `<script src="js/utils.js"></script>` і `<script src="js/main.js"></script>` (заглушка з Task 1) і заміни їх ЄДИНИМ блоком безпосередньо перед `</body>`. Порядок строгий — модулі залежать від попередніх:

  ```html
  <script src="js/utils.js"></script>
  <script src="js/learning.js"></script>
  <script src="js/audio.js"></script>
  <script src="js/sprites.js"></script>
  <script src="js/road.js"></script>
  <script src="js/tracks.js"></script>
  <script src="js/race.js"></script>
  <script src="js/events.js"></script>
  <script src="js/screens.js"></script>
  <script src="js/main.js"></script>
  ```

  Перевірка:
  ```
  grep -c '<script src="js/' index.html
  ```
  Очікуваний вивід: `10`. І порядок:
  ```
  grep '<script src="js/' index.html
  ```
  Очікуваний вивід — рівно 10 рядків у порядку: utils, learning, audio, sprites, road, tracks, race, events, screens, main.

- [ ] **Крок 2: Замінити заглушку js/main.js каркасом — канвас, збереження, цикл**

  Повністю заміни вміст `js/main.js` на:

  ```js
  (function (root) {
    'use strict';
    const main = {};

    const utils = root.utils;
    const learning = root.learning;
    const audio = root.audio;
    const sprites = root.sprites;
    const race = root.race;
    const events = root.events;
    const screens = root.screens;

    const PROGRESS_KEY = 'rg_progress';
    const MUTED_KEY = 'rg_muted';

    let canvas = null;
    let progress = null;
    const chosen = { charDef: null, carDef: null, trackDef: null };
    let r = null;
    let pointerDown = false;
    const keys = { left: false, right: false };
    let lastTime = 0;

    function storageGet(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function storageSet(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* приватний режим — граємо без збереження */ }
    }

    function saveProgress() {
      storageSet(PROGRESS_KEY, learning.serialize(progress));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    function drawBackdrop() {
      const ctx = canvas.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, '#4FC3F7');
      g.addColorStop(1, '#B3E5FC');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function frame(ts) {
      const dt = utils.clamp((ts - lastTime) / 1000, 0, 0.05);
      lastTime = ts;
      if (r) {
        r.update(dt);
        r.draw();
        audio.engine(r.speed / race.MAX_SPEED);
      } else {
        drawBackdrop();
      }
      requestAnimationFrame(frame);
    }

    function boot() {
      canvas = document.getElementById('game');
      resize();
      window.addEventListener('resize', resize);
      progress = learning.deserialize(storageGet(PROGRESS_KEY));
      audio.setMuted(storageGet(MUTED_KEY) === '1');
      requestAnimationFrame(frame);
    }

    if (typeof document !== 'undefined') boot();

    root.main = main;
    if (typeof module !== 'undefined' && module.exports) module.exports = main;
  })(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
  ```

  Функції `boot` поки бракує екранів та інпуту — доповнимо в кроках 4–5 (фінальна версія `boot` — у кроці 5).

- [ ] **Крок 3: Перевірити, що каркас вантажиться в Node і в браузері**

  ```
  node -e "require('./js/main.js'); console.log('main OK')"
  ```
  Очікуваний вивід: `main OK` (у Node `document` відсутній, `boot()` не викликається — файл лише експортується).

  ```
  node tests/all.js
  ```
  Очікуваний вивід: останній рядок `OK: <N> checks`, exit code 0 (регресії немає).

  Запусти сервер з кореня проєкту і відкрий сторінку:
  ```
  python3 -m http.server 8080
  ```
  Відкрий `http://localhost:8080` — блакитний градієнт на весь екран, у консолі DevTools нуль помилок.

- [ ] **Крок 4: Додати гонку — ui-обгортка зі збереженням, startRace/stopRace/фініш**

  У `js/main.js` встав такий блок ПІСЛЯ функції `drawBackdrop` і ПЕРЕД функцією `frame` (повний код):

  ```js
    const ui = {
      showTask: function (task, onAnswer) {
        screens.showTask(task, function (index) {
          onAnswer(index);
          saveProgress();
        });
      },
      markWrong: function (index) { screens.markWrong(index); },
      markCorrect: function (index) { screens.markCorrect(index); },
      hideTask: function () { screens.hideTask(); },
      updateHUD: function (data) {
        screens.updateHUD(data);
        saveProgress();
      }
    };

    function isTestMode() {
      return /[?&]test=1/.test(location.search);
    }

    function pickOpponents() {
      const opponents = [];
      const otherChars = sprites.CHARACTERS.filter(function (c) {
        return c.id !== chosen.charDef.id;
      });
      const otherCars = sprites.CAR_TYPES.filter(function (c) {
        return c.id !== chosen.carDef.id;
      });
      for (let i = 0; i < 3; i++) {
        opponents.push({ charDef: otherChars[i], carDef: otherCars[i % otherCars.length] });
      }
      return opponents;
    }

    function startRace() {
      screens.hide();
      r = race.create({
        canvas: canvas,
        trackDef: chosen.trackDef,
        playerChar: chosen.charDef,
        carDef: chosen.carDef,
        opponents: pickOpponents(),
        shortTrack: isTestMode()
      });
      events.createController(r, progress, ui, Math.random);
      r.onFinish = onRaceFinish;
      screens.showHUD();
      screens.updateHUD({ stars: progress.stars });
      audio.startEngine();
    }

    function stopRace() {
      audio.stopEngine();
      screens.hideTask();
      screens.hideHUD();
      r = null;
    }

    function onRaceFinish() {
      audio.stopEngine();
      audio.sfx('win');
      audio.speak('Фініш! Перемога!');
      r.confetti();
      setTimeout(function () {
        const sticker = learning.awardSticker(progress);
        saveProgress();
        screens.hideHUD();
        screens.show('finish', {
          stars: progress.stars,
          sticker: sticker,
          charName: chosen.charDef.name
        });
      }, 2000);
    }
  ```

  Пояснення збереження: контролер подій (Task 8) мутує `progress` сам, а main зберігає — після кожної відповіді на зупинці (обгортка `onAnswer` в `ui.showTask`), після кожної зірочки за ворота (обгортка `ui.updateHUD`) і на фініші (в `onRaceFinish`). `?test=1` вмикає `shortTrack: true` — коротка траса для наскрізних тестів. Фініш: 2 секунди святкування (конфеті + `sfx('win')` + озвучка), потім наліпка і фініш-екран.

- [ ] **Крок 5: Додати машину станів екранів, інпут, реєстрацію SW і фінальний boot**

  У `js/main.js` встав такий блок після `onRaceFinish` і перед `frame` (повний код):

  ```js
    function initScreens() {
      screens.init({
        onPlay: function () {
          audio.init();
          screens.show('player');
        },
        onPlayerPicked: function (charDef) {
          chosen.charDef = charDef;
          screens.show('car');
        },
        onCarPicked: function (carDef) {
          chosen.carDef = carDef;
          screens.show('track');
        },
        onTrackPicked: function (trackDef) {
          chosen.trackDef = trackDef;
          startRace();
        },
        onAgain: function () {
          startRace();
        },
        onOtherTrack: function () {
          stopRace();
          screens.show('track');
        },
        onHome: function () {
          stopRace();
          screens.show('menu');
        },
        onMuteToggle: function () {
          const muted = !audio.isMuted();
          audio.setMuted(muted);
          storageSet(MUTED_KEY, muted ? '1' : '0');
        }
      });
    }

    function pointerRatio(e) {
      return utils.clamp(e.clientX / window.innerWidth, 0, 1);
    }

    function initInput() {
      canvas.addEventListener('pointerdown', function (e) {
        pointerDown = true;
        if (r) r.setPointerX(pointerRatio(e));
      });
      window.addEventListener('pointermove', function (e) {
        if (pointerDown && r) r.setPointerX(pointerRatio(e));
      });
      window.addEventListener('pointerup', function () {
        pointerDown = false;
        if (r) r.setPointerX(null);
      });
      canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
      }, { passive: false });
      window.addEventListener('keydown', function (e) { setKey(e, true); });
      window.addEventListener('keyup', function (e) { setKey(e, false); });
    }

    function setKey(e, down) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = down;
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = down;
      else return;
      if (r) r.setKeys(keys.left, keys.right);
    }

    function registerServiceWorker() {
      if (!location.protocol.startsWith('http')) return;
      if (!('serviceWorker' in navigator)) return;
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {
          /* sw.js з'явиться в наступній задачі — помилка реєстрації не критична */
        });
      });
    }
  ```

  Потім ЗАМІНИ наявну функцію `boot` на фінальну версію:

  ```js
    function boot() {
      canvas = document.getElementById('game');
      resize();
      window.addEventListener('resize', resize);
      progress = learning.deserialize(storageGet(PROGRESS_KEY));
      audio.setMuted(storageGet(MUTED_KEY) === '1');
      initScreens();
      initInput();
      screens.show('menu');
      registerServiceWorker();
      requestAnimationFrame(frame);
    }
  ```

  Ключові моменти: `audio.init()` викликається саме з `onPlay` — це перший жест користувача (автоплей-політика); `e.preventDefault()` на `touchstart` канваса блокує скрол/зум; `pointermove` слухається на `window`, щоб палець не «губився» при виїзді за канвас; клавіші — `e.code` (`ArrowLeft`/`ArrowRight`/`KeyA`/`KeyD`), незалежно від розкладки.

  Швидка перевірка синтаксису:
  ```
  node -e "require('./js/main.js'); console.log('main OK')"
  ```
  Очікуваний вивід: `main OK`.

- [ ] **Крок 6: Ручна наскрізна перевірка повного циклу гри**

  Сервер уже працює (`python3 -m http.server 8080` з кореня). Відкрий `http://localhost:8080` і пройди чекліст (DevTools відкриті, консоль на виду):

  1. Меню: назва і кнопка «ГРАТИ ▶» видно; нуль помилок у консолі.
  2. «ГРАТИ» → екран персонажів; тап по картці озвучує ім'я; «Далі ▶» → машини → траси.
  3. Вибери трасу → гонка стартує: дорога їде, мотор звучить, суперники попереду, HUD із зірочками і кнопками 🔇/🏠 у кутах.
  4. Керування: стрілки ← → і A/D зсувають машинку; затиснута мишка (як палець) тягне машинку до курсора; відпускання — повернення до клавіш.
  5. Ворота знань: озвучене питання, проїзд через правильну табличку → «дзинь», конфеті, +1 зірочка в HUD.
  6. Сюжетна зупинка (потяг/поліція/ремонт): машина плавно зупиняється, анімація, великі кнопки відповіді; неправильна — трясеться і лагідна фраза, правильна — «дзинь» і гонка їде далі.
  7. Фініш: конфеті + джингл + «Фініш! Перемога!», через ~2 с — фініш-екран із кубком, зірочками, наліпкою і кнопками «Ще раз!» / «Інша траса».
  8. «Ще раз!» → нова гонка на тій самій трасі; кнопка 🏠 у HUD → меню (мотор замовкає).
  9. Збереження: у консолі DevTools виконай `localStorage.getItem('rg_progress')` — очікуваний результат: JSON-рядок, що містить `"stars":` з ненульовим числом. Перезавантаж сторінку, зіграй знову — зірочки продовжують накопичуватись, а не скидаються.
  10. Звук: перемкни 🔇, перевір `localStorage.getItem('rg_muted')` → `'1'`; перезавантаж — звук лишається вимкненим; увімкни назад.
  11. Тест-режим: відкрий `http://localhost:8080/?test=1` — траса помітно коротша (фініш за ~10–15 с).
  12. Локальний запуск без сервера: відкрий `index.html` подвійним кліком (file://) — гра працює, помилок реєстрації SW немає (реєстрація пропускається, бо протокол не http).

  Якщо якийсь пункт падає — виправ до переходу далі (найчастіші проблеми: порядок скриптів у index.html, забутий `screens.hide()` перед стартом гонки).

- [ ] **Крок 7: Фінальна перевірка тестів і коміт**

  ```
  node tests/all.js
  ```
  Очікуваний вивід: останній рядок `OK: <N> checks`, exit code 0.

  ```
  git add index.html js/main.js && git commit -m "feat: зшивання гри, збереження прогресу"
  ```

  Очікувано: коміт створено, `2 files changed`; `git status` — робоче дерево чисте.

---

### Task 11: PWA: manifest, service worker, іконки

Мета: перетворити гру на PWA — маніфест для «Додати на головний екран», service worker для офлайн-роботи після першого відкриття, набір іконок (SVG + PNG 512/192/180). Реєстрація service worker уже виконана в `js/main.js` (Task 10) — тут її НЕ чіпаємо, лише створюємо самі файли PWA.

**Files:**
- Create: `manifest.json`, `sw.js`, `icon.svg`, `tools/icon-gen.html`, `assets/icon-512.png`, `assets/icon-192.png`, `assets/icon-180.png`
- Modify: `index.html` (favicon + перевірка manifest/apple-touch-icon), `tests/all.js` (підключити новий тест)
- Test: `tests/pwa.test.js`

**Interfaces:**
- Consumes:
  - `RG.sprites.drawCar(ctx, cx, bottomY, w, carDef, opts)` із `js/sprites.js` — малює мультяшну машинку (вид ззаду) відносно (cx — центр по x, bottomY — низ по y), ширина `w`; `carDef` — об'єкт `{ id, label, color, accent, shape }`; `opts` — `{}`. Використовується в `tools/icon-gen.html`.
  - `js/main.js` уже містить реєстрацію: service worker реєструється лише якщо `location.protocol.startsWith('http')`. Нічого не додавати.
  - `tests/t.js`: `const { check, done } = require('./t.js');` — `check(name, cond)` рахує перевірки, `done()` друкує `OK: N checks` (exit 0) або `FAILED: N checks` (exit 1).
- Produces:
  - `manifest.json` — name «Ромчик-Гонщик», short_name «Ромчик», start_url `.`, display `standalone`, кольори `#4FC3F7`, іконки icon.svg (any + maskable) + PNG 192/512. Використовується Task 12 (наскрізна перевірка) і Task 13 (GitHub Pages).
  - `sw.js` — константа `CACHE = 'rg-v1'`, масив `FILES` з усіма файлами гри; cache-first стратегія.
  - `icon.svg`, `assets/icon-{512,192,180}.png` — іконки для manifest, favicon і apple-touch-icon.

- [ ] **Крок 1: Написати тест tests/pwa.test.js, що падає**

Тест перевіряє поля manifest.json, наявність усіх файлів іконок і те, що кожен файл зі списку `FILES` у sw.js реально існує (щоб офлайн-кеш ніколи не посилався на неіснуючий файл).

```js
const fs = require('fs');
const path = require('path');
const { check, done } = require('./t.js');

const root = path.join(__dirname, '..');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
check('manifest name', manifest.name === 'Ромчик-Гонщик');
check('manifest short_name', manifest.short_name === 'Ромчик');
check('manifest start_url', manifest.start_url === '.');
check('manifest display', manifest.display === 'standalone');
check('manifest background_color', manifest.background_color === '#4FC3F7');
check('manifest theme_color', manifest.theme_color === '#4FC3F7');
check('manifest icons is array of 3', Array.isArray(manifest.icons) && manifest.icons.length === 3);
manifest.icons.forEach(function (icon) {
  check('icon file exists: ' + icon.src, fs.existsSync(path.join(root, icon.src)));
});

const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
check('sw cache name rg-v1', sw.indexOf("const CACHE = 'rg-v1';") !== -1);
const m = sw.match(/const FILES = \[([\s\S]*?)\];/);
check('sw FILES array present', !!m);
const files = m ? m[1].match(/'([^']+)'/g).map(function (s) { return s.slice(1, -1); }) : [];
check('sw FILES has 18 entries', files.length === 18);
files.forEach(function (f) {
  const rel = f === './' ? 'index.html' : f;
  check('cached file exists: ' + f, fs.existsSync(path.join(root, rel)));
});

done();
```

- [ ] **Крок 2: Запустити тест, переконатися що падає**

```bash
node tests/pwa.test.js
```

Очікувано: краш із `Error: ENOENT: no such file or directory, open '…/manifest.json'`, exit code ≠ 0 (`echo $?` → не 0). Файлів PWA ще нема — це правильно.

- [ ] **Крок 3: Створити manifest.json**

Повний вміст файлу `manifest.json` (шляхи відносні — на GitHub Pages гра живе в підкаталозі):

```json
{
  "name": "Ромчик-Гонщик",
  "short_name": "Ромчик",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#4FC3F7",
  "theme_color": "#4FC3F7",
  "icons": [
    { "src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" },
    { "src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Крок 4: Створити icon.svg**

Векторна іконка: небо, сонце, дорога, що тікає вдалечінь, червона гоночна машинка видом ззаду. Фон заливає весь квадрат (важливо для `purpose: maskable`). Повний вміст `icon.svg`:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4FC3F7"/>
  <circle cx="404" cy="104" r="52" fill="#FFEB3B"/>
  <rect y="300" width="512" height="212" fill="#66BB6A"/>
  <polygon points="226,300 286,300 396,512 116,512" fill="#546E7A"/>
  <rect x="250" y="312" width="12" height="40" fill="#FFF176"/>
  <rect x="248" y="376" width="16" height="48" fill="#FFF176"/>
  <rect x="150" y="386" width="36" height="68" rx="12" fill="#263238"/>
  <rect x="326" y="386" width="36" height="68" rx="12" fill="#263238"/>
  <rect x="156" y="340" width="200" height="100" rx="24" fill="#E53935"/>
  <rect x="146" y="324" width="220" height="18" rx="9" fill="#B71C1C"/>
  <rect x="196" y="352" width="120" height="40" rx="14" fill="#90CAF9"/>
  <rect x="176" y="410" width="52" height="20" rx="6" fill="#FFCDD2"/>
  <rect x="284" y="410" width="52" height="20" rx="6" fill="#FFCDD2"/>
</svg>
```

- [ ] **Крок 5: Створити sw.js**

Cache-first: усе зі списку віддається з кешу; нове (тільки GET, same-origin) — з мережі з докладанням у кеш. `sw.js` сам себе в `FILES` не включає — його оновленням керує браузер. Повний вміст `sw.js`:

```js
const CACHE = 'rg-v1';
const FILES = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-180.png',
  './js/utils.js',
  './js/learning.js',
  './js/audio.js',
  './js/sprites.js',
  './js/road.js',
  './js/tracks.js',
  './js/race.js',
  './js/events.js',
  './js/screens.js',
  './js/main.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (res) {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(e.request, copy); });
        }
        return res;
      });
    })
  );
});
```

- [ ] **Крок 6: Створити tools/icon-gen.html**

Сторінка малює іконку на трьох канвасах (512/192/180), машинку бере з `RG.sprites.drawCar`, і кладе base64 кожного PNG у `<textarea>` (через `textContent` — щоб текст було видно у DOM-дампі headless-браузера). Повний вміст `tools/icon-gen.html`:

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Генератор іконок — Ромчик-Гонщик</title>
  <style>
    body { font-family: 'Chalkboard SE', 'Comic Sans MS', cursive, sans-serif; background: #ECEFF1; margin: 16px; }
    canvas { border: 1px solid #90A4AE; margin: 0 8px 8px 0; vertical-align: top; }
    textarea { width: 100%; height: 64px; font-size: 10px; }
  </style>
</head>
<body>
  <h1>Іконки «Ромчик-Гонщик»</h1>
  <div>
    <canvas id="c512" width="512" height="512"></canvas>
    <canvas id="c192" width="192" height="192"></canvas>
    <canvas id="c180" width="180" height="180"></canvas>
  </div>
  <h2>base64 (PNG, без префікса data:)</h2>
  <p>512×512</p><textarea id="b64-512"></textarea>
  <p>192×192</p><textarea id="b64-192"></textarea>
  <p>180×180</p><textarea id="b64-180"></textarea>
  <script src="../js/utils.js"></script>
  <script src="../js/sprites.js"></script>
  <script>
    (function () {
      'use strict';
      const CAR = { id: 'race', label: 'Червона гоночна', color: '#E53935', accent: '#FFCDD2', shape: 'race' };

      function drawIcon(ctx, size) {
        const s = size / 512;
        const sky = ctx.createLinearGradient(0, 0, 0, 300 * s);
        sky.addColorStop(0, '#29B6F6');
        sky.addColorStop(1, '#B3E5FC');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, size, 300 * s);
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(404 * s, 104 * s, 52 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#66BB6A';
        ctx.fillRect(0, 300 * s, size, size - 300 * s);
        ctx.fillStyle = '#546E7A';
        ctx.beginPath();
        ctx.moveTo(226 * s, 300 * s);
        ctx.lineTo(286 * s, 300 * s);
        ctx.lineTo(396 * s, size);
        ctx.lineTo(116 * s, size);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFF176';
        ctx.lineWidth = 10 * s;
        ctx.setLineDash([36 * s, 28 * s]);
        ctx.beginPath();
        ctx.moveTo(256 * s, 300 * s);
        ctx.lineTo(256 * s, size);
        ctx.stroke();
        ctx.setLineDash([]);
        RG.sprites.drawCar(ctx, 256 * s, 484 * s, 220 * s, CAR, {});
      }

      [512, 192, 180].forEach(function (size) {
        const canvas = document.getElementById('c' + size);
        const ctx = canvas.getContext('2d');
        drawIcon(ctx, size);
        const b64 = canvas.toDataURL('image/png').split(',')[1];
        document.getElementById('b64-' + size).textContent = b64;
      });
    })();
  </script>
</body>
</html>
```

- [ ] **Крок 7: Згенерувати DOM-дамп сторінки іконок через headless Chrome**

З кореня проєкту:

```bash
mkdir -p assets
python3 -m http.server 8080 > /dev/null 2>&1 &
sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --virtual-time-budget=3000 --dump-dom \
  http://localhost:8080/tools/icon-gen.html > /tmp/icon-dom.html
wc -c /tmp/icon-dom.html
```

Очікувано: розмір дампа понад 20000 байт (три base64-рядки PNG усередині textarea). Якщо Chrome нема за цим шляхом — відкрити `http://localhost:8080/tools/icon-gen.html` у будь-якому браузері вручну і скопіювати вміст кожної textarea у файли `/tmp/icon-512.b64`, `/tmp/icon-192.b64`, `/tmp/icon-180.b64` (тоді Крок 8 почати одразу з команд `base64`).

- [ ] **Крок 8: Витягти base64 і записати PNG через base64 -d**

```bash
cat > /tmp/extract-icons.js <<'EOF'
const fs = require('fs');
const html = fs.readFileSync('/tmp/icon-dom.html', 'utf8');
[512, 192, 180].forEach(function (size) {
  const re = new RegExp('id="b64-' + size + '"[^>]*>\\s*([A-Za-z0-9+/=]+)\\s*<');
  const m = html.match(re);
  if (!m) { console.error('FAIL: no base64 for ' + size); process.exit(1); }
  fs.writeFileSync('/tmp/icon-' + size + '.b64', m[1]);
  console.log('icon-' + size + ': ' + m[1].length + ' base64 chars');
});
EOF
node /tmp/extract-icons.js
base64 -d < /tmp/icon-512.b64 > assets/icon-512.png
base64 -d < /tmp/icon-192.b64 > assets/icon-192.png
base64 -d < /tmp/icon-180.b64 > assets/icon-180.png
file assets/icon-512.png assets/icon-192.png assets/icon-180.png
```

Очікуваний вивід `node`: три рядки `icon-<size>: <N> base64 chars` (N — тисячі символів). Очікуваний вивід `file`:

```
assets/icon-512.png: PNG image data, 512 x 512, 8-bit/color RGBA, non-interlaced
assets/icon-192.png: PNG image data, 192 x 192, 8-bit/color RGBA, non-interlaced
assets/icon-180.png: PNG image data, 180 x 180, 8-bit/color RGBA, non-interlaced
```

Якщо `base64 -d` лається на опцію (старіші macOS) — використати `base64 -D`.

- [ ] **Крок 9: Запустити тест, переконатися що проходить; підключити до tests/all.js**

```bash
node tests/pwa.test.js
```

Очікувано: `OK: 31 checks`, exit 0. Потім додати в кінець `tests/all.js` рядок:

```js
require('./pwa.test.js');
```

І перевірити весь набір:

```bash
node tests/all.js
```

Очікувано: усі рядки `OK: N checks`, exit 0.

- [ ] **Крок 10: Оновити index.html — favicon та PWA-теги**

У `<head>` файлу `index.html` мають бути всі чотири рядки нижче. Рядки manifest, theme-color і apple-touch-icon зазвичай уже стоять із Task 1 — тоді додати лише favicon (`<link rel="icon" …>`) одразу після рядка manifest; яких бракує — додати:

```html
  <meta name="theme-color" content="#4FC3F7">
  <link rel="manifest" href="manifest.json">
  <link rel="icon" href="icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/icon-180.png">
```

Швидка перевірка, що сервер віддає все потрібне (сервер із Кроку 7 ще працює):

```bash
for f in manifest.json sw.js icon.svg assets/icon-192.png; do
  curl -s -o /dev/null -w "%{http_code} $f\n" http://localhost:8080/$f;
done
```

Очікувано — чотири рядки `200 …`.

- [ ] **Крок 11: Ручна перевірка PWA у браузері**

Відкрити `http://localhost:8080/` у Chrome і перевірити:

1. DevTools → Application → Manifest: ім'я «Ромчик-Гонщик», short name «Ромчик», іконки відображаються, розділ помилок (Installability) порожній.
2. DevTools → Application → Service Workers: `sw.js` у стані «activated and is running» (реєструє `js/main.js`, бо протокол http).
3. Офлайн: DevTools → Network → поставити «Offline» → перезавантажити сторінку → гра відкривається і працює (усе з кешу `rg-v1`; Application → Cache Storage → `rg-v1` містить 18 записів).
4. Вкладка браузера показує favicon (машинка з icon.svg).

Примітка на майбутнє: після будь-якої зміни файлів гри service worker віддаватиме старий кеш — для нової версії треба підняти константу (`rg-v2`); при повторному ручному тестуванні допомагає Application → Service Workers → «Update on reload». Після перевірки зупинити сервер:

```bash
kill %1
```

- [ ] **Крок 12: Коміт**

```bash
git add manifest.json sw.js icon.svg tools/icon-gen.html assets/icon-512.png assets/icon-192.png assets/icon-180.png index.html tests/pwa.test.js tests/all.js
git commit -m "feat: PWA — офлайн і встановлення на екран"
```

Очікувано: коміт створено, `git status` чистий (окрім файлів інших задач, якщо такі є).

---

### Task 12: Наскрізна перевірка в браузері (Playwright)

Мета: прогнати повний цикл гри в реальному браузері (Chromium) на двох в'юпортах —
desktop 1280×800 і mobile 375×812: меню → вибір Ромчика → вибір машини → вибір
траси → гонка з `?test=1` (коротка траса) → відповіді на завдання зупинок →
фініш → наліпка → «Ще раз!». Перевірити нуль помилок у консолі, збереження
localStorage після перезавантаження, кермування стрілками та pointer'ом.
Знайдені баги виправити окремими комітами `fix: …`.

**Files:**
- Create (ПОЗА репозиторієм, не комітяться — гра лишається з нулем залежностей):
  - `/tmp/rg-e2e/package.json` (генерується `npm init -y`)
  - `/tmp/rg-e2e/e2e.js` — Playwright-скрипт наскрізної перевірки
- Modify (лише за потреби, як виправлення знайдених багів): `index.html`,
  `js/*.js`, `css/style.css`
- Test: `node /tmp/rg-e2e/e2e.js`

**Interfaces:**
- Consumes (поведінка гри, реалізована в попередніх задачах):
  - URL-параметр `?test=1` → `shortTrack: true` (коротка траса ~80 сегментів,
    гонка триває секунди) — обробляється в `js/main.js`.
  - Ключі localStorage: `'rg_progress'` — JSON прогресу вигляду
    `{v, letters:{level,streak}, numbers:{level,streak}, math:{level,streak}, stars, stickers:[]}`;
    `'rg_muted'` — `'1'`/`'0'`.
  - DOM: `<canvas id="game">`, `<div id="ui">` (усі екрани та оверлеї — всередині `#ui`).
  - UI-тексти кнопок/написів: «ГРАТИ», «Далі ▶», «Ще раз!», «Інша траса»,
    «Нова наліпка!», HUD-кнопки 🔇/🔊 і 🏠; перша картка гравця — «Ромчик»,
    перша машина — «Червона гоночна», перша траса — «Гори». Кнопки-відповіді
    завдань великі (min-height 64px).
  - Керування: `keydown`/`keyup` ArrowLeft/ArrowRight (та A/D);
    `pointerdown`/`pointermove`/`pointerup` на канвасі.
- Produces: жодних нових програмних інтерфейсів. Результат задачі — зелений
  прогін `node /tmp/rg-e2e/e2e.js` → `OK: 30 checks` (exit 0) і, за потреби,
  fix-коміти в репозиторії.

Примітка: якщо доступні MCP-інструменти Playwright, ними можна користуватися для
ручної розвідки DOM під час діагностики, але канонічна перевірка — саме скрипт
нижче (відтворюваний, з фіксованим переліком перевірок).

- [ ] **Крок 1: Запустити локальний сервер**

  З кореня репозиторію, у фоні (або в окремому терміналі):

  ```
  cd /Users/romanprokopyshyn/Desktop/work/romchyk-racing && python3 -m http.server 8080
  ```

  Очікуваний вивід: `Serving HTTP on :: port 8080 (http://[::]:8080/) ...`

  Перевірити доступність:

  ```
  curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/index.html
  ```

  Очікуваний вивід: `200`

- [ ] **Крок 2: Створити пісочницю Playwright поза репозиторієм**

  Playwright НЕ додається в репозиторій (глобальне правило: нуль залежностей у грі).

  ```
  mkdir -p /tmp/rg-e2e && cd /tmp/rg-e2e && npm init -y && npm i playwright && npx playwright install chromium
  ```

  Очікувано: `npm init` друкує згенерований package.json; `npm i` — рядок на
  кшталт `added 1 package in …s`; `npx playwright install chromium` завантажує
  браузер (`Chromium … downloaded to …`) або мовчки завершується, якщо вже є.

- [ ] **Крок 3: Написати скрипт наскрізної перевірки /tmp/rg-e2e/e2e.js**

  Стратегія скрипта: кнопки шукаються за видимим текстом усередині `#ui`;
  якщо текст на картці не рендериться (картки — канваси), клікається ПЕРША
  видима кнопка екрана — за контрактом перша картка це якраз Ромчик / червона
  гоночна / Гори. Відповіді на завдання зупинок: клікати великі кнопки-опції
  по черзі, доки оверлей не сховається (неправильна відповідь нічого не ламає —
  так заодно перевіряється лагідна обробка помилки). Кнопки HUD (🔇/🔊/🏠)
  і фінішні («Ще раз!», «Інша траса») з опцій виключаються.

  ```js
  'use strict';
  const path = require('path');
  const { chromium } = require('playwright');

  const BASE = process.env.GAME_URL || 'http://localhost:8080/index.html?test=1';
  const SHOTS = __dirname;

  let checks = 0;
  function check(name, cond) {
    checks++;
    if (cond) console.log('  ok: ' + name);
    else { console.error('  FAIL: ' + name); process.exitCode = 1; }
  }

  function isServiceText(t) {
    return t.includes('🔇') || t.includes('🔊') || t.includes('🏠') ||
      t.includes('Ще раз') || t.includes('Інша') || t.includes('Далі');
  }

  async function visibleUiButtons(page) {
    const all = page.locator('#ui button');
    const n = await all.count();
    const res = [];
    for (let i = 0; i < n; i++) {
      const b = all.nth(i);
      if (await b.isVisible().catch(() => false)) res.push(b);
    }
    return res;
  }

  async function buttonWithText(page, text) {
    const buttons = await visibleUiButtons(page);
    for (const b of buttons) {
      const t = (await b.textContent().catch(() => '')) || '';
      if (t.includes(text)) return b;
    }
    return null;
  }

  async function clickCardThenNext(page, cardText, checkName) {
    const card = (await buttonWithText(page, cardText)) || (await visibleUiButtons(page))[0];
    check(checkName, !!card);
    if (!card) return;
    await card.click();
    await page.waitForTimeout(600);
    const next = await buttonWithText(page, 'Далі');
    if (next) {
      await next.click();
      await page.waitForTimeout(600);
    }
  }

  async function taskOptionButtons(page) {
    const buttons = await visibleUiButtons(page);
    const res = [];
    for (const b of buttons) {
      const t = (await b.textContent().catch(() => '')) || '';
      if (isServiceText(t)) continue;
      const box = await b.boundingBox().catch(() => null);
      if (box && box.height >= 56) res.push(b);
    }
    return res;
  }

  async function answerTask(page) {
    let tries = 0;
    while (tries < 6) {
      const opts = await taskOptionButtons(page);
      if (opts.length === 0) return true;
      await opts[Math.min(tries, opts.length - 1)].click().catch(() => {});
      tries++;
      await page.waitForTimeout(900);
    }
    return (await taskOptionButtons(page)).length === 0;
  }

  async function steerKeys(page) {
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(350);
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(350);
    await page.keyboard.up('ArrowRight');
  }

  async function steerPointer(page) {
    const box = await page.locator('#game').boundingBox();
    if (!box) return;
    const y = box.y + box.height * 0.75;
    await page.mouse.move(box.x + box.width * 0.5, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 8 });
    await page.waitForTimeout(250);
    await page.mouse.move(box.x + box.width * 0.8, y, { steps: 8 });
    await page.mouse.up();
  }

  async function raceToFinish(page, steer) {
    const deadline = Date.now() + 120000;
    let steered = 0;
    while (Date.now() < deadline) {
      if (await buttonWithText(page, 'Ще раз')) return true;
      const opts = await taskOptionButtons(page);
      if (opts.length > 0) {
        await answerTask(page);
        continue;
      }
      if (steered < 4) { await steer(page); steered++; }
      await page.waitForTimeout(400);
    }
    return false;
  }

  async function runScenario(browser, label, viewport, steer) {
    console.log('=== ' + label + ' ===');
    const context = await browser.newContext({ viewport, hasTouch: label === 'mobile' });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto(BASE);
    await page.waitForTimeout(1200);
    check(label + ': канвас #game на сторінці', (await page.locator('#game').count()) === 1);
    const play = await buttonWithText(page, 'ГРАТИ');
    check(label + ': меню — кнопка ГРАТИ', !!play);
    if (!play) { await context.close(); return; }
    await play.click();
    await page.waitForTimeout(700);

    await clickCardThenNext(page, 'Ромчик', label + ': вибір гравця (Ромчик)');
    await clickCardThenNext(page, 'гоночна', label + ': вибір машини (червона гоночна)');
    await clickCardThenNext(page, 'Гори', label + ': вибір траси (Гори)');

    await page.screenshot({ path: path.join(SHOTS, label + '-race-start.png') });
    if (label === 'desktop') {
      await page.keyboard.down('ArrowLeft');
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(SHOTS, 'desktop-steer-left.png') });
      await page.keyboard.up('ArrowLeft');
    }

    const finished = await raceToFinish(page, steer);
    check(label + ': гонка дійшла до фінішу', finished);
    await page.screenshot({ path: path.join(SHOTS, label + '-finish.png') });
    check(label + ': напис «Нова наліпка!»', (await page.getByText('Нова наліпка').count()) > 0);

    const p1 = await page.evaluate(() => localStorage.getItem('rg_progress'));
    const prog1 = p1 ? JSON.parse(p1) : null;
    check(label + ': прогрес збережено в localStorage', !!prog1);
    check(label + ': зірочки нараховано (stars >= 1)', !!prog1 && prog1.stars >= 1);
    check(label + ': наліпку видано (stickers.length >= 1)', !!prog1 && prog1.stickers.length >= 1);

    const again = await buttonWithText(page, 'Ще раз');
    check(label + ': кнопка «Ще раз!» на фініші', !!again);
    if (again) {
      await again.click();
      await page.waitForTimeout(800);
      check(label + ': «Ще раз» перезапускає гонку', !(await buttonWithText(page, 'Ще раз')));
    }

    await page.reload();
    await page.waitForTimeout(1200);
    const p2 = await page.evaluate(() => localStorage.getItem('rg_progress'));
    const prog2 = p2 ? JSON.parse(p2) : null;
    check(label + ': прогрес пережив перезавантаження',
      !!prog1 && !!prog2 && prog2.stars >= prog1.stars && prog2.stickers.length >= prog1.stickers.length);
    check(label + ': після перезавантаження знову меню', !!(await buttonWithText(page, 'ГРАТИ')));

    check(label + ': нуль помилок у консолі', errors.length === 0);
    if (errors.length) console.error('  console errors:\n  ' + errors.join('\n  '));

    await context.close();
  }

  (async () => {
    const browser = await chromium.launch({ headless: !process.env.HEADED });
    await runScenario(browser, 'desktop', { width: 1280, height: 800 }, steerKeys);
    await runScenario(browser, 'mobile', { width: 375, height: 812 }, steerPointer);
    await browser.close();
    console.log((process.exitCode ? 'FAILED' : 'OK') + ': ' + checks + ' checks');
  })().catch((e) => { console.error('FATAL: ' + e.stack); process.exit(1); });
  ```

- [ ] **Крок 4: Прогнати перевірку (desktop + mobile)**

  ```
  node /tmp/rg-e2e/e2e.js
  ```

  Очікуваний вивід (скорочено):

  ```
  === desktop ===
    ok: desktop: канвас #game на сторінці
    ok: desktop: меню — кнопка ГРАТИ
    ...
    ok: desktop: нуль помилок у консолі
  === mobile ===
    ...
    ok: mobile: нуль помилок у консолі
  OK: 30 checks
  ```

  `echo $?` → `0`. Якщо є рядки `FAIL:` або `FATAL:` — перейти до кроку 6.

- [ ] **Крок 5: Переглянути скріншоти (візуальна перевірка кермування і фінішу)**

  ```
  ls /tmp/rg-e2e/*.png
  ```

  Очікувано 5 файлів: `desktop-race-start.png`, `desktop-steer-left.png`,
  `desktop-finish.png`, `mobile-race-start.png`, `mobile-finish.png`.
  Відкрити кожен і переконатися: на `desktop-steer-left.png` дорога/камера
  зміщені відносно `desktop-race-start.png` (кермування стрілкою працює,
  машинка нахилена вліво); на `*-finish.png` — кубок 🏆, конфеті, наліпка,
  кнопки «Ще раз!» та «Інша траса»; на mobile-скріншотах немає горизонтального
  обрізання кнопок і канвас заповнює екран.

- [ ] **Крок 6: Діагностика і виправлення знайдених багів (якщо є FAIL)**

  Для кожного FAIL — систематично, по одному:
  1. Повторити прогін з видимим браузером і спостерігати місце збою:
     ```
     HEADED=1 node /tmp/rg-e2e/e2e.js
     ```
  2. Класифікувати причину:
     - Помилка в коді гри (JS-помилка в консолі, екран не з'являється,
       збереження не працює, фініш не настає) → мінімальне виправлення у
       відповідному файлі репозиторію. КОЖНЕ виправлення — окремий коміт:
       ```
       cd /Users/romanprokopyshyn/Desktop/work/romchyk-racing && git add <файл> && git commit -m "fix: <короткий опис бага>"
       ```
     - Проблема селектора/таймінгу в самому e2e-скрипті (гра працює, скрипт не
       знаходить кнопку) → правити `/tmp/rg-e2e/e2e.js` (він поза репозиторієм,
       коміт не потрібен). Подивитися фактичний DOM оверлеїв можна так:
       у скрипті тимчасово додати
       `console.log(await page.evaluate(() => document.getElementById('ui').innerHTML));`
  3. Важливо про service worker: `sw.js` працює за принципом cache-first, тож
     при ручній перевірці правок у звичайному браузері потрібен hard-reload
     (Cmd+Shift+R) або DevTools → Application → Service Workers → Update.
     На e2e-прогін це НЕ впливає: кожен запуск створює свіжий браузерний
     контекст без старого кеша.

- [ ] **Крок 7: Favicon — чиста консоль у реальному браузері**

  Headless-браузер не запитує `favicon.ico`, а реальний Chrome запитує і при
  його відсутності друкує 404-помилку в консоль. Перевірити:

  ```
  cd /Users/romanprokopyshyn/Desktop/work/romchyk-racing && grep -n 'rel="icon"' index.html
  ```

  Якщо вивід порожній — додати в `<head>` файлу `index.html` одразу після
  рядка з `<link rel="manifest" href="manifest.json">`:

  ```html
  <link rel="icon" href="icon.svg" type="image/svg+xml">
  ```

  І закомітити:

  ```
  git add index.html && git commit -m "fix: favicon icon.svg — чиста консоль браузера"
  ```

  Очікуваний вивід: `1 file changed, 1 insertion(+)`. Якщо grep щось знайшов —
  крок пропустити.

- [ ] **Крок 8: Фінальний зелений прогін**

  ```
  node /tmp/rg-e2e/e2e.js
  ```

  Очікуваний вивід завершується рядком `OK: 30 checks`, exit code 0, жодного
  `FAIL:`. Також переконатися, що Node-тести гри не зламані виправленнями:

  ```
  cd /Users/romanprokopyshyn/Desktop/work/romchyk-racing && node tests/all.js
  ```

  Очікувано: останні рядки кожного тесту `OK: N checks`, exit code 0.

- [ ] **Крок 9: Завершальний коміт і зупинка сервера**

  Усі виправлення мали піти окремими `fix:`-комітами в кроках 6–7. Перевірити,
  що робоче дерево чисте:

  ```
  cd /Users/romanprokopyshyn/Desktop/work/romchyk-racing && git status --short
  ```

  Очікуваний вивід: порожній. Якщо лишилися незакомічені правки — закомітити:

  ```
  git add -A && git commit -m "fix: правки за наскрізною перевіркою Playwright"
  ```

  Зупинити локальний сервер (Ctrl+C у терміналі з `http.server` або
  `kill` його PID). Каталог `/tmp/rg-e2e` можна лишити — у репозиторій він
  не потрапляє.

---

### Task 13: Публікація на GitHub Pages

**Мета:** опублікувати готову гру в публічному репозиторії GitHub `romchyk-racing`, увімкнути GitHub Pages з гілки `main` (корінь), дочекатися, поки гра стане доступною за посиланням `https://<owner>.github.io/romchyk-racing/`, і написати фінальний README з посиланням на гру.

**Передумови:** проєкт повністю готовий (Tasks 1–12): гра працює локально, всі тести проходять, у корені є `.nojekyll` (створений у Task 1), встановлений GitHub CLI (`gh`) та `git` з хоча б одним комітом. `git init` у проєкті вже зроблено раніше.

**Files:**
- Create: — (нових файлів коду немає)
- Modify: `README.md` (замінити заготовку «в розробці» на фінальний вміст)
- Test: — (Node-тестів у цій задачі немає; перевірка — точні shell-команди з очікуваним виводом)

**Interfaces:**
- Consumes:
  - весь готовий проєкт у корені репозиторію: `index.html`, `css/style.css`, `js/*.js`, `manifest.json`, `sw.js`, `icon.svg`, `assets/icon-{180,192,512}.png`, `tests/*`, `tools/*`, `.nojekyll`, `README.md`;
  - команда прогону всіх тестів: `node tests/all.js` → останні рядки `OK: N checks`, exit code 0;
  - титул сторінки гри (для перевірки деплою): `<title>Ромчик-Гонщик 🏎️</title>`.
- Produces:
  - публічний репозиторій `https://github.com/<owner>/romchyk-racing`;
  - живе посилання на гру `https://<owner>.github.io/romchyk-racing/` (HTTP 200);
  - фінальний `README.md` з посиланням на гру, інструкцією як грати та як запустити локально.

Скрізь нижче `<owner>` — це логін користувача GitHub. У командах він отримується автоматично через `OWNER=$(gh api user -q .login)`; у файлі README його треба підставити руками (буде окремий крок).

- [ ] **Крок 1: Переконатися, що всі тести проходять**

  Перед публікацією прогнати повний набір тестів з кореня проєкту:

  ```
  node tests/all.js
  ```

  Очікуваний результат: один або кілька рядків виду `OK: N checks`, ЖОДНОГО рядка `FAIL: …`, exit code 0 (перевірити: `echo $?` → `0`). Якщо є `FAIL` — зупинитися і виправити перед публікацією (це поза межами цієї задачі).

- [ ] **Крок 2: Перевірити чисте робоче дерево, гілку main і наявність .nojekyll**

  ```
  git status --porcelain
  ```

  Очікуваний результат: порожній вивід (усі зміни закомічені). Якщо вивід не порожній — закомітити або відкинути зміни перед продовженням.

  ```
  git branch --show-current
  ```

  Очікуваний результат: `main`. Якщо гілка називається `master` — перейменувати:

  ```
  git branch -M main
  ```

  Перевірити `.nojekyll` (без нього Pages пропускає файли через Jekyll; файл створено в Task 1):

  ```
  ls .nojekyll
  ```

  Очікуваний результат: `.nojekyll`. Якщо файлу нема — створити і закомітити:

  ```
  touch .nojekyll && git add .nojekyll && git commit -m "chore: .nojekyll для GitHub Pages"
  ```

- [ ] **Крок 3: Перевірити авторизацію GitHub CLI**

  ```
  gh auth status
  ```

  Очікуваний результат (приблизно, головне — рядок «Logged in»):

  ```
  github.com
    ✓ Logged in to github.com account <owner> (keyring)
    ✓ Git operations for github.com configured to use https protocol
    ✓ Token: gho_************************************
  ```

  Якщо вивід містить `You are not logged into any GitHub hosts` — **СТОП**: не продовжувати, повідомити користувачу, що потрібно виконати `gh auth login --web` (обрати github.com, HTTPS, авторизуватися в браузері), і після логіна повторити цей крок.

- [ ] **Крок 4: Дізнатися логін власника**

  ```
  gh api user -q .login
  ```

  Очікуваний результат: один рядок з логіном, наприклад:

  ```
  colobocman
  ```

  Запам'ятати це значення — воно і є `<owner>` для README у наступному кроці.

- [ ] **Крок 5: Написати фінальний README.md**

  Повністю замінити вміст `README.md` (заготовку з Task 1) на текст нижче. УВАГА: підставити реальний логін з Кроку 4 замість `<owner>` у посиланні (1 місце):

  ````markdown
  # Ромчик-Гонщик 🏎️

  Дитяча браузерна гра-гонка для 4-річного гонщика: машинки, перегони та
  вивчення українських букв, цифр і простої арифметики. Програти
  неможливо — без таймерів, без «game over», а на фініші завжди свято!

  ## 🎮 Грати просто зараз

  **https://<owner>.github.io/romchyk-racing/**

  Працює на телефоні та комп'ютері прямо в браузері. На телефоні можна
  додати гру на головний екран («Додати на початковий екран») — після
  першого відкриття вона працює навіть офлайн.

  ## Як грати

  1. Натисни велику кнопку «ГРАТИ ▶».
  2. Вибери персонажа — Ромчик, Матвійко, Андрійко або Мія. Троє інших
     стануть суперниками в гонці.
  3. Вибери машинку (6 різних) і трасу: Гори 🏔️, Море 🌊 або Місто 🏙️.
  4. Машина їде вперед сама — треба тільки кермувати:
     - **Телефон:** тримай палець на екрані — машинка їде до пальця.
     - **Комп'ютер:** стрілки ← → або клавіші A/D; мишка працює як палець.
  5. Проїжджай ворота знань через табличку з правильною відповіддю,
     рахуй вагони потяга на переїзді, допомагай поліцейському знаходити
     букви, рахуй конуси на ремонті дороги — і збирай зірочки ⭐ та
     наліпки в альбом!

  Гра сама підлаштовує складність: починає з букв Р, М, А і цифр 1–3,
  а з правильними відповідями поступово додає нові букви, цифри до 10
  та просту арифметику. Прогрес зберігається на пристрої.

  ## Запуск локально

  Це чистий HTML/JS/CSS — без установки, без залежностей, без збірки:

  - **Найпростіше:** подвійний клік по `index.html` (працює через `file://`).
  - **Через локальний сервер** (потрібен, щоб перевірити PWA/офлайн):

    ```
    python3 -m http.server 8080
    ```

    і відкрити http://localhost:8080/ у браузері.

  ## Тести

  ```
  node tests/all.js
  ```

  Очікуваний результат — рядки `OK: N checks` і жодного `FAIL`.

  ## Технічно

  - Vanilla JS + Canvas 2D. Нуль залежностей, нуль кроку збірки,
    нуль зовнішніх запитів.
  - Псевдо-3D дорога — класична сегментна проєкція в стилі OutRun.
  - Машинки й персонажі намальовані кодом, декорації — емодзі-спрайти.
  - Звукові ефекти — Web Audio API; українська озвучка — Web Speech API.
  - PWA: manifest + service worker, офлайн після першого відкриття.
  - Прогрес (рівні навичок, зірочки, наліпки) — у localStorage.
  ````

- [ ] **Крок 6: Закомітити README**

  ```
  git add README.md && git commit -m "docs: README з посиланням на гру"
  ```

  Очікуваний результат: рядок виду `[main abc1234] docs: README з посиланням на гру` та `1 file changed`.

- [ ] **Крок 7: Створити публічний репозиторій і запушити**

  ```
  gh repo create romchyk-racing --public --source=. --push
  ```

  Очікуваний результат (приблизно):

  ```
  ✓ Created repository <owner>/romchyk-racing on GitHub
    https://github.com/<owner>/romchyk-racing
  ✓ Added remote https://github.com/<owner>/romchyk-racing.git
  ✓ Pushed commits to https://github.com/<owner>/romchyk-racing.git
  ```

  Якщо команда впала з помилкою `Name already exists on this account` — репозиторій уже є; тоді додати remote і запушити вручну:

  ```
  OWNER=$(gh api user -q .login) && git remote add origin "https://github.com/$OWNER/romchyk-racing.git" && git push -u origin main
  ```

  (якщо remote `origin` уже існує — лише `git push -u origin main`).

  Перевірити, що гілка на GitHub:

  ```
  git ls-remote --heads origin main
  ```

  Очікуваний результат: один рядок `<sha>\trefs/heads/main`.

- [ ] **Крок 8: Увімкнути GitHub Pages з main:/ через gh api**

  ```
  OWNER=$(gh api user -q .login) && gh api "repos/$OWNER/romchyk-racing/pages" -X POST -H "Accept: application/vnd.github+json" -f "source[branch]=main" -f "source[path]=/"
  ```

  Очікуваний результат: JSON, що містить (серед іншого):

  ```
  "source": { "branch": "main", "path": "/" }
  ```

  Якщо помилка `HTTP 409` з текстом на кшталт `... already exists` — Pages уже ввімкнено; оновити конфігурацію тим самим запитом, але з `-X PUT` (успіх — порожня відповідь, HTTP 204):

  ```
  OWNER=$(gh api user -q .login) && gh api "repos/$OWNER/romchyk-racing/pages" -X PUT -H "Accept: application/vnd.github+json" -f "source[branch]=main" -f "source[path]=/"
  ```

  Перевірити налаштування:

  ```
  OWNER=$(gh api user -q .login) && gh api "repos/$OWNER/romchyk-racing/pages" -q .html_url
  ```

  Очікуваний результат: `https://<owner>.github.io/romchyk-racing/`

- [ ] **Крок 9: Дочекатися HTTP 200 на сторінці гри**

  Перший деплой Pages зазвичай триває 1–3 хвилини; спочатку нормальний статус 404. Опитувати кожні 10 секунд до 5 хвилин:

  ```
  OWNER=$(gh api user -q .login) && for i in $(seq 1 30); do code=$(curl -s -o /dev/null -w '%{http_code}' "https://$OWNER.github.io/romchyk-racing/"); echo "attempt $i: HTTP $code"; if [ "$code" = "200" ]; then break; fi; sleep 10; done
  ```

  Очікуваний результат: кілька рядків `attempt N: HTTP 404`, потім фінальний рядок:

  ```
  attempt N: HTTP 200
  ```

  Якщо через 5 хвилин усе ще 404 — перевірити статус збірки Pages:

  ```
  OWNER=$(gh api user -q .login) && gh api "repos/$OWNER/romchyk-racing/pages/builds/latest" -q .status
  ```

  Очікуваний результат: `built`. Якщо `errored` — подивитися повний JSON цієї ж команди без `-q .status` (поле `error.message`) і виправити причину.

- [ ] **Крок 10: Перевірити, що за посиланням саме гра**

  ```
  OWNER=$(gh api user -q .login) && curl -s "https://$OWNER.github.io/romchyk-racing/" | grep -o '<title>[^<]*</title>'
  ```

  Очікуваний результат:

  ```
  <title>Ромчик-Гонщик 🏎️</title>
  ```

  Додатково переконатися, що ключові файли роздаються (обидві команди мають вивести `200`):

  ```
  OWNER=$(gh api user -q .login) && curl -s -o /dev/null -w '%{http_code}\n' "https://$OWNER.github.io/romchyk-racing/js/main.js" && curl -s -o /dev/null -w '%{http_code}\n' "https://$OWNER.github.io/romchyk-racing/manifest.json"
  ```

- [ ] **Крок 11: Ручна фінальна перевірка в браузері**

  Відкрити `https://<owner>.github.io/romchyk-racing/` у браузері та пройти швидкий цикл: «ГРАТИ ▶» → вибрати персонажа → машинку → трасу → проїхати кілька секунд гонки. Переконатися, що: сторінка вантажиться без помилок у консолі DevTools, звук вмикається після кліку «ГРАТИ ▶», у DevTools → Application → Service Workers сервіс-воркер у стані `activated`. За можливості відкрити те саме посилання на телефоні й перевірити керування пальцем.

- [ ] **Крок 12: Переконатися, що все запушено**

  Коміт задачі (`docs: README з посиланням на гру`) зроблено в Кроці 6 і запушено в Кроці 7. Фінальна перевірка, що локальна гілка не випереджає remote:

  ```
  git status
  ```

  Очікуваний результат: `On branch main`, `Your branch is up to date with 'origin/main'.`, `nothing to commit, working tree clean`. Якщо є незапушені коміти — виконати:

  ```
  git push origin main
  ```

**Результат задачі:** гра опублікована і доступна будь-кому за посиланням `https://<owner>.github.io/romchyk-racing/`; репозиторій публічний; README містить посилання на гру, правила та інструкцію локального запуску.
