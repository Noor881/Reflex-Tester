"""
Comprehensive game bug fixes for ReflexTester.fun
Fixes logic bugs in all interactive tools + adds missing CSS.
"""
import os, re

ROOT = r'c:\Users\snowp\Reflex-Tester'

def fix_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  FIXED: {os.path.relpath(path, ROOT)}')

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

# ─── 1. Add missing CSS ───────────────────────────────────────────────────────
css_path = os.path.join(ROOT, 'styles.css')
css = read_file(css_path)

# Check if already patched
if '.stroop-btn.correct' not in css:
    css += """

/* ════════════════════════════════════════════════════════════
   GAME-SPECIFIC MISSING STYLES (added by fix script)
   ════════════════════════════════════════════════════════════ */

/* Stroop Effect — button feedback */
.stroop-btn.correct {
  background: var(--accent-green) !important;
  transform: scale(1.05);
  box-shadow: 0 0 16px var(--accent-green);
}
.stroop-btn.wrong {
  background: #ff4444 !important;
  transform: scale(0.95);
  box-shadow: 0 0 16px #ff4444;
  animation: shake 0.3s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0) scale(0.95); }
  25% { transform: translateX(-5px) scale(0.95); }
  75% { transform: translateX(5px) scale(0.95); }
}

/* Hand-Eye / Aim area */
.aim-area {
  position: relative;
  width: 100%;
  height: 340px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: crosshair;
  user-select: none;
}
.aim-target {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-cyan);
  border: 3px solid #fff;
  cursor: pointer;
  box-shadow: 0 0 20px var(--accent-cyan);
  animation: targetPulse 0.4s ease;
  z-index: 2;
}
@keyframes targetPulse {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
#aimOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
  background: rgba(0,0,0,0.4);
  border-radius: var(--radius-lg);
  z-index: 3;
}

/* Number Display */
.number-display {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 3px solid var(--border-color);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem auto;
  font-size: 1.5rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}
.number-display.active {
  border-color: var(--accent-cyan);
  background: rgba(0, 212, 255, 0.08);
  color: var(--accent-cyan);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}
.number-display span {
  font-weight: 700;
  line-height: 1;
}

/* Peripheral vision — mobile start button */
.peripheral-start-btn {
  display: none;
}
@media (max-width: 640px) {
  .peripheral-start-btn {
    display: inline-flex;
  }
}

/* Score display inside aim-area */
#scoreDisplay {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent-cyan);
  text-align: center;
  margin: 0.75rem 0;
}

/* Typing — completion banner */
.typing-complete {
  text-align: center;
  padding: 1rem;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid var(--accent-cyan);
  border-radius: var(--radius-md);
  color: var(--accent-cyan);
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1rem;
  display: none;
}
.typing-complete.visible {
  display: block;
}
"""
    fix_file(css_path, css)
    print('  ADDED missing CSS classes')
else:
    print('  CSS already patched, skipping')

# ─── 2. click-speed-test.html — Fix: first click starts AND counts ───────────
print('\n=== click-speed-test.html ===')
cps_path = os.path.join(ROOT, 'tools', 'click-speed-test.html')
cps = read_file(cps_path)

# Bug: start click immediately also increments clicks. Fix: only count after isRunning already was true.
old = """            cpsArea.addEventListener('click', function (e) {
                e.preventDefault();
                if (!isRunning) {
                    startTest();
                }
                if (isRunning) {
                    clicks++;
                    clickCount.textContent = clicks;
                }
            });"""
new = """            cpsArea.addEventListener('click', function (e) {
                e.preventDefault();
                if (!isRunning) {
                    startTest();
                    return; // Don't count the start click
                }
                clicks++;
                clickCount.textContent = clicks;
            });"""
if old in cps:
    cps = cps.replace(old, new)
    fix_file(cps_path, cps)
else:
    print('  SKIPPED (already fixed or pattern not found)')

# ─── 3. hand-eye-coordination-test.html — Fix double-miss counting ────────────
print('\n=== hand-eye-coordination-test.html ===')
hec_path = os.path.join(ROOT, 'tools', 'hand-eye-coordination-test.html')
hec = read_file(hec_path)

# Bug 1: aimArea click fires even when target is visible (since stopPropagation only blocks bubbling from target)
# Bug 2: Overlay shows as flex but text says undefined
# Fix: only count miss if area is clicked AND target is currently visible (not during gap between targets)
old_area = """            aimArea.addEventListener('click', function () {
                if (isPlaying && target.style.display === 'none') {
                    targetsMissed++;
                }
            });"""
