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

    return r;
  };

  root.race = race;
  if (typeof module !== 'undefined' && module.exports) module.exports = race;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
