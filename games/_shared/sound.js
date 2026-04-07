// 共通サウンドユーティリティ
window.KokkoSound = (function () {
  let ctx = null;
  let unlocked = false;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    return ctx;
  }

  function beep(freq, dur, type) {
    const c = ensure(); if (!c) return;
    // 毎回 resume を試みる（safety net）
    if (c.state === 'suspended' && c.resume) {
      c.resume().catch(() => {});
    }
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      const t0 = c.currentTime;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (e) { console.warn('beep failed', e); }
  }

  // ユーザー操作の最初の1回でAudioContext確定＋無音再生でアンロック
  function unlock() {
    if (unlocked) return;
    const c = ensure(); if (!c) return;
    if (c.state === 'suspended' && c.resume) {
      c.resume().catch(() => {});
    }
    try {
      // 無音バッファ再生でiOS Safariをアンロック
      const buf = c.createBuffer(1, 1, 22050);
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(c.destination);
      src.start(0);
      // 短いオシレータも鳴らす
      const o = c.createOscillator();
      const g = c.createGain();
      g.gain.value = 0;
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + 0.001);
      unlocked = true;
    } catch (e) {}
  }

  // capture フェーズで先に走らせて、ゲーム側のハンドラより前にアンロックを確定
  ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(ev => {
    document.addEventListener(ev, unlock, { capture: true, passive: true });
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