new_area = """            aimArea.addEventListener('click', function (e) {
                // Only count as miss when target is currently visible and user clicked the background
                if (isPlaying && target.style.display !== 'none') {
                    clearTimeout(timeoutId);
                    targetsMissed++;
                    target.style.display = 'none';
                    nextTarget();
                }
            });"""
if old_area in hec:
    hec = hec.replace(old_area, new_area)
    # Also fix aimOverlay display style
    hec = hec.replace(
        "aimOverlay.style.display = 'flex';",
        "aimOverlay.style.display = 'flex'; aimOverlay.style.alignItems = 'center'; aimOverlay.style.justifyContent = 'center';"
    )
    fix_file(hec_path, hec)
else:
    print('  SKIPPED (already fixed or pattern not found)')

# ─── 4. memory-sequence-test.html — Fix: clicks during 200ms inter-tile gap ──
print('\n=== memory-sequence-test.html ===')
mem_path = os.path.join(ROOT, 'tools', 'memory-sequence-test.html')
mem = read_file(mem_path)

# Bug: isShowingSequence=false after last tile flash but before "Your turn" message
# Fix: keep isShowingSequence=true until AFTER the last resolve resolves
# Also fix: stats don't update while playing (currentLevel stays —)
old_show = """            async function showSequence() {
                isShowingSequence = true;
                statusDisplay.textContent = 'Watch the sequence...';
                await new Promise(r => setTimeout(r, 500));

                for (let i = 0; i < sequence.length; i++) {
                    await flashTile(sequence[i], 400);
                }

                isShowingSequence = false;
                statusDisplay.textContent = 'Your turn! Repeat the sequence';
            }"""
new_show = """            async function showSequence() {
                isShowingSequence = true;
                playerIndex = 0; // Reset input index at start of each sequence
                statusDisplay.textContent = 'Watch the sequence...';
                await new Promise(r => setTimeout(r, 600));

                for (let i = 0; i < sequence.length; i++) {
                    await flashTile(sequence[i], 500);
                    await new Promise(r => setTimeout(r, 100)); // Extra gap between tiles
                }

                await new Promise(r => setTimeout(r, 200)); // Final pause before accepting input
                isShowingSequence = false;
                statusDisplay.textContent = 'Your turn! Repeat the sequence (' + sequence.length + ' tiles)';
            }"""
if old_show in mem:
    mem = mem.replace(old_show, new_show)
    # Also fix playerIndex not being reset in startGame
    mem = mem.replace(
        """            function startGame() {
                sequence = [];
                playerIndex = 0;
                level = 0;
                isPlaying = true;
                startBtn.textContent = 'Playing...';
                startBtn.disabled = true;
                addToSequence();
                showSequence();
                updateStats();
            }""",
        """            function startGame() {
                sequence = [];
                playerIndex = 0;
                level = 0;
                isPlaying = true;
                startBtn.textContent = 'Playing...';
                startBtn.disabled = true;
                statsPanel.style.display = 'block';
                document.getElementById('currentLevel').textContent = '1';
                document.getElementById('bestLevel').textContent = bestLevel || '—';
                document.getElementById('gamesPlayed').textContent = gamesPlayed;
                addToSequence();
                showSequence();
            }"""
    )
    fix_file(mem_path, mem)
else:
    print('  SKIPPED (already fixed or pattern not found)')

# ─── 5. stroop-effect-test.html — Fix: buttons disabled after reset ───────────
print('\n=== stroop-effect-test.html ===')
stroop_path = os.path.join(ROOT, 'tools', 'stroop-effect-test.html')
stroop = read_file(stroop_path)

# Bug: after reset, pointerEvents stays 'none' until game starts
# Also bug: startBtn.textContent doesn't reset on resetBtn click
old_reset = """            resetBtn.addEventListener('click', function () {
                results = [];
                ReflexStore.set('stroop_results', []);
                resultDisplay.style.display = 'none';
                stroopWord.textContent = 'RED';
                stroopWord.style.color = colors.blue;
                progressText.textContent = 'Round 0 / 20';
                startBtn.textContent = 'Start Test';
                updateStats();
            });"""
new_reset = """            resetBtn.addEventListener('click', function () {
                results = [];
                ReflexStore.set('stroop_results', []);
                resultDisplay.style.display = 'none';
                stroopWord.textContent = 'RED';
                stroopWord.style.color = colors.blue;
                progressText.textContent = 'Round 0 / ' + TOTAL_ROUNDS;
                startBtn.textContent = 'Start Test';
                startBtn.disabled = false;
                isPlaying = false;
                stroopOptions.style.pointerEvents = 'none';
                updateStats();
            });"""
