// 共通サウンドユーティリティ
window.KokkoSound = (function () {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    // モバイル/Safari等では suspended で起動するので resume が必要
    if (ctx.state === 'suspended' && ctx.resume) {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }
  function beep(freq, dur, type) {
    const c = ensure(); if (!c) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, c.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur + 0.02);
    } catch (e) {}
  }

  // 最初のユーザー操作で必ず初期化＆resume（モバイル必須）
  function unlock() {
    ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    // 無音再生でアンロックを確実に
    try {
      const c = ctx;
      if (c) {
        const o = c.createOscillator();
        const g = c.createGain();
        g.gain.value = 0;
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + 0.001);
      }
    } catch (e) {}
  }
  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(ev => {
    document.addEventListener(ev, unlock, { once: false, passive: true });
  });

  return {
    init: ensure,
    unlock: unlock,
    correct: () => { beep(660, 0.12, 'triangle'); setTimeout(() => beep(880, 0.15, 'triangle'), 80); },
    wrong:   () => beep(180, 0.2, 'sawtooth'),
    clear:   () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle'), i * 120)),
    over:    () => [400, 320, 240, 160].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'square'), i * 150)),
    jump:    () => beep(520, 0.08, 'square'),
    pop:     () => beep(900, 0.06, 'triangle'),
    pickup:  () => { beep(800, 0.06, 'sine'); setTimeout(() => beep(1100, 0.08, 'sine'), 50); },
    note:    (n) => beep([262, 294, 330, 349, 392, 440, 494, 523][n % 8], 0.35, 'triangle'),
  };
})();
