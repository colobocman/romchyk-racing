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