if old_reset in stroop:
    stroop = stroop.replace(old_reset, new_reset)
    # Also fix: show word should ensure buttons are visible/clickable during game
    # Already set in startGame via stroopOptions.style.pointerEvents = 'auto'
    fix_file(stroop_path, stroop)
else:
    print('  SKIPPED (already fixed or pattern not found)')

# ─── 6. typing-speed-test.html — Fix: add completion banner + better UX ───────
print('\n=== typing-speed-test.html ===')
typ_path = os.path.join(ROOT, 'tools', 'typing-speed-test.html')
typ = read_file(typ_path)

# Add a completion banner div after typingStats
old_html = """                <div class="test-actions">
                    <button class="btn btn-primary" id="newTestBtn">New Test</button>
                    <button class="btn btn-secondary" id="resetBtn">Reset Stats</button>
                </div>"""
new_html = """                <div class="typing-complete" id="typingComplete"></div>
                <div class="test-actions">
                    <button class="btn btn-primary" id="newTestBtn">New Test</button>
                    <button class="btn btn-secondary" id="resetBtn">Reset Stats</button>
                </div>"""
if old_html in typ and 'typingComplete' not in typ:
    typ = typ.replace(old_html, new_html)

# Fix: show completion banner and re-enable properly
old_complete = """                if (typed.length >= currentText.length) {
                    clearInterval(intervalId);
                    typingInput.disabled = true;
                    results.push(stats);
                    ReflexStore.set('typing_results', results);
                    updateStats();
                }"""
new_complete = """                if (typed.length >= currentText.length && startTime) {
                    clearInterval(intervalId);
                    typingInput.disabled = true;
                    renderText(currentText); // Show all as correct/wrong on completion
                    results.push(stats);
                    ReflexStore.set('typing_results', results);
                    updateStats();
                    var banner = document.getElementById('typingComplete');
                    if (banner) {
                        banner.textContent = '✅ Done! ' + stats.wpm + ' WPM — ' + stats.accuracy.toFixed(1) + '% accuracy. Click "New Test" to go again!';
                        banner.classList.add('visible');
                    }
                }"""
if old_complete in typ:
    typ = typ.replace(old_complete, new_complete)

# Fix: loadNewText should hide completion banner
old_load = """            function loadNewText() {
                currentText = sentences[Math.floor(Math.random() * sentences.length)];
                renderText('');
                typingInput.value = '';
                typingInput.disabled = false;
                typingInput.focus();
                startTime = null;
                clearInterval(intervalId);
                wpmValue.textContent = '0';
                accuracyValue.textContent = '100%';
                timeValue.textContent = '0s';
            }"""
new_load = """            function loadNewText() {
                currentText = sentences[Math.floor(Math.random() * sentences.length)];
                renderText('');
                typingInput.value = '';
                typingInput.disabled = false;
                typingInput.focus();
                startTime = null;
                clearInterval(intervalId);
                wpmValue.textContent = '0';
                accuracyValue.textContent = '100%';
                timeValue.textContent = '0s';
                var banner = document.getElementById('typingComplete');
                if (banner) banner.classList.remove('visible');
            }"""
if old_load in typ:
    typ = typ.replace(old_load, new_load)
    fix_file(typ_path, typ)
else:
    print('  SKIPPED (pattern not found)')

# ─── 7. peripheral-vision-test.html — Add Start button for mobile ─────────────
print('\n=== peripheral-vision-test.html ===')
pv_path = os.path.join(ROOT, 'tools', 'peripheral-vision-test.html')
pv = read_file(pv_path)

# Add a Start button that works on mobile (alongside Space bar)
old_actions = """                <div class="test-actions">
                    <button class="btn btn-secondary" id="resetBtn">Reset Stats</button>
                </div>"""
new_actions = """                <div class="test-actions">
                    <button class="btn btn-primary peripheral-start-btn" id="startBtn">Start Round</button>
                    <button class="btn btn-secondary" id="resetBtn">Reset Stats</button>
                </div>"""
if old_actions in pv and 'peripheral-start-btn' not in pv:
    pv = pv.replace(old_actions, new_actions)

# Add startBtn listener
old_key = """            document.addEventListener('keydown', handleKeyPress);

            resetBtn.addEventListener('click', function () {"""
