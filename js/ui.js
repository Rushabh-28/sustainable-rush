/* ==========================================================================
   Sustainable Rush - shared UI helpers
   Text, buttons, panels and the animated eco backdrop used by every scene.
   ========================================================================== */

function addText(scene, x, y, str, size, color, o = {}) {
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: size + 'px',
    color: color,
    fontStyle: o.bold === false ? 'normal' : 'bold',
    align: o.align || 'left',
    stroke: o.stroke || undefined,
    strokeThickness: o.strokeThickness || 0,
    wordWrap: o.wrap ? { width: o.wrap } : undefined,
    lineSpacing: o.lineSpacing || 0,
    shadow: o.shadow ? { offsetX: 0, offsetY: 2, color: o.shadow, blur: 0, fill: true } : undefined,
    resolution: 2
  });
  t.setOrigin(o.ox ?? 0, o.oy ?? 0);
  return t;
}

/* Round-cornered button with optional icon. Returns a Container. */
function makeButton(scene, x, y, w, h, label, o = {}) {
  const fill = o.fill ?? 0x2E7D32;
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const r = Math.min(18, h / 2.4);
  g.fillStyle(0x000000, 0.22).fillRoundedRect(-w / 2, -h / 2 + 5, w, h, r);
  g.fillStyle(fill, 1).fillRoundedRect(-w / 2, -h / 2, w, h, r);
  g.fillStyle(0xFFFFFF, 0.2).fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h / 2 - 3, r - 2);
  c.add(g);

  const size = o.size ?? 20;
  const hasIcon = !!o.icon;
  const iconPx = Math.min(h - 18, size + 8);
  let textX = 0;
  if (hasIcon && label) {
    const labelW = label.length * size * 0.56;
    const total = iconPx + 10 + labelW;
    const ix = -total / 2 + iconPx / 2;
    c.add(scene.add.image(ix, 0, 'ui-' + o.icon + '-w').setDisplaySize(iconPx, iconPx));
    textX = ix + iconPx / 2 + 10 + labelW / 2;
  } else if (hasIcon) {
    c.iconImg = scene.add.image(0, 0, 'ui-' + o.icon + '-w').setDisplaySize(iconPx, iconPx);
    c.add(c.iconImg);
  }
  if (label) {
    const t = addText(scene, textX, 0, label, size, o.textColor || '#FFFFFF', { ox: 0.5, oy: 0.5 });
    c.add(t);
  }

  const hit = scene.add.rectangle(0, 0, w, h, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
  c.add(hit);
  let pressed = false;
  hit.on('pointerdown', () => { pressed = true; SFX.unlock(); scene.tweens.add({ targets: c, scale: 0.94, duration: 70 }); });
  hit.on('pointerout',  () => { pressed = false; scene.tweens.add({ targets: c, scale: 1, duration: 90 }); });
  hit.on('pointerup',   () => {
    scene.tweens.add({ targets: c, scale: 1, duration: 90 });
    if (pressed) { pressed = false; SFX.play('click'); if (o.onClick) o.onClick(); }
  });
  c.hit = hit;
  return c;
}

