/* ============================================================
   ReflexTester.fun — main.js
   Single JS file: App Logic + Animations + Utilities
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile Nav Toggle ─────────────────────────────────── */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      const isOpen = menu.classList.contains('active');
      menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', !isOpen);
      toggle.textContent = isOpen ? '\u2630' : '\u00d7';
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '\u2630';
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '\u2630';
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Active Nav Link ───────────────────────────────────── */
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPath = new URL(href, window.location.origin).pathname;
      if (currentPath === linkPath || (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
        link.classList.add('active');
      }
    });
  }

  /* ── Smooth Scroll ─────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.getElementById(this.getAttribute('href').slice(1));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  /* ── LocalStorage Helpers ──────────────────────────────── */
  window.ReflexStore = {
    get: function (key, fallback) {
      try { const v = localStorage.getItem('reflex_' + key); return v !== null ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set: function (key, value) {
      try {
        localStorage.setItem('reflex_' + key, JSON.stringify(value));
        if (window.location.pathname.includes('/tools/') && /(result|score|history)/i.test(key)) {
          var slug = window.location.pathname.split('/').pop().replace(/\.html$/, '');
          localStorage.setItem('reflextester_history_' + slug, JSON.stringify(value));
        }
      } catch (e) {}
    }
  };

  /* ── Utilities ─────────────────────────────────────────── */
  window.formatMs = function (ms) { return ms + 'ms'; };
  window.formatSec = function (sec) { return sec.toFixed(1) + 's'; };

  /* ── Scroll Progress Bar ───────────────────────────────── */
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ── Nav Hide/Show on Scroll ───────────────────────────── */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    let lastY = 0, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const y = window.scrollY;
        if (y > 120 && y > lastY) {
          nav.classList.add('hidden');
        } else {
          nav.classList.remove('hidden');
        }
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Scroll Reveals ────────────────────────────────────── */
  function initScrollReveals() {
    var targets = document.querySelectorAll('.fade-in, .slide-in-left');
    if (!targets.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: '500px 0px 0px 0px' });
    targets.forEach(function (el) { obs.observe(el); });
  }

  /* ── Stagger Grid Animation ────────────────────────────── */
  function initStagger() {
    const grids = document.querySelectorAll('[data-stagger]');
    if (!grids.length) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          Array.from(e.target.children).forEach(function (child, i) {
            child.style.transitionDelay = (i * 80) + 'ms';
            child.classList.add('visible');
          });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    grids.forEach(function (grid) {
      Array.from(grid.children).forEach(function (c) { c.classList.add('fade-in'); });
      obs.observe(grid);
    });
  }

  /* ── Counter Animation ─────────────────────────────────── */
  function initPremiumReveals() {
    var selectors = [
      '.tool-card',
      '.blog-card',
      '.blog-preview-card',
      '.related-tool-card',
      '.tool-detail-card',
      '.stat-card',
      '.related-card',
      '.related-post-card',
      '.article-hero-image',
      '.site-hero-media img',
      '.site-content-image'
    ].join(',');
    var items = Array.prototype.slice.call(document.querySelectorAll(selectors));
    if (!items.length) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(function (el) { el.classList.add('reveal-in'); });
      return;
    }

    items.forEach(function (el, index) {
      el.classList.add('reveal-ready');
      el.style.setProperty('--reveal-delay', Math.min(index, 10) * 45 + 'ms');
    });

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.remove('reveal-ready');
        el.classList.add('reveal-in');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '80px 0px -10px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var dur = 2000;
      var startTime = null;
      function step(now) {
        if (!startTime) startTime = now;
        var elapsed = now - startTime;
        var p = Math.min(elapsed / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.floor(target * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    /* Larger rootMargin so above-fold elements (hero stats) always fire */
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        animateCounter(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '200px 0px 0px 0px' });

    counters.forEach(function (el) { obs.observe(el); });
  }

  /* ── Typewriter Effect ─────────────────────────────────── */
  function initTypewriter() {
    var heroTarget = document.getElementById('typingTarget');
    if (heroTarget) {
      var words = ['Reflexes', 'Aim', 'Speed', 'Precision', 'Reactions'];
      var wi = 0, ci = words[0].length, del = false;
      /* Start already showing the first word, then begin cycling after 1.5s pause */
      heroTarget.textContent = words[0];
      function tick() {
        var w = words[wi];
        if (!del) {
          ci++;
          heroTarget.textContent = w.substring(0, ci);
          if (ci >= w.length) { del = true; setTimeout(tick, 1800); return; }
          setTimeout(tick, 80);
        } else {
          ci--;
          heroTarget.textContent = w.substring(0, ci);
          if (ci <= 0) { del = false; wi = (wi + 1) % words.length; ci = 0; setTimeout(tick, 300); return; }
          setTimeout(tick, 45);
        }
      }
      setTimeout(function () { del = true; tick(); }, 1500);
    }

    document.querySelectorAll('[data-typewriter]').forEach(function (el) {
      const text = el.getAttribute('data-typewriter');
      el.textContent = '';
      let i = 0;
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        (function type() { if (i < text.length) { el.textContent += text[i++]; setTimeout(type, 40); } })();
        obs.unobserve(el);
      }, { threshold: 0.5 }).observe(el);
    });
  }

  /* ── FAQ Accordion ─────────────────────────────────────── */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      const q = item.querySelector('.faq-question');
      if (!q) return;
      q.addEventListener('click', function () {
        const open = item.classList.contains('open');
        items.forEach(function (it) { it.classList.remove('open'); });
        if (!open) item.classList.add('open');
      });
    });
  }

  /* ── Magnetic Buttons ──────────────────────────────────── */
  function initMagneticButtons() {
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.15;
        const y = (e.clientY - r.top - r.height / 2) * 0.15;
        btn.style.transform = 'translateY(-2px) translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ── Hero Parallax ─────────────────────────────────────── */
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    window.addEventListener('scroll', function () {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        hero.style.transform = 'translateY(' + (y * 0.25) + 'px)';
        hero.style.opacity = 1 - (y / (window.innerHeight * 1.2));
      }
    }, { passive: true });
  }

  /* ── Share Results + Next Tool ─────────────────────────── */
  var TOOLS = [
    { name: '⚡ Visual Reflex Test',       url: 'visual-reflex-test.html' },
    { name: '🔊 Audio Reflex Test',        url: 'audio-reflex-test.html' },
    { name: '🧠 Memory Sequence',          url: 'memory-sequence-test.html' },
    { name: '🎯 CS:GO Aim Trainer',        url: 'csgo-aim-trainer.html' },
    { name: '🎯 Valorant Aim Trainer',     url: 'valorant-aim-trainer.html' },
    { name: '🎮 Fortnite Aim Trainer',     url: 'fortnite-aim-trainer.html' },
    { name: '🖱️ Click Speed Test',         url: 'click-speed-test.html' },
    { name: '⌨️ Typing Speed Test',        url: 'typing-speed-test.html' },
    { name: '🎨 Color Match Test',         url: 'color-match-test.html' },
    { name: '🏃 Stroop Effect Test',       url: 'stroop-effect-test.html' },
    { name: '👁️ Peripheral Vision Test',   url: 'peripheral-vision-test.html' },
    { name: '🎯 Flick Shot Trainer',       url: 'flick-shot-trainer.html' },
    { name: '🎮 Apex Aim Trainer',         url: 'apex-aim-trainer.html' }
  ];

  function getNextTools(currentUrl, count) {
    var current = currentUrl.split('/').pop();
    var others = TOOLS.filter(function (t) { return t.url !== current; });
    // Shuffle deterministically based on hour so it changes but is stable per session
    var seed = new Date().getHours();
    others.sort(function (a, b) {
      return (a.url.charCodeAt(0) + seed) % 13 - (b.url.charCodeAt(0) + seed) % 13;
    });
    return others.slice(0, count);
  }

  /* Call this from any tool page after a result: window.showShareResult('247ms') */
  window.showShareResult = function (score, label) {
    label = label || '';
    var bar = document.getElementById('shareResultsBar');
    if (!bar) return;

    var scoreEl = bar.querySelector('.share-score');
    if (scoreEl) scoreEl.textContent = score;

    var title = document.title.replace(' | ReflexTester.fun', '').trim();
    var tweetText = encodeURIComponent('I scored ' + score + ' ' + label + ' on ' + title + ' 🎯 Can you beat me?\n\nhttps://reflextester.fun' + window.location.pathname);
    var twitterBtn = bar.querySelector('.share-btn-twitter');
    if (twitterBtn) twitterBtn.href = 'https://twitter.com/intent/tweet?text=' + tweetText;

    var copyBtn = bar.querySelector('.share-btn-copy');
    if (copyBtn) {
      copyBtn.onclick = function () {
        var text = 'I scored ' + score + ' ' + label + ' on ' + title + '! Try it at https://reflextester.fun' + window.location.pathname;
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = '✅ Copied!';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.textContent = '📋 Copy Result';
            copyBtn.classList.remove('copied');
          }, 2500);
        });
      };
    }

    bar.classList.add('visible');
  };

  function initShareBar() {
    // Only inject on /tools/ pages
    if (!window.location.pathname.includes('/tools/')) return;

    var base = '../';
    var next = getNextTools(window.location.pathname, 3);
    var nextLinks = next.map(function (t) {
      return '<a href="' + base + 'tools/' + t.url + '" class="next-tool-link">' + t.name + '</a>';
    }).join('');

    var bar = document.createElement('div');
    bar.className = 'share-results-bar';
    bar.id = 'shareResultsBar';
    bar.innerHTML =
      '<h3>Your Result</h3>' +
      '<div class="share-score">—</div>' +
      '<div class="share-buttons">' +
        '<a href="#" class="share-btn share-btn-twitter" target="_blank" rel="noopener">𝕏 Share on X</a>' +
        '<button class="share-btn share-btn-copy">📋 Copy Result</button>' +
      '</div>' +
      '<div class="next-tool-strip">' +
        '<span>Try next →</span>' +
        nextLinks +
      '</div>';

    // Insert after .test-actions or .stats-panel, whichever exists
    var anchor = document.querySelector('.test-actions') || document.querySelector('.stats-panel') || document.querySelector('.test-area');
    if (anchor) {
      anchor.insertAdjacentElement('afterend', bar);
    }
  }

  /* ── Error Boundary ────────────────────────────────────── */
  function initAdblockGate() {
    var gateId = 'adblockGate';
    var baitId = 'rtAdBlockBait';
    var gateLiftTimer = null;
    var localDebug = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) &&
      new URLSearchParams(window.location.search).has('adblock-test');

    function makeBait() {
      var bait = document.getElementById(baitId);
      if (bait) return bait;

      bait = document.createElement('div');
      bait.id = baitId;
      bait.className = 'adsbygoogle adsbox ad-banner ad-unit banner_ads text-ad textads pub_300x250 ad-placement';
      bait.setAttribute('aria-hidden', 'true');
      bait.style.cssText = 'position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;pointer-events:none;';
      document.body.appendChild(bait);
      return bait;
    }

    function isBaitBlocked(bait) {
      if (localDebug) return true;
      if (!bait) return false;
      var style = window.getComputedStyle ? window.getComputedStyle(bait) : null;
      return bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        (style && (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') === 0));
    }

    function removeGate() {
      var gate = document.getElementById(gateId);
      if (gate) gate.remove();
      if (gateLiftTimer) {
        window.clearInterval(gateLiftTimer);
        gateLiftTimer = null;
      }
      document.body.classList.remove('adblock-locked');
    }

    function showGate() {
      if (document.getElementById(gateId)) return;

      var gate = document.createElement('div');
      gate.id = gateId;
      gate.className = 'adblock-gate';
      gate.setAttribute('role', 'dialog');
      gate.setAttribute('aria-modal', 'true');
      gate.setAttribute('aria-labelledby', 'adblockGateTitle');
      gate.innerHTML =
        '<div class="adblock-gate-shell">' +
          '<div class="adblock-gate-visual" aria-hidden="true">' +
            '<span class="adblock-gate-pulse"></span>' +
            '<span class="adblock-gate-shield"></span>' +
          '</div>' +
          '<p class="adblock-gate-kicker">Ads support free training tools</p>' +
          '<h2 id="adblockGateTitle">Please turn off your ad blocker</h2>' +
          '<p class="adblock-gate-copy">ReflexTester stays free because ads help cover hosting and development. Disable your blocker for this site, then refresh the page to continue.</p>' +
          '<div class="adblock-gate-steps" aria-label="How to continue">' +
            '<span>Disable ad blocker</span>' +
            '<span>Allow this site</span>' +
            '<span>Refresh page</span>' +
          '</div>' +
          '<div class="adblock-gate-actions">' +
            '<button type="button" class="adblock-gate-primary" data-adblock-refresh>Refresh page</button>' +
            '<button type="button" class="adblock-gate-secondary" data-adblock-check>Check again</button>' +
          '</div>' +
          '<p class="adblock-gate-note">Already disabled it? Use refresh so the ad placements can load cleanly.</p>' +
        '</div>';

      document.body.appendChild(gate);
      document.body.classList.add('adblock-locked');
      gateLiftTimer = window.setInterval(function () {
        if (!gate.parentNode) return;
        if (document.body.lastElementChild !== gate) document.body.appendChild(gate);
      }, 500);

      var refresh = gate.querySelector('[data-adblock-refresh]');
      var check = gate.querySelector('[data-adblock-check]');
      if (refresh) refresh.addEventListener('click', function () { window.location.reload(); });
      if (check) {
        check.addEventListener('click', function () {
          check.textContent = 'Checking...';
          window.setTimeout(function () {
            if (isBaitBlocked(makeBait())) {
              check.textContent = 'Still blocked';
              window.setTimeout(function () { check.textContent = 'Check again'; }, 1200);
              return;
            }
            window.location.reload();
          }, 260);
        });
      }
    }

    function runCheck() {
      var bait = makeBait();
      window.setTimeout(function () {
        if (isBaitBlocked(bait)) {
          showGate();
        } else {
          removeGate();
        }
      }, 120);
    }

    window.setTimeout(runCheck, 700);
    window.addEventListener('load', function () {
      window.setTimeout(runCheck, 900);
    });
  }

  function initErrorBoundary() {
    window.addEventListener('error', function (e) {
      // Only catch errors from tool scripts, not external
      if (!e.filename || !e.filename.includes(window.location.hostname)) return;
      var area = document.querySelector('.test-area, .game-area, #main');
      if (!area || document.querySelector('.tool-error')) return;
      var errDiv = document.createElement('div');
      errDiv.className = 'tool-error';
      errDiv.innerHTML =
        '<h3>⚠️ Something went wrong</h3>' +
        '<p>The tool encountered an error. Try refreshing the page.</p>' +
        '<button class="btn btn-secondary" onclick="location.reload()">🔄 Reload Page</button>';
      area.prepend(errDiv);
    });
  }

  /* ── Lazy Load Images ──────────────────────────────────── */
  function initLazyImages() {
    document.querySelectorAll('img:not([loading])').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  }

  /* ── Service Worker Registration ─────────────────────── */
  function initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (reg) {
          console.log('[SW] Registered:', reg.scope);
          setInterval(function () { reg.update(); }, 60 * 60 * 1000);
        }).catch(function (err) {
          console.log('[SW] Registration failed:', err);
        });
      });
    }
  }

  /* ── Init All ──────────────────────────────────────────── */
  function init() {
    initAdblockGate();
    initMobileNav();
    setActiveNavLink();
    initSmoothScroll();
    initScrollProgress();
    initNavScroll();
    initScrollReveals();
    initStagger();
    initPremiumReveals();
    initCounters();
    initTypewriter();
    initFAQ();
    initMagneticButtons();
    initHeroParallax();
    initShareBar();
    initErrorBoundary();
    initLazyImages();
    initServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
