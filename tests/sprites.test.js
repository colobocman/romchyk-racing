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

done();
