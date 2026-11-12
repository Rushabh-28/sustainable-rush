/* ResultScene - level complete / out of moves / planet saved, shown over the paused board. */
class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  init(data) { this.d = data; }

  create() {
    const d = this.d;
    const lvl = LEVELS[d.levelIndex];
    const fmt = v => (Number.isInteger(v) ? String(v) : v.toFixed(1));

    this.add.rectangle(240, 400, GAME_W, GAME_H, 0x000000, 0.6).setInteractive();
    const panel = drawPanel(this, 30, 46, 420, 724, { radius: 28 });

    // ---- title
    let title, sub, tColor;
    if (d.win && d.final) { title = 'PLANET SAVED!'; sub = `All ${LEVELS.length} levels complete`; tColor = '#2E7D32'; }
    else if (d.win) { title = 'LEVEL COMPLETE!'; sub = lvl.name; tColor = '#2E7D32'; }
    else { title = 'OUT OF MOVES'; sub = `${lvl.name}: goal was ${lvl.goal}`; tColor = '#D84315'; }
    addText(this, 240, 86, title, 34, tColor, { ox: 0.5, oy: 0.5 });
    addText(this, 240, 120, sub, 16, '#546E7A', { ox: 0.5, oy: 0.5, bold: false });

    // ---- stars (win) or a smoggy earth (lose)
    if (d.win) {
      for (let i = 0; i < 3; i++) {
        const s = this.add.image(150 + i * 90, 178, 'ui-star-grey').setDisplaySize(62, 62);
        if (i < d.stars) {
          this.time.delayedCall(350 + i * 320, () => {
            s.setTexture('ui-star-gold');
            SFX.play('star', i);
            this.tweens.add({ targets: s, displayWidth: 84, displayHeight: 84, duration: 160, yoyo: true });
            burst(this, s.x, s.y, 0xFFC107, 6);
          });
        }
      }
    } else {
      const e = this.add.image(240, 176, 'earth').setDisplaySize(72, 72);
      this.add.circle(240, 176, 35, 0x6D4C41, 0.55);
      this.tweens.add({ targets: e, y: 182, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // ---- score block
    const lineY = 238;
    const row = (y, label, value, color = '#37474F', size = 18) => {
      addText(this, 62, y, label, size, color, { bold: false, oy: 0.5 });
      addText(this, 418, y, value, size, color, { ox: 1, oy: 0.5 });
    };
    row(lineY, 'Level score', String(d.score));
    if (d.win) row(lineY + 28, `Eco bonus (${d.movesLeft} moves left)`, '+' + d.bonus, '#2E7D32');
    row(lineY + 60, 'Total score', String(d.newTotal), '#1B5E20', 22);
    const newBest = d.newTotal >= Save.data.best && d.newTotal > 0;
    row(lineY + 90, newBest ? 'New best score!' : 'Best score', String(Save.data.best), newBest ? '#EF6C00' : '#78909C', 16);

    // ---- eco impact
    addText(this, 240, 366, d.final ? 'YOUR TOTAL ECO IMPACT' : 'YOUR ECO IMPACT', 16, '#2E7D32', { ox: 0.5, oy: 0.5 });
    const shown = d.final ? TILE_DEFS.length : lvl.types;   // only list tiles that appeared
    TILE_DEFS.slice(0, shown).forEach((def, i) => {
      const y = 396 + i * 31;
      this.add.image(70, y, 'tile-' + i).setDisplaySize(26, 26);
      addText(this, 96, y, def.unit, 15, '#455A64', { bold: false, oy: 0.5 });
      const v = (d.impact[i] || 0) * def.per;
      const t = addText(this, 418, y, '0', 17, '#1B5E20', { ox: 1, oy: 0.5 });
      this.tweens.addCounter({ from: 0, to: v, duration: 900, delay: 200 + i * 80, onUpdate: c => t.setText(fmt(Math.round(c.getValue() * 10) / 10)) });
    });

    // ---- fact
    drawPanel(this, 48, 556, 384, 70, { radius: 16, fill: 0xE8F5E9, alpha: 1, border: 0xA5D6A7 });
    this.add.image(72, 591, 'ui-leaf-green').setDisplaySize(26, 26);
    addText(this, 94, 591, Phaser.Utils.Array.GetRandom(ECO_FACTS), 13, '#1B5E20', { oy: 0.5, bold: false, wrap: 326 });

    // ---- buttons
    const restartLevel = () => this.go({ level: d.levelIndex, totalScore: d.baseTotal, run: cloneRun(d.runAtStart) });
    if (d.win && !d.final) {
      makeButton(this, 240, 662, 330, 58, 'NEXT LEVEL', { icon: 'next', size: 22, fill: 0x2E7D32,
        onClick: () => this.go({ level: d.levelIndex + 1, totalScore: d.newTotal, run: d.run }) });
      this.smallRow([
        ['RETRY', 'retry', 0xEF6C00, restartLevel],
        ['MENU', 'home', 0x6D4C41, () => this.toMenu()],
        ['DATA', 'download', 0x00897B, () => this.exportData()]
      ]);
    } else if (d.win && d.final) {
      makeButton(this, 240, 662, 330, 58, 'PLAY AGAIN', { icon: 'retry', size: 22, fill: 0x2E7D32,
        onClick: () => this.go({ level: 0, totalScore: 0, run: newRunStats() }) });
      this.smallRow([
        ['MENU', 'home', 0x6D4C41, () => this.toMenu()],
        ['DATA', 'download', 0x00897B, () => this.exportData()]
      ]);
    } else {
      makeButton(this, 240, 662, 330, 58, 'TRY AGAIN', { icon: 'retry', size: 22, fill: 0xEF6C00, onClick: restartLevel });
      this.smallRow([
        ['MENU', 'home', 0x6D4C41, () => this.toMenu()],
        ['DATA', 'download', 0x00897B, () => this.exportData()]
      ]);
    }

    this.toastText = addText(this, 240, 748, '', 14, '#2E7D32', { ox: 0.5, oy: 0.5 });
  }

  smallRow(items) {
    const n = items.length;
    const w = n === 3 ? 118 : 150;
    const gap = n === 3 ? 126 : 170;
    items.forEach(([label, icon, fill, fn], i) => {
      const x = 240 + (i - (n - 1) / 2) * gap;
      makeButton(this, x, 722, w, 44, label, { icon, size: 14, fill, onClick: fn });
    });
  }

  go(data) {
    this.scene.stop('Game');
    this.scene.start('Game', data);
  }

  toMenu() {
    this.scene.stop('Game');
    this.scene.start('Menu');
  }

  exportData() {
    const ok = DataLog.exportCSV();
    this.toastText.setText(ok ? `Saved ${DataLog.entries.length} moves to a CSV file` : 'No moves recorded yet');
  }
}
