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

// --- events.createController ---
const segments = [];
road.addRoad(segments, 100, 100, 100, 0, 0); // 300 сегментів, довжина 60000

const ui = {
  shownTask: null, hiddenN: 0, hud: null, wrongIdx: null, correctIdx: null,
  promptText: null, promptHiddenN: 0,
  showTask(task, cb) { this.shownTask = { task, cb }; },
  hideTask() { this.hiddenN++; this.shownTask = null; },
  updateHUD(d) { this.hud = d; },
  markWrong(i) { this.wrongIdx = i; },
  markCorrect(i) { this.correctIdx = i; },
  showPrompt(t) { this.promptText = t; },
  hidePrompt() { this.promptHiddenN++; this.promptText = null; }
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
check('gate: банер підказки показано', ui.promptText === gate1.task.prompt);
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
check('gate: банер підказки сховано', ui.promptHiddenN >= 1);
check('gate: таблички прибрано після проїзду', gseg.sprites.length === 0);

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
const streakAfterWrong = prg[stop1.task.skill].streak;
ui.shownTask.cb(sWrong); // друга помилка не має штрафувати прогрес удруге
check('stop: повторна помилка не штрафує прогрес', prg[stop1.task.skill].streak === streakAfterWrong);
ui.shownTask.cb(sCorrect);
check('stop: правильна — зірочка', prg.stars === starsBefore + 1);
check('stop: правильна — оверлей сховано', ui.hiddenN === 1);
check('stop: правильна — гонка їде далі', r.state === 'running' && r.resumedN === 1);
check('stop: сцену прибрано', r.stopScene === null);

done();
