/* ==========================================================================
   Sustainable Rush - sound effects
   All sounds are synthesised with the Web Audio API (no audio files).
   Browsers only allow audio after a user gesture, so call SFX.unlock()
   from a click/tap handler.
   ========================================================================== */

const SFX = {
  ctx: null,
  enabled: true,

  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* audio is optional */ }
  },

  tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    } catch (e) { /* ignore */ }
  },

  play(name, n = 0) {
    switch (name) {
      case 'click':   this.tone(660, 0.07, 'triangle', 0.1); break;
      case 'select':  this.tone(520, 0.08, 'sine', 0.1); break;
      case 'swap':    this.tone(300, 0.1, 'sine', 0.09, 460); break;
      case 'bad':     this.tone(190, 0.18, 'sawtooth', 0.07, 110); break;
      case 'match': { // pitch rises with every cascade step
        const f = 392 * Math.pow(2, Math.min(n, 8) * 2 / 12);
        this.tone(f, 0.16, 'triangle', 0.14);
        this.tone(f * 1.5, 0.2, 'sine', 0.07, null, 0.05);
        break;
      }
      case 'hint':    this.tone(880, 0.16, 'sine', 0.1); this.tone(1175, 0.2, 'sine', 0.08, null, 0.1); break;
      case 'shuffle': this.tone(260, 0.3, 'triangle', 0.09, 700); break;
      case 'win':     [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.13, null, i * 0.11)); break;
      case 'lose':    [392, 349, 311, 262].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.12, null, i * 0.16)); break;
      case 'star':    this.tone(900 + n * 200, 0.2, 'sine', 0.12); break;
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    Save.data.sound = this.enabled;
    Save.write();
    if (this.enabled) { this.unlock(); this.play('click'); }
    return this.enabled;
  }
};
