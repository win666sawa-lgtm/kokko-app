// 共通サウンドユーティリティ
window.KokkoSound = (function () {
  let ctx = null;
  function ensure() { if (!ctx) try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} return ctx; }
  function beep(freq, dur, type) {
    const c = ensure(); if (!c) return;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq; g.gain.value = 0.15;
    o.connect(g); g.connect(c.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.stop(c.currentTime + dur);
  }
  return {
    init: ensure,
    correct: () => { beep(660, 0.12, 'triangle'); setTimeout(() => beep(880, 0.15, 'triangle'), 80); },
    wrong:   () => beep(180, 0.2, 'sawtooth'),
    clear:   () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle'), i * 120)),
    over:    () => [400, 320, 240, 160].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'square'), i * 150)),
    jump:    () => beep(520, 0.08, 'square'),
    pop:     () => beep(900, 0.06, 'triangle'),
    pickup:  () => { beep(800, 0.06, 'sine'); setTimeout(() => beep(1100, 0.08, 'sine'), 50); },
    note:    (n) => beep([262, 294, 330, 349, 392, 440, 494, 523][n % 8], 0.25, 'triangle'),
  };
})();
