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
      toggle.textContent = isOpen ? '☰' : '✕';
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
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
      try { localStorage.setItem('reflex_' + key, JSON.stringify(value)); } catch (e) {}
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
        nav.classList.toggle('hidden', y > 120 && y > lastY);
        nav.classList.toggle('hidden', false); // always show on scroll up
        if (y > 120 && y > lastY) nav.classList.add('hidden');
        else nav.classList.remove('hidden');
        lastY = y; ticking = false;
      });
    }, { passive: true });
  }

  /* ── Scroll Reveals ────────────────────────────────────── */
  function initScrollReveals() {
    const targets = document.querySelectorAll('.fade-in, .slide-in-left');
    if (!targets.length) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
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
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const start = performance.now();
        const dur = 1500;
        (function update(now) {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = prefix + Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(update);
        })(start);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });
    counters.forEach(function (el) { obs.observe(el); });
  }

  /* ── Typewriter Effect ─────────────────────────────────── */
  function initTypewriter() {
    const heroTarget = document.getElementById('typingTarget');
    if (heroTarget) {
      const words = ['Reflexes', 'Aim', 'Speed', 'Precision', 'Reactions'];
      let wi = 0, ci = words[0].length, del = false;
      function tick() {
        const w = words[wi];
        if (!del) {
          heroTarget.textContent = w.substring(0, ++ci);
          if (ci === w.length) { del = true; setTimeout(tick, 2000); return; }
          setTimeout(tick, 80);
        } else {
          heroTarget.textContent = w.substring(0, --ci);
          if (ci === 0) { del = false; wi = (wi + 1) % words.length; setTimeout(tick, 400); return; }
          setTimeout(tick, 50);
        }
      }
      setTimeout(function () { del = true; tick(); }, 2000);
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

  /* ── Init All ──────────────────────────────────────────── */
  function init() {
    initMobileNav();
    setActiveNavLink();
    initSmoothScroll();
    initScrollProgress();
    initNavScroll();
    initScrollReveals();
    initStagger();
    initCounters();
    initTypewriter();
    initFAQ();
    initMagneticButtons();
    initHeroParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
