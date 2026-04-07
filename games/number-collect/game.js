// こっこちゃん すうじあつめ
(function () {
  const stage = document.getElementById('stage');
  const eggsLayer = document.getElementById('eggs');
  const messageEl = document.getElementById('message');
  const scoreEl = document.getElementById('score');
  const heartsEl = document.getElementById('hearts');
  const bubble = document.getElementById('kokkoBubble');
  const startBtn = document.getElementById('startBtn');
  const overlay = document.getElementById('overlay');
  const overTitle = document.getElementById('overTitle');
  const overText = document.getElementById('overText');
  const overBtn = document.getElementById('overBtn');

  const COLORS = ['#ff7043', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc', '#ec407a', '#26c6da', '#ffa726', '#9ccc65'];

  let level = 1;
  let score = 0;
  let hearts = 3;
  let nextNumber = 1;
  let maxNumber = 5;
  let playing = false;

  // ── 音（Web Audio API でビープ生成）
  let audioCtx = null;
  function beep(freq, duration, type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.value = 0.15;
      o.connect(g); g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      o.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }
  const sndCorrect = () => { beep(660, 0.12, 'triangle'); setTimeout(() => beep(880, 0.15, 'triangle'), 80); };
  const sndWrong   = () => { beep(180, 0.2, 'sawtooth'); };
  const sndClear   = () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle'), i * 120)); };
  const sndOver    = () => { [400, 320, 240, 160].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'square'), i * 150)); };

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }
  function setBubble(text) {
    bubble.textContent = text;
  }

  function drawHearts() {
    heartsEl.textContent = '❤️'.repeat(hearts) + '🤍'.repeat(Math.max(0, 3 - hearts));
  }

  function spawnEggs() {
    eggsLayer.innerHTML = '';
    const rect = stage.getBoundingClientRect();
    const padX = 60, padY = 60;
    const w = rect.width, h = rect.height;

    // ランダム位置（重ならないように）
    const positions = [];
    const tryPlace = () => {
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = padX + Math.random() * (w - padX * 2);
        const y = padY + Math.random() * (h - padY * 2 - 40); // こっこちゃんスペース
        let ok = true;
        for (const p of positions) {
          if (Math.hypot(p.x - x, p.y - y) < 90) { ok = false; break; }
        }
        if (ok) { positions.push({ x, y }); return { x, y }; }
      }
      return { x: padX + Math.random() * (w - padX * 2), y: padY + Math.random() * (h - padY * 2) };
    };

    const numbers = shuffle(Array.from({ length: maxNumber }, (_, i) => i + 1));
    numbers.forEach(n => {
      const pos = tryPlace();
      const egg = document.createElement('div');
      egg.className = 'egg';
      egg.style.left = pos.x + 'px';
      egg.style.top  = pos.y + 'px';
      egg.style.setProperty('--c', COLORS[(n - 1) % COLORS.length]);
      egg.style.animationDelay = (Math.random() * 2) + 's';
      egg.dataset.num = n;
      egg.innerHTML = '<span>' + n + '</span>';
      egg.addEventListener('click', onEggTap);
      egg.addEventListener('touchstart', e => { e.preventDefault(); onEggTap.call(egg, e); }, { passive: false });
      eggsLayer.appendChild(egg);
    });
  }

  function onEggTap(e) {
    if (!playing) return;
    const n = parseInt(this.dataset.num, 10);
    if (n === nextNumber) {
      // 正解
      sndCorrect();
      score += 10 * level;
      scoreEl.textContent = score;
      this.classList.add('pop');
      const chick = document.createElement('div');
      chick.className = 'chick';
      chick.textContent = '🐣';
      chick.style.left = this.style.left;
      chick.style.top = this.style.top;
      eggsLayer.appendChild(chick);
      setTimeout(() => chick.remove(), 1000);

      nextNumber++;
      setBubble('せいかい！');
      setTimeout(() => setBubble('つぎは ' + nextNumber + ' だよ'), 600);

      if (nextNumber > maxNumber) {
        // レベルクリア
        playing = false;
        setTimeout(nextLevel, 800);
      }
    } else {
      // 不正解
      sndWrong();
      this.classList.add('shake');
      setTimeout(() => this.classList.remove('shake'), 400);
      hearts--;
      drawHearts();
      setBubble('ちがうよ〜');
      if (hearts <= 0) {
        gameOver();
      }
    }
  }

  function nextLevel() {
    sndClear();
    level++;
    maxNumber = Math.min(9, 4 + level);
    setMessage('レベル ' + level + ' スタート！ 1から ' + maxNumber + ' まで');
    nextNumber = 1;
    setBubble('やったね！');
    setTimeout(() => {
      spawnEggs();
      playing = true;
    }, 1200);
  }

  function gameOver() {
    playing = false;
    sndOver();
    overTitle.textContent = 'ゲームオーバー';
    overText.textContent = 'てんすう: ' + score + '点  /  レベル ' + level;
    overlay.classList.remove('hidden');
  }

  function startGame() {
    level = 1;
    score = 0;
    hearts = 3;
    nextNumber = 1;
    maxNumber = 5;
    drawHearts();
    scoreEl.textContent = score;
    setMessage('1から ' + maxNumber + ' まで じゅんばんに タップ！');
    setBubble('がんばろう！');
    overlay.classList.add('hidden');
    startBtn.style.display = 'none';
    spawnEggs();
    playing = true;
    // 音声を初期化（ユーザー操作時）
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
  }

  startBtn.addEventListener('click', startGame);
  overBtn.addEventListener('click', startGame);

  drawHearts();

  // 画面リサイズ時にレイアウトを再生成（プレイ中でない時のみ）
  window.addEventListener('resize', () => {
    if (!playing && eggsLayer.children.length === 0) return;
  });
})();
