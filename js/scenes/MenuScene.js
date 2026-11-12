/* MenuScene - title screen, continue / new game, level select, how-to-play. */
class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    buildBackdrop(this, 'menu', { leaves: 16 });
    const d = Save.data;
    const hasProgress = d.unlocked > 0 || d.stars.some(s => s > 0);

    // planet + title
    const earth = this.add.image(240, 108, 'earth').setDisplaySize(104, 104);
    this.tweens.add({ targets: earth, y: 118, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: earth, angle: 6, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    addText(this, 240, 200, 'SUSTAINABLE', 46, '#1B5E20', { ox: 0.5, oy: 0.5, stroke: '#FFFFFF', strokeThickness: 8 });
    const rush = addText(this, 240, 256, 'RUSH', 76, '#2E7D32', { ox: 0.5, oy: 0.5, stroke: '#FFFFFF', strokeThickness: 10 });
    this.tweens.add({ targets: rush, scale: 1.05, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    addText(this, 240, 316, 'Match. Clean. Save the planet.', 18, '#33691E', { ox: 0.5, oy: 0.5, stroke: '#FFFFFF', strokeThickness: 4 });

    // bouncing tile row
    TILE_DEFS.forEach((def, i) => {
      const t = this.add.image(240 + (i - 2) * 70, 372, 'tile-' + i).setDisplaySize(54, 54);
      this.tweens.add({ targets: t, y: 360, angle: (i % 2 ? 6 : -6), duration: 700 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 120 });
    });

    // buttons
    const startLevel = (idx, total) => {
      SFX.unlock();
      this.scene.start('Game', { level: idx, totalScore: total, run: newRunStats() });
    };

    if (hasProgress) {
      const idx = d.unlocked;
      makeButton(this, 240, 450, 320, 62, `CONTINUE  LEVEL ${idx + 1}`, { icon: 'play', size: 21, fill: 0x2E7D32, onClick: () => startLevel(idx, d.startTotals[idx] || 0) });
      makeButton(this, 128, 520, 200, 50, 'HOW TO PLAY', { icon: 'info', size: 16, fill: 0x1E88E5, onClick: () => this.showHelp() });
      makeButton(this, 352, 520, 200, 50, 'NEW GAME', { icon: 'retry', size: 16, fill: 0xEF6C00, onClick: () => startLevel(0, 0) });
    } else {
      makeButton(this, 240, 450, 320, 62, 'PLAY', { icon: 'play', size: 26, fill: 0x2E7D32, onClick: () => startLevel(0, 0) });
      makeButton(this, 240, 520, 240, 50, 'HOW TO PLAY', { icon: 'info', size: 16, fill: 0x1E88E5, onClick: () => this.showHelp() });
    }

    // level select
    addText(this, 240, 580, 'LEVELS', 14, '#1B5E20', { ox: 0.5, oy: 0.5, stroke: '#FFFFFF', strokeThickness: 3 });
    LEVELS.forEach((lvl, i) => {
      const x = 70 + i * 68, y = 636;
      const open = i <= d.unlocked;
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.2).fillRoundedRect(-27, -27 + 4, 54, 54, 14);
      g.fillStyle(open ? 0x43A047 : 0x90A4AE, 1).fillRoundedRect(-27, -27, 54, 54, 14);
      g.fillStyle(0xFFFFFF, 0.22).fillRoundedRect(-24, -24, 48, 20, 10);
      c.add(g);
      if (open) {
        c.add(addText(this, 0, -6, String(i + 1), 24, '#FFFFFF', { ox: 0.5, oy: 0.5 }));
        for (let s = 0; s < 3; s++) {
          c.add(this.add.image(-13 + s * 13, 16, s < (d.stars[i] || 0) ? 'ui-star-gold' : 'ui-star-grey').setDisplaySize(13, 13));
        }
        const hit = this.add.rectangle(0, 0, 54, 54, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        c.add(hit);
        hit.on('pointerdown', () => this.tweens.add({ targets: c, scale: 0.92, duration: 70 }));
        hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 90 }));
        hit.on('pointerup', () => { SFX.play('click'); startLevel(i, d.startTotals[i] || 0); });
      } else {
        c.add(this.add.image(0, 0, 'ui-lock-w').setDisplaySize(26, 26));
      }
    });

    // best score + footer
    const best = this.add.container(240, 704);
    best.add(this.add.image(-70, 0, 'ui-star-gold').setDisplaySize(22, 22));
    best.add(addText(this, -52, 0, `Best score: ${d.best}`, 17, '#1B5E20', { ox: 0, oy: 0.5, stroke: '#FFFFFF', strokeThickness: 3 }));

    addText(this, 240, 760, 'Sustainable Rush 2.0  -  a college project', 12, '#E8F5E9', { ox: 0.5, oy: 0.5, bold: false, stroke: '#2E7D32', strokeThickness: 3 });

    // sound toggle
    this.sound_ = makeButton(this, 436, 40, 48, 48, '', { icon: SFX.enabled ? 'soundOn' : 'soundOff', fill: 0x2E7D32,
      onClick: () => { const on = SFX.toggle(); this.sound_.iconImg.setTexture('ui-' + (on ? 'soundOn' : 'soundOff') + '-w'); } });
  }

  showHelp() {
    const layer = this.add.container(0, 0).setDepth(100);
    const blocker = this.add.rectangle(240, 400, GAME_W, GAME_H, 0x000000, 0.55).setInteractive();
    layer.add(blocker);
    const panel = drawPanel(this, 30, 70, 420, 660, { radius: 26, alpha: 1 });
    layer.add(panel);
    layer.add(addText(this, 240, 108, 'HOW TO PLAY', 30, '#1B5E20', { ox: 0.5, oy: 0.5 }));

    const steps = [
      'Tap two neighbouring tiles (or swipe) to swap them.',
      'Line up 3 or more matching eco tiles to clear them.',
      'Reach the Eco Goal before you run out of moves.',
      'Cascades and long lines give big bonus points!',
      'Stuck? Use HINT (the AI suggests the best swap) or SHUFFLE.'
    ];
    steps.forEach((s, i) => {
      const y = 160 + i * 52;
      layer.add(this.add.circle(62, y + 10, 14, 0x43A047));
      layer.add(addText(this, 62, y + 10, String(i + 1), 16, '#FFFFFF', { ox: 0.5, oy: 0.5 }));
      layer.add(addText(this, 88, y, s, 15, '#33411F', { bold: false, wrap: 340 }));
    });

    layer.add(addText(this, 240, 440, 'ECO TILES', 16, '#2E7D32', { ox: 0.5, oy: 0.5 }));
    TILE_DEFS.forEach((def, i) => {
      const y = 480 + i * 42;
      layer.add(this.add.image(66, y, 'tile-' + i).setDisplaySize(34, 34));
      layer.add(addText(this, 94, y, def.name, 16, '#1B5E20', { oy: 0.5 }));
      layer.add(addText(this, 440 - 30, y, def.gain + ' per tile', 13, '#546E7A', { ox: 1, oy: 0.5, bold: false }));
    });

    const close = makeButton(this, 240, 696, 200, 48, 'GOT IT', { icon: 'close', size: 17, fill: 0x2E7D32, onClick: () => layer.destroy() });
    layer.add(close);
    layer.setAlpha(0);
    this.tweens.add({ targets: layer, alpha: 1, duration: 180 });
  }
}
