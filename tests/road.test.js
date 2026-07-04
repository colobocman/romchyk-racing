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

done();