/* Square icon button with a small caption underneath (used in the game's bottom bar). */
function makeIconButton(scene, x, y, icon, caption, o = {}) {
  const size = o.size ?? 56;
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.2).fillRoundedRect(-size / 2, -size / 2 + 4, size, size, 16);
  g.fillStyle(o.fill ?? 0x2E7D32, 1).fillRoundedRect(-size / 2, -size / 2, size, size, 16);
  g.fillStyle(0xFFFFFF, 0.2).fillRoundedRect(-size / 2 + 3, -size / 2 + 3, size - 6, size / 2 - 3, 12);
  c.add(g);
  const img = scene.add.image(0, 0, 'ui-' + icon + '-w').setDisplaySize(size * 0.52, size * 0.52);
  c.add(img);
  c.icon = img;

  let badge = null;
  if (o.badge !== undefined) {
    const bg = scene.add.circle(size / 2 - 4, -size / 2 + 4, 11, 0xFFC107).setStrokeStyle(2, 0xffffff);
    const bt = addText(scene, size / 2 - 4, -size / 2 + 4, String(o.badge), 13, '#3E2723', { ox: 0.5, oy: 0.5 });
    c.add([bg, bt]);
    badge = { bg, bt };
  }
  c.badge = badge;
  c.setBadge = n => { if (badge) { badge.bt.setText(String(n)); badge.bg.setFillStyle(n > 0 ? 0xFFC107 : 0x90A4AE); } };
  c.setIcon = name => img.setTexture('ui-' + name + '-w');

  const cap = addText(scene, 0, size / 2 + 12, caption, 12, o.captionColor || '#FFFFFF', { ox: 0.5, oy: 0.5, shadow: 'rgba(0,0,0,0.35)' });
  c.add(cap);

  const hit = scene.add.rectangle(0, 2, size + 8, size + 28, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
  c.add(hit);
  hit.on('pointerdown', () => { SFX.unlock(); scene.tweens.add({ targets: c, scale: 0.92, duration: 70 }); });
  hit.on('pointerout',  () => scene.tweens.add({ targets: c, scale: 1, duration: 90 }));
  hit.on('pointerup',   () => { scene.tweens.add({ targets: c, scale: 1, duration: 90 }); if (o.onClick) o.onClick(); });
  return c;
}

function drawPanel(scene, x, y, w, h, o = {}) {
  const g = scene.add.graphics();
  const r = o.radius ?? 24;
  g.fillStyle(0x000000, 0.25).fillRoundedRect(x, y + 6, w, h, r);
  g.fillStyle(o.fill ?? 0xFFFFFF, o.alpha ?? 0.94).fillRoundedRect(x, y, w, h, r);
  if (o.border !== false) g.lineStyle(3, o.border ?? 0x81C784, 1).strokeRoundedRect(x, y, w, h, r);
  return g;
}

/* ---------- animated backdrop: sky, sun/moon, clouds, falling leaves, hills ---------- */

