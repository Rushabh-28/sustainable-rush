/* ==========================================================================
   Sustainable Rush - saved progress + gameplay data log
   Save    : best score, unlocked levels, stars, sound setting (localStorage)
   DataLog : one row per swap attempt, exportable as CSV for analysis
   ========================================================================== */

const Save = {
  KEY: 'sustainableRush.v2',
  data: {
    best: 0,
    unlocked: 0,                       // index of the highest unlocked level
    stars: [0, 0, 0, 0, 0, 0],         // best star rating per level
    startTotals: [0, 0, 0, 0, 0, 0, 0],// running total score when each level starts
    sound: true
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        this.data = Object.assign(this.data, saved);
      }
    } catch (e) { /* private mode / blocked storage: just play without saving */ }
    SFX.enabled = this.data.sound !== false;
  },

  write() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  },

  completeLevel(index, stars, newTotal) {
    const d = this.data;
    d.stars[index] = Math.max(d.stars[index] || 0, stars);
    d.startTotals[index + 1] = newTotal;
    d.unlocked = Math.max(d.unlocked, Math.min(index + 1, LEVELS.length - 1));
    d.best = Math.max(d.best, newTotal);
    this.write();
  },

  recordScore(total) {
    if (total > this.data.best) { this.data.best = total; this.write(); }
  },

  reset() {
    this.data = { best: 0, unlocked: 0, stars: [0, 0, 0, 0, 0, 0], startTotals: [0, 0, 0, 0, 0, 0, 0], sound: SFX.enabled };
    this.write();
  }
};

const DataLog = {
  entries: [],
  session: Date.now().toString(36),

  add(entry) {
    this.entries.push(Object.assign({ move_id: this.entries.length + 1 }, entry, {
      timestamp: new Date().toISOString()
    }));
  },

  clear() { this.entries = []; },

  toCSV() {
    if (!this.entries.length) return '';
    const headers = Object.keys(this.entries[0]);
    const esc = v => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return [headers.join(',')]
      .concat(this.entries.map(e => headers.map(h => esc(e[h])).join(',')))
      .join('\n');
  },

  /* Returns true if a file was produced. */
  exportCSV() {
    const csv = this.toCSV();
    if (!csv) return false;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainable_rush_player_data_${this.session}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  }
};

function cloneRun(r) {
  return { impact: r.impact.slice(), cleared: r.cleared, moves: r.moves, hints: r.hints, shuffles: r.shuffles };
}

/* Fresh totals for one play-through (carried from level to level). */
function newRunStats() {
  return { impact: TILE_DEFS.map(() => 0), cleared: 0, moves: 0, hints: 0, shuffles: 0 };
}
