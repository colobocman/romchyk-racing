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

  road.findSegment = function (segments, z) {
    return segments[Math.floor(z / road.SEG_LEN) % segments.length];
  };

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

  root.road = road;
  if (typeof module !== 'undefined' && module.exports) module.exports = road;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