new_key = """            document.addEventListener('keydown', handleKeyPress);

            var startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.addEventListener('click', function () {
                    if (state === 'waiting') {
                        startRound();
                    }
                });
            }

            resetBtn.addEventListener('click', function () {"""
if old_key in pv:
    pv = pv.replace(old_key, new_key)
    # Update instructions for mobile
    pv = pv.replace(
        "Keep your eyes on the <strong style=\"color: var(--accent-cyan);\">CENTER\n                        DOT</strong>. Press the arrow key matching where the target appears (← Left / → Right)!</p>",
        "Keep your eyes on the <strong style=\"color: var(--accent-cyan);\">CENTER DOT</strong>. Press the arrow key (← Left / → Right) matching where the target appears. On mobile, tap the target side!</p>"
    )
    fix_file(pv_path, pv)
else:
    print('  SKIPPED (already fixed or pattern not found)')

# ─── 8. audio-reflex-test.html — Fix AudioContext suspended state ──────────────
print('\n=== audio-reflex-test.html ===')
audio_path = os.path.join(ROOT, 'tools', 'audio-reflex-test.html')
audio = read_file(audio_path)

# Bug: AudioContext may be in 'suspended' state when playBeep() runs
# Fix: resume AudioContext before playing, and also initialize on page load
old_beep = """            function playBeep() {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.value = 800;
                gain.gain.value = 0.3;
                osc.start();
                osc.stop(audioCtx.currentTime + 0.15);
            }"""
new_beep = """            function playBeep() {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                var doPlay = function() {
                    var osc = audioCtx.createOscillator();
                    var gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.frequency.value = 800;
                    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                    osc.start(audioCtx.currentTime);
                    osc.stop(audioCtx.currentTime + 0.15);
                };
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume().then(doPlay);
                } else {
                    doPlay();
                }
            }"""
if old_beep in audio:
    audio = audio.replace(old_beep, new_beep)
    fix_file(audio_path, audio)
else:
    print('  SKIPPED (already fixed or pattern not found)')

# ─── 9. color-match-test.html — Fix: startBtn stays disabled after wrong ──────
print('\n=== color-match-test.html ===')
col_path = os.path.join(ROOT, 'tools', 'color-match-test.html')
col = read_file(col_path)

# Bug: startBtn.disabled=true set in showColor(), not re-enabled until 1000ms later
# This means after a wrong click the user is stuck. Fix: add a "Next" flow.
# Actually the issue is the button is permanently disabled during the game. 
# The real fix: show a "Next Round" button or auto-advance
old_timeout = """                    setTimeout(() => {
                        options.forEach(o => o.classList.remove('correct', 'wrong'));
                        colorOptions.style.display = 'none';
                        colorTarget.style.background = 'var(--bg-tertiary)';
                        targetText.textContent = 'Click Start';
                        startBtn.disabled = false;
                    }, 1000);"""
new_timeout = """                    setTimeout(function () {
                        options.forEach(function(o) { o.classList.remove('correct', 'wrong'); });
                        colorOptions.style.display = 'none';
                        colorTarget.style.background = 'var(--bg-tertiary)';
                        targetText.textContent = 'Click Start for next round';
                        startBtn.disabled = false;
                        startBtn.focus();
                    }, 800);"""
if old_timeout in col:
    col = col.replace(old_timeout, new_timeout)
    fix_file(col_path, col)
else:
    print('  SKIPPED (already fixed or pattern not found)')

# ─── 10. visual-reflex-test.html — minor: 'result' state has no class ─────────
print('\n=== visual-reflex-test.html ===')
vrt_path = os.path.join(ROOT, 'tools', 'visual-reflex-test.html')
vrt = read_file(vrt_path)

# Bug: gameArea.className='game-circle result' but CSS only has .waiting/.ready/.go
# 'result' state shows as dark circle. Fix: add result = waiting style fallback
old_state = """            function setState(newState) {
                state = newState;
                gameArea.className = 'game-circle ' + newState;"""
new_state = """            function setState(newState) {
                state = newState;
                // Map 'result' -> 'waiting' visually (dark circle ready for next click)
                var cssState = newState === 'result' ? 'waiting' : newState;
                gameArea.className = 'game-circle ' + cssState;"""
if old_state in vrt:
    vrt = vrt.replace(old_state, new_state)
    fix_file(vrt_path, vrt)
else:
    print('  SKIPPED (already fixed or pattern not found)')

print('\n=== ALL GAME FIXES APPLIED ===')
