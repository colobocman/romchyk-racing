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

  root.learning = learning;
  if (typeof module !== 'undefined' && module.exports) module.exports = learning;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
