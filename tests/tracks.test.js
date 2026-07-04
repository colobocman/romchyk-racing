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
