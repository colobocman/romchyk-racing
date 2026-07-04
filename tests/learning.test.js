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

done();
