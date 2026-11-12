/* ==========================================================================
   GameScene - the match-3 board
   Flow of one turn:
     player swaps two tiles -> if no match, swap back (free)
                            -> else spend a move, then repeat
                               { find runs -> clear -> gravity -> refill }
                               until the board settles (cascades / combos)
                            -> check win / lose / "no moves left"
   The board is kept as a 2D array of sprites. Pure-logic helpers that work on
   plain number matrices (runsOn, bestMoveOn) are used for hints and shuffling.
   ========================================================================== */

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this.levelIndex = data.level || 0;
    this.baseTotal = data.totalScore || 0;
    this.run = data.run || newRunStats();
    this.runAtStart = cloneRun(this.run);   // used by Retry so a replayed level is not counted twice
  }

  /* ------------------------------------------------------------------ setup */
  create() {
    this.lvl = LEVELS[this.levelIndex];
    this.theme = THEMES[this.lvl.theme];

    this.score = 0;
    this.shownScore = 0;
    this.movesLeft = this.lvl.moves;
    this.hintsLeft = START_HINTS;
    this.shufflesLeft = START_SHUFFLES;
    this.levelImpact = TILE_DEFS.map(() => 0);
    this.levelHints = 0;
    this.levelMoves = 0;
    this.levelCleared = 0;
    this.attempts = 0;

    this.busy = true;       // unlocked after the intro banner
    this.ended = false;
    this.selected = null;
    this.dragTile = null;
    this.dragStart = null;
    this.hintSprites = [];
    this.hintFlag = false;
    this.lastInputType = 'tap';
    this.board = [];
    this.turnStart = performance.now();

    if (window.__SR_SPEED) { this.tweens.timeScale = window.__SR_SPEED; this.time.timeScale = window.__SR_SPEED; }

    buildBackdrop(this, this.lvl.theme);
    this.buildHUD();
    this.buildBoardFrame();
    this.buildBoard();
    this.buildBottomBar();
    this.buildFactTicker();
    this.bindInput();
    this.renderHUD();
    this.showIntro();
  }

  /* ------------------------------------------------------------ HUD / chrome */
  buildHUD() {
    const th = this.theme;
    this.earth = this.add.image(54, 62, 'earth').setDisplaySize(66, 66).setDepth(5);
    this.smog = this.add.circle(54, 62, 32, 0x6D4C41, 0.6).setDepth(6);
    this.tweens.add({ targets: [this.earth, this.smog], y: 66, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    addText(this, 100, 20, 'LEVEL ' + (this.levelIndex + 1), 14, th.sub);
    addText(this, 100, 36, this.lvl.name, 22, th.text);
    this.scoreText = addText(this, 100, 66, '0', 32, th.text, { ox: 0, oy: 0 });

    // moves box
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x000000, 0.15).fillRoundedRect(350, 26, 106, 76, 18);
    g.fillStyle(0xFFFFFF, 0.82).fillRoundedRect(350, 22, 106, 76, 18);
    g.lineStyle(3, 0x81C784, 1).strokeRoundedRect(350, 22, 106, 76, 18);
    addText(this, 403, 37, 'MOVES', 13, '#2E7D32', { ox: 0.5, oy: 0.5 }).setDepth(5);
    this.movesText = addText(this, 403, 68, String(this.movesLeft), 36, '#1B5E20', { ox: 0.5, oy: 0.5 }).setDepth(5);

    // progress bar
    this.barG = this.add.graphics().setDepth(5);
    this.goalText = addText(this, 240, 121, '', 13, '#FFFFFF', { ox: 0.5, oy: 0.5, stroke: '#2E7D32', strokeThickness: 3 }).setDepth(7);
    this.starMarks = this.add.graphics().setDepth(6);

    this.toastText = null;
  }

  renderHUD() {
    const goal = this.lvl.goal;
    const p = Phaser.Math.Clamp(this.shownScore / goal, 0, 1);
    const x = 24, y = 109, w = 432, h = 24;

    this.scoreText.setText(String(Math.round(this.shownScore)));
    this.smog.setAlpha(0.62 * (1 - p));

    const g = this.barG;
    g.clear();
    g.fillStyle(0x000000, 0.25).fillRoundedRect(x, y + 3, w, h, 12);
    g.fillStyle(0xFFFFFF, 0.5).fillRoundedRect(x, y, w, h, 12);
    if (p > 0) {
      // orange -> yellow -> green as the planet gets healthier
      const C = Phaser.Display.Color;
      const c = p < 0.5
        ? C.Interpolate.ColorWithColor(new C(255, 138, 0), new C(255, 214, 64), 100, Math.round(p * 200))
        : C.Interpolate.ColorWithColor(new C(255, 214, 64), new C(76, 175, 80), 100, Math.round((p - 0.5) * 200));
      const col = Phaser.Display.Color.GetColor(c.r, c.g, c.b);
      const fw = Math.max(h, w * p);
      g.fillStyle(col, 1).fillRoundedRect(x, y, fw, h, 12);
      g.fillStyle(0xFFFFFF, 0.28).fillRoundedRect(x + 4, y + 3, Math.max(8, fw - 8), 7, 4);
    }
    g.lineStyle(2, 0xFFFFFF, 0.9).strokeRoundedRect(x, y, w, h, 12);
    this.goalText.setText(`ECO GOAL  ${Math.min(Math.round(this.shownScore), goal)} / ${goal}`);

    this.movesText.setText(String(this.movesLeft));
    this.movesText.setColor(this.movesLeft <= 5 ? '#D32F2F' : '#1B5E20');
  }

  tweenScore() {
    if (this.scoreTween) this.scoreTween.stop();
    this.scoreTween = this.tweens.addCounter({
      from: this.shownScore, to: this.score, duration: 550, ease: 'Cubic.easeOut',
      onUpdate: t => { this.shownScore = t.getValue(); this.renderHUD(); },
      onComplete: () => { this.shownScore = this.score; this.renderHUD(); }
    });
    this.tweens.add({ targets: this.scoreText, scale: 1.18, duration: 110, yoyo: true });
  }

  toast(msg, color = '#FFFFFF') {
    if (this.toastText) { this.toastText.destroy(); this.toastText = null; }
    const t = addText(this, 240, 160, msg, 22, color, { ox: 0.5, oy: 0.5, stroke: '#1B5E20', strokeThickness: 5 }).setDepth(70).setAlpha(0);
    this.toastText = t;
    this.tweens.add({ targets: t, alpha: 1, y: 156, duration: 160 });
    this.tweens.add({ targets: t, alpha: 0, delay: 1200, duration: 300, onComplete: () => { t.destroy(); if (this.toastText === t) this.toastText = null; } });
  }

  buildBoardFrame() {
    const bw = GRID * TILE;
    const g = this.add.graphics().setDepth(-10);
    g.fillStyle(0x000000, 0.18).fillRoundedRect(BOARD_X - 8, BOARD_Y - 8 + 5, bw + 16, bw + 16, 22);
    g.fillStyle(0xFFFFFF, 0.55).fillRoundedRect(BOARD_X - 8, BOARD_Y - 8, bw + 16, bw + 16, 22);
    g.lineStyle(3, 0xFFFFFF, 0.9).strokeRoundedRect(BOARD_X - 8, BOARD_Y - 8, bw + 16, bw + 16, 22);
    for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
      if ((r + c) % 2 === 0) g.fillStyle(0x2E7D32, 0.1).fillRoundedRect(BOARD_X + c * TILE + 1, BOARD_Y + r * TILE + 1, TILE - 2, TILE - 2, 10);
    }
    const m = this.make.graphics({ x: 0, y: 0, add: false });
    m.fillStyle(0xffffff).fillRect(BOARD_X - 6, BOARD_Y, bw + 12, bw + 6);
    this.boardMask = m.createGeometryMask();

    this.ring = this.add.graphics().setDepth(20).setVisible(false);
    this.ring.lineStyle(5, 0x1B5E20, 0.55).strokeRoundedRect(-28, -28, 56, 56, 15);
    this.ring.lineStyle(3, 0xFFFFFF, 1).strokeRoundedRect(-27, -27, 54, 54, 14);
  }

  buildBottomBar() {
    const y = 726;
    const cap = this.theme.text === '#FFFFFF' ? '#FFFFFF' : '#1B5E20';
    this.btnHint = makeIconButton(this, 48, y, 'hint', 'HINT', { fill: 0xF9A825, badge: this.hintsLeft, captionColor: cap, onClick: () => this.showHint(true) });
    this.btnShuffle = makeIconButton(this, 144, y, 'shuffle', 'SHUFFLE', { fill: 0x1E88E5, badge: this.shufflesLeft, captionColor: cap, onClick: () => this.userShuffle() });
    this.btnSound = makeIconButton(this, 240, y, SFX.enabled ? 'soundOn' : 'soundOff', 'SOUND', { fill: 0x2E7D32, captionColor: cap, onClick: () => { const on = SFX.toggle(); this.btnSound.setIcon(on ? 'soundOn' : 'soundOff'); } });
    this.btnData = makeIconButton(this, 336, y, 'download', 'DATA CSV', { fill: 0x00897B, captionColor: cap, onClick: () => this.exportData() });
    this.btnMenu = makeIconButton(this, 432, y, 'home', 'MENU', { fill: 0x6D4C41, captionColor: cap, onClick: () => { this.scene.start('Menu'); } });
  }

  buildFactTicker() {
    drawPanel(this, 24, 642, 432, 44, { radius: 14, alpha: 0.88, border: 0xA5D6A7 }).setDepth(3);
    this.add.image(46, 664, 'ui-leaf-green').setDisplaySize(24, 24).setDepth(4);
    this.factText = addText(this, 66, 664, '', 12, '#1B5E20', { ox: 0, oy: 0.5, bold: false, wrap: 382 }).setDepth(4);
    this.factIndex = Phaser.Math.Between(0, ECO_FACTS.length - 1);
    this.showFact();
    this.time.addEvent({ delay: 11000, loop: true, callback: () => {
      this.tweens.add({ targets: this.factText, alpha: 0, duration: 250, onComplete: () => {
        this.factIndex = (this.factIndex + 1) % ECO_FACTS.length;
        this.showFact();
        this.tweens.add({ targets: this.factText, alpha: 1, duration: 250 });
      } });
    } });
  }

  showFact() { this.factText.setText('Did you know? ' + ECO_FACTS[this.factIndex]); }

  showIntro() {
    const c = this.add.container(240, 400).setDepth(90).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.28).fillRoundedRect(-190, -62 + 6, 380, 132, 26);
    g.fillStyle(0x1B5E20, 0.94).fillRoundedRect(-190, -62, 380, 132, 26);
    g.lineStyle(3, 0xA5D6A7, 1).strokeRoundedRect(-190, -62, 380, 132, 26);
    c.add(g);
    c.add(addText(this, 0, -34, 'LEVEL ' + (this.levelIndex + 1), 16, '#A5D6A7', { ox: 0.5, oy: 0.5 }));
    c.add(addText(this, 0, -8, this.lvl.name, 30, '#FFFFFF', { ox: 0.5, oy: 0.5 }));
    c.add(addText(this, 0, 32, `Earn ${this.lvl.goal} points in ${this.lvl.moves} moves`, 16, '#E8F5E9', { ox: 0.5, oy: 0.5, bold: false }));
    this.tweens.add({ targets: c, alpha: 1, scale: { from: 0.8, to: 1 }, duration: 260, ease: 'Back.easeOut' });
    this.tweens.add({ targets: c, alpha: 0, y: 380, delay: 1500, duration: 350, onComplete: () => c.destroy() });
    this.time.delayedCall(700, () => { this.busy = false; this.resetTurnTimer(); this.startIdleTimer(); });
  }

  /* ------------------------------------------------------------------ board */
  cellX(c) { return BOARD_X + c * TILE + TILE / 2; }
  cellY(r) { return BOARD_Y + r * TILE + TILE / 2; }

  buildBoard() {
    const kinds = this.generateKinds();
    for (let r = 0; r < GRID; r++) {
      this.board[r] = [];
      for (let c = 0; c < GRID; c++) {
        const s = this.makeTile(r, c, kinds[r][c], this.cellX(c), this.cellY(r) - 500 - r * 30);
        this.board[r][c] = s;
        s.setAlpha(0);
        this.tweens.add({ targets: s, y: this.cellY(r), alpha: 1, duration: 520 + c * 35, delay: (GRID - r) * 25, ease: 'Bounce.easeOut' });
      }
    }
  }

  makeTile(r, c, kind, x, y) {
    const s = this.add.image(x, y, 'tile-' + kind).setDepth(10);
    s.baseScale = (TILE - 2) / 128;
    s.setScale(s.baseScale);
    s.kind = kind; s.r = r; s.c = c;
    s.setMask(this.boardMask);
    s.setInteractive();
    s.on('pointerdown', p => this.onTileDown(s, p));
    return s;
  }

  randomKind() { return Phaser.Math.Between(0, this.lvl.types - 1); }

  /* A fresh matrix of tile kinds with no ready-made matches and at least one move. */
  generateKinds() {
    let m;
    for (let attempt = 0; attempt < 200; attempt++) {
      m = [];
      for (let r = 0; r < GRID; r++) {
        m[r] = [];
        for (let c = 0; c < GRID; c++) {
          let k, guard = 0;
          do {
            k = this.randomKind();
            guard++;
          } while (guard < 40 && (
            (c >= 2 && m[r][c - 1] === k && m[r][c - 2] === k) ||
            (r >= 2 && m[r - 1][c] === k && m[r - 2][c] === k)));
          m[r][c] = k;
        }
      }
      if (this.bestMoveOn(m)) return m;
    }
    return m;
  }

  kindMatrix() { return this.board.map(row => row.map(s => (s ? s.kind : -1))); }

  /* All horizontal / vertical runs of 3+ in a number matrix. */
  runsOn(m) {
    const runs = [];
    for (let r = 0; r < GRID; r++) {
      let start = 0;
      for (let c = 1; c <= GRID; c++) {
        if (c < GRID && m[r][c] === m[r][start] && m[r][c] >= 0) continue;
        if (c - start >= 3 && m[r][start] >= 0) {
          const cells = []; for (let k = start; k < c; k++) cells.push([r, k]);
          runs.push({ cells });
        }
        start = c;
      }
    }
    for (let c = 0; c < GRID; c++) {
      let start = 0;
      for (let r = 1; r <= GRID; r++) {
        if (r < GRID && m[r][c] === m[start][c] && m[r][c] >= 0) continue;
        if (r - start >= 3 && m[start][c] >= 0) {
          const cells = []; for (let k = start; k < r; k++) cells.push([k, c]);
          runs.push({ cells });
        }
        start = r;
      }
    }
    return runs;
  }

  /* Best swap on a matrix = the one that clears the most tiles ("AI hint"). */
  bestMoveOn(m) {
    let best = null;
    const trySwap = (r1, c1, r2, c2) => {
      [m[r1][c1], m[r2][c2]] = [m[r2][c2], m[r1][c1]];
      const runs = this.runsOn(m);
      [m[r1][c1], m[r2][c2]] = [m[r2][c2], m[r1][c1]];
      if (!runs.length) return;
      const set = new Set();
      runs.forEach(run => run.cells.forEach(([r, c]) => set.add(r * GRID + c)));
      if (!best || set.size > best.count) best = { a: [r1, c1], b: [r2, c2], count: set.size };
    };
    for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
      if (c + 1 < GRID) trySwap(r, c, r, c + 1);
      if (r + 1 < GRID) trySwap(r, c, r + 1, c);
    }
    return best;
  }

  /* ------------------------------------------------------------------ input */
  bindInput() {
    this.input.on('pointermove', p => {
      if (!this.dragTile || !p.isDown || this.busy || this.ended) return;
      const dx = p.x - this.dragStart.x, dy = p.y - this.dragStart.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < TILE * 0.38) return;
      const t = this.dragTile;
      this.dragTile = null;
      let r = t.r, c = t.c;
      if (Math.abs(dx) > Math.abs(dy)) c += dx > 0 ? 1 : -1; else r += dy > 0 ? 1 : -1;
      const other = this.board[r] && this.board[r][c];
      if (other) { this.lastInputType = 'swipe'; this.clearSelection(); this.attemptSwap(t, other); }
    });
    this.input.on('pointerup', () => { this.dragTile = null; });

    this.input.keyboard.on('keydown-H', () => this.showHint(true));
    this.input.keyboard.on('keydown-S', () => this.userShuffle());
    this.input.keyboard.on('keydown-M', () => { const on = SFX.toggle(); this.btnSound.setIcon(on ? 'soundOn' : 'soundOff'); });
  }

  onTileDown(tile, pointer) {
    if (this.busy || this.ended) return;
    SFX.unlock();
    this.clearHint();
    this.startIdleTimer();
    if (this.selected && this.selected !== tile && this.areAdjacent(this.selected, tile)) {
      const a = this.selected;
      this.clearSelection();
      this.lastInputType = 'tap';
      this.attemptSwap(a, tile);
      return;
    }
    if (this.selected === tile) { this.clearSelection(); return; }
    this.clearSelection();
    this.select(tile);
    this.dragTile = tile;
    this.dragStart = { x: pointer.x, y: pointer.y };
  }

  areAdjacent(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1; }

  select(tile) {
    SFX.play('select');
    this.selected = tile;
    this.ring.setPosition(tile.x, tile.y).setVisible(true).setAlpha(1);
    this.selTween = this.tweens.add({ targets: tile, scale: tile.baseScale * 1.1, duration: 280, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.ringTween = this.tweens.add({ targets: this.ring, alpha: 0.45, duration: 280, yoyo: true, repeat: -1 });
  }

  clearSelection() {
    if (this.selTween) { this.selTween.stop(); this.selTween = null; }
    if (this.ringTween) { this.ringTween.stop(); this.ringTween = null; }
    if (this.selected && this.selected.active) this.selected.setScale(this.selected.baseScale);
    this.ring.setVisible(false);
    this.selected = null;
  }

  /* ------------------------------------------------------------ turn engine */
  tw(cfg) {
    return new Promise(resolve => {
      const targets = Array.isArray(cfg.targets) ? cfg.targets : [cfg.targets];
      if (!targets.length) { resolve(); return; }
      this.tweens.add(Object.assign({}, cfg, { onComplete: (...args) => { if (cfg.onComplete) cfg.onComplete(...args); resolve(); } }));
    });
  }

  delay(ms) { return new Promise(resolve => this.time.delayedCall(ms, resolve)); }

  resetTurnTimer() { this.turnStart = performance.now(); }

  swapSprites(a, b) {
    const ar = a.r, ac = a.c;
    a.r = b.r; a.c = b.c; b.r = ar; b.c = ac;
    this.board[a.r][a.c] = a;
    this.board[b.r][b.c] = b;
    return Promise.all([
      this.tw({ targets: a, x: this.cellX(a.c), y: this.cellY(a.r), duration: 150, ease: 'Quad.easeInOut' }),
      this.tw({ targets: b, x: this.cellX(b.c), y: this.cellY(b.r), duration: 150, ease: 'Quad.easeInOut' })
    ]);
  }

  async attemptSwap(a, b) {
    if (this.busy || this.ended || !a || !b || !this.areAdjacent(a, b)) return;
    this.busy = true;
    this.stopIdleTimer();
    this.clearHint();
    this.clearSelection();

    const thinkMs = Math.round(performance.now() - this.turnStart);
    const posA = `${a.r},${a.c}`, posB = `${b.r},${b.c}`;
    const kindA = TILE_DEFS[a.kind].key, kindB = TILE_DEFS[b.kind].key;
    this.attempts++;

    SFX.play('swap');
    await this.swapSprites(a, b);

    if (!this.runsOn(this.kindMatrix()).length) {
      // not a match: bounce back, costs nothing
      SFX.play('bad');
      this.tweens.add({ targets: [a, b], angle: { from: -6, to: 6 }, duration: 55, yoyo: true, repeat: 1, onComplete: () => { a.angle = 0; b.angle = 0; } });
      await this.swapSprites(a, b);
      DataLog.add({ level: this.levelIndex + 1, attempt: this.attempts, input: this.lastInputType, tile_a: posA, tile_b: posB,
        kind_a: kindA, kind_b: kindB, valid: 0, tiles_cleared: 0, longest_chain: 0, points: 0,
        score_after: this.score, moves_left: this.movesLeft, hint_used: this.hintFlag ? 1 : 0, think_ms: thinkMs });
      this.busy = false;
      this.resetTurnTimer();
      this.startIdleTimer();
      return;
    }

    this.movesLeft--;
    this.levelMoves++;
    this.renderHUD();
    this.tweens.add({ targets: this.movesText, scale: 1.3, duration: 110, yoyo: true });

    let chain = 0, cleared = 0, gained = 0;
    for (;;) {
      const runs = this.runsOn(this.kindMatrix());
      if (!runs.length) break;
      chain++;
      const res = await this.clearRuns(runs, chain);
      cleared += res.count;
      gained += res.points;
      await this.collapseAndRefill();
    }

    DataLog.add({ level: this.levelIndex + 1, attempt: this.attempts, input: this.lastInputType, tile_a: posA, tile_b: posB,
      kind_a: kindA, kind_b: kindB, valid: 1, tiles_cleared: cleared, longest_chain: chain, points: gained,
      score_after: this.score, moves_left: this.movesLeft, hint_used: this.hintFlag ? 1 : 0, think_ms: thinkMs });
    this.hintFlag = false;

    await this.afterTurn();
    if (!this.ended) {
      this.busy = false;
      this.resetTurnTimer();
      this.startIdleTimer();
    }
  }

  async clearRuns(runs, chain) {
    const sprites = new Set();
    let base = 0, longest = 0;
    runs.forEach(run => {
      const n = run.cells.length;
      longest = Math.max(longest, n);
      base += n * SCORING.perTile + Math.max(0, n - 3) * SCORING.longRunBonus;
      run.cells.forEach(([r, c]) => sprites.add(this.board[r][c]));
    });
    const mult = 1 + (chain - 1) * SCORING.chainStep;
    const points = Math.round(base * mult);
    const list = [...sprites];

    let cx = 0, cy = 0;
    list.forEach(s => { cx += s.x; cy += s.y; this.levelImpact[s.kind]++; });
    cx /= list.length; cy /= list.length;
    this.levelCleared += list.length;

    this.score += points;
    this.tweenScore();
    SFX.play('match', chain - 1);

    floatText(this, cx, cy, '+' + points, '#FFFFFF', 26 + Math.min(chain, 4) * 3);
    if (chain >= 2) this.toast(`COMBO x${chain}!`, '#FFEB3B');
    else if (longest >= 5) this.toast('AMAZING!', '#FFEB3B');
    else if (longest === 4) this.toast('NICE! 4 in a row', '#FFEB3B');
    if (chain >= 3) this.cameras.main.shake(140, 0.004);

    list.forEach(s => {
      this.board[s.r][s.c] = null;
      burst(this, s.x, s.y, TILE_DEFS[s.kind].color, 4);
      s.disableInteractive();
    });
    await this.tw({
      targets: list, scale: 0, alpha: 0, angle: { from: 0, to: 90 }, duration: 260, ease: 'Back.easeIn',
      onComplete: () => list.forEach(s => s.destroy())
    });
    return { count: list.length, points };
  }

  async collapseAndRefill() {
    const jobs = [];
    for (let c = 0; c < GRID; c++) {
      let write = GRID - 1;
      for (let r = GRID - 1; r >= 0; r--) {
        const s = this.board[r][c];
        if (!s) continue;
        if (r !== write) {
          this.board[write][c] = s;
          this.board[r][c] = null;
          s.r = write;
          jobs.push(this.dropTween(s, write, write - r));
        }
        write--;
      }
      const missing = write + 1;
      for (let r = 0; r <= write; r++) {
        const s = this.makeTile(r, c, this.randomKind(), this.cellX(c), this.cellY(r - missing));
        this.board[r][c] = s;
        jobs.push(this.dropTween(s, r, missing));
      }
    }
    await Promise.all(jobs);
  }

  dropTween(sprite, row, dist) {
    return this.tw({ targets: sprite, y: this.cellY(row), duration: 200 + dist * 45, ease: 'Bounce.easeOut' });
  }

  async afterTurn() {
    if (this.score >= this.lvl.goal) { await this.winLevel(); return; }
    if (this.movesLeft <= 0) { await this.loseLevel(); return; }
    if (!this.bestMoveOn(this.kindMatrix())) {
      this.toast('No moves left - shuffling!', '#FFFFFF');
      await this.delay(700);
      await this.shuffleBoard();
    }
  }

  /* ----------------------------------------------------------- win / lose */
  async winLevel() {
    this.ended = true;
    this.stopIdleTimer();
    const frac = this.movesLeft / this.lvl.moves;
    const stars = frac >= 0.35 ? 3 : frac >= 0.15 ? 2 : 1;
    const bonus = this.movesLeft * SCORING.leftoverMoveBonus;
    const newTotal = this.baseTotal + this.score + bonus;

    this.levelImpact.forEach((v, i) => { this.run.impact[i] += v; });
    this.run.cleared += this.levelCleared;
    this.run.moves += this.levelMoves;
    this.run.hints += this.levelHints;
    Save.completeLevel(this.levelIndex, stars, newTotal);

    SFX.play('win');
    this.toast('ECO GOAL REACHED!', '#FFEB3B');
    for (let i = 0; i < 26; i++) {
      this.time.delayedCall(i * 35, () => burst(this, Phaser.Math.Between(40, 440), Phaser.Math.Between(220, 560),
        Phaser.Utils.Array.GetRandom(TILE_DEFS).color, 3));
    }
    await this.delay(1500);

    const final = this.levelIndex >= LEVELS.length - 1;
    this.scene.pause();
    this.scene.launch('Result', {
      win: true, final, levelIndex: this.levelIndex, score: this.score, bonus, stars,
      movesLeft: this.movesLeft, baseTotal: this.baseTotal, newTotal,
      impact: final ? this.run.impact : this.levelImpact, run: this.run, runAtStart: this.runAtStart
    });
  }

  async loseLevel() {
    this.ended = true;
    this.stopIdleTimer();
    Save.recordScore(this.baseTotal + this.score);
    SFX.play('lose');
    this.toast('OUT OF MOVES', '#FFCDD2');
    await this.delay(1200);
    this.scene.pause();
    this.scene.launch('Result', {
      win: false, final: false, levelIndex: this.levelIndex, score: this.score, bonus: 0, stars: 0,
      movesLeft: 0, baseTotal: this.baseTotal, newTotal: this.baseTotal + this.score,
      impact: this.levelImpact, run: this.run, runAtStart: this.runAtStart
    });
  }

  /* ------------------------------------------------------ hint / shuffle */
  showHint(byPlayer) {
    if (this.busy || this.ended) return;
    if (byPlayer) {
      if (this.hintsLeft <= 0) { this.toast('No hints left!', '#FFCDD2'); return; }
    }
    const mv = this.bestMoveOn(this.kindMatrix());
    if (!mv) return;
    if (byPlayer) {
      this.hintsLeft--;
      this.levelHints++;
      this.hintFlag = true;
      this.btnHint.setBadge(this.hintsLeft);
    }
    this.clearHint();
    SFX.play('hint');
    const a = this.board[mv.a[0]][mv.a[1]], b = this.board[mv.b[0]][mv.b[1]];
    this.hintSprites = [a, b];
    this.hintTween = this.tweens.add({ targets: [a, b], scale: a.baseScale * 1.2, duration: 260, yoyo: true, repeat: 5, ease: 'Sine.easeInOut',
      onComplete: () => this.clearHint() });
    a.setDepth(15); b.setDepth(15);
  }

  clearHint() {
    if (this.hintTween) { this.hintTween.stop(); this.hintTween = null; }
    this.hintSprites.forEach(s => { if (s && s.active) { s.setScale(s.baseScale); s.setDepth(10); } });
    this.hintSprites = [];
  }

  startIdleTimer() {
    this.stopIdleTimer();
    this.idleEvent = this.time.delayedCall(IDLE_HINT_MS, () => { if (!this.busy && !this.ended) this.showHint(false); });
  }

  stopIdleTimer() { if (this.idleEvent) { this.idleEvent.remove(false); this.idleEvent = null; } }

  async userShuffle() {
    if (this.busy || this.ended) return;
    if (this.shufflesLeft <= 0) { this.toast('No shuffles left!', '#FFCDD2'); return; }
    this.busy = true;
    this.stopIdleTimer();
    this.clearSelection();
    this.clearHint();
    this.shufflesLeft--;
    this.run.shuffles++;
    this.btnShuffle.setBadge(this.shufflesLeft);
    await this.shuffleBoard();
    this.busy = false;
    this.resetTurnTimer();
    this.startIdleTimer();
  }

  /* Re-deals the existing tiles so the board has no matches but still has a move. */
  async shuffleBoard() {
    SFX.play('shuffle');
    const sprites = [];
    this.board.forEach(row => row.forEach(s => sprites.push(s)));
    const kinds = sprites.map(s => s.kind);

    let chosen = null;
    for (let i = 0; i < 120 && !chosen; i++) {
      const pool = Phaser.Utils.Array.Shuffle(kinds.slice());
      const m = [];
      for (let r = 0; r < GRID; r++) m[r] = pool.slice(r * GRID, r * GRID + GRID);
      if (!this.runsOn(m).length && this.bestMoveOn(m)) chosen = m;
    }
    if (!chosen) chosen = this.generateKinds();

    await this.tw({ targets: sprites, scale: 0, angle: 180, duration: 220, ease: 'Back.easeIn' });
    sprites.forEach(s => {
      s.kind = chosen[s.r][s.c];
      s.setTexture('tile-' + s.kind);
      s.angle = 0;
    });
    await this.tw({ targets: sprites, scale: (TILE - 2) / 128, duration: 280, ease: 'Back.easeOut' });
  }

  exportData() {
    if (DataLog.exportCSV()) this.toast(`Saved ${DataLog.entries.length} moves to CSV`, '#C8E6C9');
    else this.toast('Make a few moves first!', '#FFCDD2');
  }
}
