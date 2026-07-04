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

done();
