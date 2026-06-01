(function () {
  'use strict';

  if (window.__toolRuntimeLoaded) return;
  window.__toolRuntimeLoaded = true;

  var onToolPage = /\/tools\//.test(window.location.pathname);
  if (!onToolPage) return;

  var nativeSetTimeout = window.setTimeout.bind(window);
  var nativeClearTimeout = window.clearTimeout.bind(window);
  var nativeSetInterval = window.setInterval.bind(window);
  var nativeClearInterval = window.clearInterval.bind(window);
  var nativeRAF = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : null;
  var nativeCancelRAF = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : null;

  var timeouts = new Set();
  var intervals = new Set();
  var frames = new Set();

  window.setTimeout = function (fn, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var id = nativeSetTimeout(function () {
      timeouts.delete(id);
      if (typeof fn === 'function') {
        fn.apply(window, args);
      } else {
        Function(fn)();
      }
    }, delay);
    timeouts.add(id);
    return id;
  };

  window.clearTimeout = function (id) {
    timeouts.delete(id);
    return nativeClearTimeout(id);
  };

  window.setInterval = function (fn, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var id = nativeSetInterval(function () {
      if (typeof fn === 'function') {
        fn.apply(window, args);
      } else {
        Function(fn)();
      }
    }, delay);
    intervals.add(id);
    return id;
  };

  window.clearInterval = function (id) {
    intervals.delete(id);
    return nativeClearInterval(id);
  };

  if (nativeRAF && nativeCancelRAF) {
    window.requestAnimationFrame = function (fn) {
      var id = nativeRAF(function (ts) {
        frames.delete(id);
        fn(ts);
      });
      frames.add(id);
      return id;
    };

    window.cancelAnimationFrame = function (id) {
      frames.delete(id);
      return nativeCancelRAF(id);
    };
  }

  function clearRuntimeWork() {
    timeouts.forEach(nativeClearTimeout);
    intervals.forEach(nativeClearInterval);
    if (nativeCancelRAF) frames.forEach(nativeCancelRAF);
    timeouts.clear();
    intervals.clear();
    frames.clear();
  }

  window.addEventListener('pagehide', clearRuntimeWork);
  window.addEventListener('beforeunload', clearRuntimeWork);

  function labelFromText(el, fallback) {
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return text || fallback;
  }

  function enhanceAccessibility() {
    document.querySelectorAll('button:not([aria-label])').forEach(function (button) {
      button.setAttribute('aria-label', labelFromText(button, 'Tool control'));
    });

    document.querySelectorAll('canvas:not([aria-label])').forEach(function (canvas) {
      canvas.setAttribute('aria-label', 'Interactive training canvas');
      if (!canvas.hasAttribute('role')) canvas.setAttribute('role', 'img');
    });
  }

  function resizeCanvas(canvas) {
    if (!canvas || !canvas.getBoundingClientRect) return;
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var width = Math.max(1, Math.round(rect.width * dpr));
    var height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  }

  function enhanceCanvasResize() {
    var canvases = Array.prototype.slice.call(document.querySelectorAll('canvas'));
    if (!canvases.length) return;

    canvases.forEach(resizeCanvas);

    if ('ResizeObserver' in window) {
      var observer = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          resizeCanvas(entry.target);
        });
      });
      canvases.forEach(function (canvas) { observer.observe(canvas); });
      window.addEventListener('pagehide', function () { observer.disconnect(); });
    } else {
      window.addEventListener('resize', function () {
        canvases.forEach(resizeCanvas);
      }, { passive: true });
    }
  }

  function gameAssetPath(name) {
    return '../images/game-assets/' + name;
  }

  function hasPlayableSurface(el) {
    return el && (
      el.querySelector('canvas') ||
      el.classList.contains('recoil-trainer') ||
      el.classList.contains('recoil-stage') ||
      el.classList.contains('grenade-stage') ||
      el.classList.contains('lineup-stage') ||
      el.classList.contains('aim-canvas-wrap') ||
      el.classList.contains('game-canvas-wrap')
    );
  }

  function enhanceGameAssets() {
    var selectors = [
      '.aim-canvas-wrap',
      '.game-canvas-wrap',
      '.recoil-trainer',
      '.recoil-stage',
      '.grenade-stage',
      '.lineup-stage'
    ].join(',');

    Array.prototype.slice.call(document.querySelectorAll(selectors)).forEach(function (surface) {
      if (!hasPlayableSurface(surface) || surface.querySelector('.weapon-overlay')) return;
      var img = document.createElement('img');
      var isCompact = /spider|flick|tracking|precision|gridshot/.test(window.location.pathname);
      img.className = 'weapon-overlay' + (isCompact ? ' is-smg' : '');
      img.src = gameAssetPath(isCompact ? 'smg.svg' : 'rifle.svg');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.setAttribute('aria-hidden', 'true');
      surface.appendChild(img);
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function drawBodyTarget(ctx, x, y, scale, accent) {
    if (!ctx) return;
    var s = scale || 1;
    var color = accent || '#2563eb';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = 'rgba(203, 217, 234, 0.72)';
    ctx.beginPath();
    ctx.ellipse(0, 172, 70, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, -72, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.bezierCurveTo(-58, -26, -84, 40, -84, 132);
    ctx.lineTo(84, 132);
    ctx.bezierCurveTo(84, 40, 58, -26, 0, -26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-52, 52);
    ctx.lineTo(52, 52);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 106);
    ctx.stroke();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, -72, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWeapon(ctx, x, y, scale, accent) {
    if (!ctx) return;
    var s = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = accent || '#2563eb';
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(230, 48);
    ctx.lineTo(258, 10);
    ctx.lineTo(328, 10);
    ctx.lineTo(365, 48);
    ctx.lineTo(408, 48);
    ctx.lineTo(408, 88);
    ctx.lineTo(222, 88);
    ctx.lineTo(176, 128);
    ctx.lineTo(118, 128);
    ctx.lineTo(142, 88);
    ctx.lineTo(0, 88);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 32, 51, 0.32)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(34, 22);
    ctx.lineTo(278, 22);
    ctx.moveTo(320, 22);
    ctx.lineTo(390, 22);
    ctx.stroke();
    ctx.restore();
  }

  function rafLoop(fn) {
    var active = true;
    var last = performance.now();
    function frame(now) {
      if (!active) return;
      var delta = Math.min(48, now - last);
      last = now;
      fn(delta, now);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return function stop() { active = false; };
  }

  window.ReflexGameKit = Object.assign(window.ReflexGameKit || {}, {
    clamp: clamp,
    now: function () { return performance.now(); },
    drawBodyTarget: drawBodyTarget,
    drawWeapon: drawWeapon,
    rafLoop: rafLoop
  });

  function debounceAggressiveStarts() {
    var last = 0;
    document.addEventListener('click', function (event) {
      var target = event.target.closest('.reflex-circle-wrap, .game-circle, [data-reflex-trigger]');
      if (!target) return;
      var now = performance.now();
      if (now - last < 90) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      last = now;
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      enhanceAccessibility();
      enhanceCanvasResize();
      enhanceGameAssets();
      debounceAggressiveStarts();
    });
  } else {
    enhanceAccessibility();
    enhanceCanvasResize();
    enhanceGameAssets();
    debounceAggressiveStarts();
  }
})();