function buildBackdrop(scene, themeName, o = {}) {
  const th = THEMES[themeName];
  const key = 'sky-' + themeName;
  if (!scene.textures.exists(key)) {
    const tex = scene.textures.createCanvas(key, GAME_W, GAME_H);
    const ctx = tex.getContext();
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    grad.addColorStop(0, th.sky[0]);
    grad.addColorStop(1, th.sky[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    tex.refresh();
  }
  scene.add.image(0, 0, key).setOrigin(0).setDepth(-100);

  // stars (dusk / night)
  if (th.stars) {
    for (let i = 0; i < 38; i++) {
      const s = scene.add.image(Phaser.Math.Between(8, GAME_W - 8), Phaser.Math.Between(6, 420), 'spark')
        .setDepth(-95).setAlpha(Phaser.Math.FloatBetween(0.3, 0.9)).setScale(Phaser.Math.FloatBetween(0.1, 0.32));
      scene.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(900, 2400), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 1500) });
    }
  }

  // sun / moon with soft glow
  const [ox, oy] = th.orbPos;
  const glow = scene.add.circle(ox, oy, 62, th.orb, 0.22).setDepth(-94);
  const orb = scene.add.circle(ox, oy, 34, th.orb, 1).setDepth(-93);
  scene.tweens.add({ targets: glow, scale: 1.18, alpha: 0.12, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  if (themeName === 'night' || themeName === 'dusk') {
    scene.add.circle(ox + 12, oy - 6, 28, Phaser.Display.Color.HexStringToColor(th.sky[0]).color, 0.9).setDepth(-92);
  }

  // clouds
  const cloudAlpha = th.stars ? 0.25 : 0.85;
  for (let i = 0; i < 5; i++) {
    const cloud = scene.add.container(Phaser.Math.Between(-60, GAME_W), Phaser.Math.Between(30, 360)).setDepth(-90);
    const s = Phaser.Math.FloatBetween(0.7, 1.4);
    cloud.add([
      scene.add.ellipse(0, 0, 80 * s, 30 * s, 0xffffff, cloudAlpha),
      scene.add.ellipse(-22 * s, 6 * s, 46 * s, 22 * s, 0xffffff, cloudAlpha),
      scene.add.ellipse(24 * s, 7 * s, 50 * s, 22 * s, 0xffffff, cloudAlpha)
    ]);
    driftCloud(scene, cloud, Phaser.Math.Between(60, 130));
  }

  // hills along the bottom
  const g = scene.add.graphics().setDepth(-80);
  g.fillStyle(th.hills[0], 1).fillEllipse(110, GAME_H + 20, 520, 190);
  g.fillStyle(th.hills[1], 1).fillEllipse(400, GAME_H + 30, 560, 210);
  const bottom = th.hills[1];
  g.fillStyle(bottom, 1).fillRect(0, GAME_H - 30, GAME_W, 40);

  // falling leaves
  const n = o.leaves ?? 12;
  for (let i = 0; i < n; i++) spawnLeaf(scene, true);
  return th;
}

function driftCloud(scene, cloud, speed) {
  const dist = GAME_W + 160 - cloud.x;
  scene.tweens.add({
    targets: cloud, x: GAME_W + 160, duration: (dist / speed) * 1000,
    onComplete: () => {
      cloud.x = -160;
      scene.tweens.add({ targets: cloud, x: GAME_W + 160, duration: ((GAME_W + 320) / speed) * 1000, repeat: -1 });
    }
  });
}

function spawnLeaf(scene, initial) {
  const greens = [0x66BB6A, 0x81C784, 0xA5D6A7, 0x9CCC65, 0xC5E1A5];
  const x = Phaser.Math.Between(10, GAME_W - 10);
  const y0 = initial ? Phaser.Math.Between(-20, GAME_H - 40) : -20;
  const leaf = scene.add.image(x, y0, 'leaf').setDepth(-70)
    .setTint(Phaser.Utils.Array.GetRandom(greens))
    .setScale(Phaser.Math.FloatBetween(0.25, 0.5))
    .setAlpha(0.75);
  const full = Phaser.Math.Between(9000, 16000);
  const dur = full * (GAME_H + 30 - y0) / (GAME_H + 50);
  scene.tweens.add({ targets: leaf, y: GAME_H + 30, duration: dur,
    onComplete: () => { scene.tweens.killTweensOf(leaf); leaf.destroy(); spawnLeaf(scene, false); } });
  scene.tweens.add({ targets: leaf, x: x + Phaser.Math.Between(-60, 60), duration: Phaser.Math.Between(1800, 3200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: leaf, angle: Phaser.Math.Between(-180, 180), duration: Phaser.Math.Between(2500, 5000), yoyo: true, repeat: -1 });
}

/* Floating "+50" style text that drifts upward and fades. */
function floatText(scene, x, y, str, color = '#FFFFFF', size = 24) {
  const t = addText(scene, x, y, str, size, color, { ox: 0.5, oy: 0.5, stroke: '#1B5E20', strokeThickness: 4 }).setDepth(60);
  scene.tweens.add({ targets: t, y: y - 52, alpha: 0, scale: 1.25, duration: 900, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
}

/* Small burst of leaves + sparkles. */
function burst(scene, x, y, tint, count = 7) {
  for (let i = 0; i < count; i++) {
    const useLeaf = i % 2 === 0;
    const p = scene.add.image(x, y, useLeaf ? 'leaf' : 'spark').setDepth(55).setTint(tint)
      .setScale(Phaser.Math.FloatBetween(0.25, 0.5)).setAngle(Phaser.Math.Between(0, 360));
    const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const d = Phaser.Math.Between(26, 64);
    scene.tweens.add({
      targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d + 14, alpha: 0,
      angle: p.angle + Phaser.Math.Between(-200, 200), scale: 0.05,
      duration: Phaser.Math.Between(420, 760), ease: 'Cubic.easeOut', onComplete: () => p.destroy()
    });
  }
}
