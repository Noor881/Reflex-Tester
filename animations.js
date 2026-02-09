/* ============================================================
   ReflexTester.fun — Animations Engine
   GSAP ScrollTrigger + Intersection Observer Fallback
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Scroll Progress Bar ---------- */
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ---------- Nav Hide/Show on Scroll ---------- */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    let lastY = 0;
    let ticking = false;
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

  /* ---------- Intersection Observer Reveals ---------- */
  function initScrollReveals() {
    const targets = document.querySelectorAll('.fade-in, .slide-in-left');
    if (!targets.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Stagger Animation for Grids ---------- */
  function initStagger() {
    const grids = document.querySelectorAll('[data-stagger]');
    if (!grids.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach(function (child, i) {
            child.style.transitionDelay = (i * 80) + 'ms';
            child.classList.add('visible');
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    grids.forEach(function (grid) {
      Array.from(grid.children).forEach(function (child) {
        child.classList.add('fade-in');
      });
      observer.observe(grid);
    });
  }

  /* ---------- Counter Animation ---------- */
  function animateCounter(el, target, duration) {
    const start = 0;
    const startTime = performance.now();
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-count'), 10);
          animateCounter(entry.target, target, 1500);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Typewriter Effect ---------- */
  function initTypewriter() {
    /* Looping hero word rotation */
    const heroTarget = document.getElementById('typingTarget');
    if (heroTarget) {
      const words = ['Reflexes', 'Aim', 'Speed', 'Precision', 'Reactions'];
      let wordIdx = 0;
      let charIdx = words[0].length;
      let isDeleting = false;
      const TYPE_SPEED = 80;
      const DELETE_SPEED = 50;
      const PAUSE_AFTER_TYPE = 2000;
      const PAUSE_AFTER_DELETE = 400;

      function tick() {
        const currentWord = words[wordIdx];

        if (!isDeleting) {
          charIdx++;
          heroTarget.textContent = currentWord.substring(0, charIdx);

          if (charIdx === currentWord.length) {
            isDeleting = true;
            setTimeout(tick, PAUSE_AFTER_TYPE);
            return;
          }
          setTimeout(tick, TYPE_SPEED);
        } else {
          charIdx--;
          heroTarget.textContent = currentWord.substring(0, charIdx);

          if (charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            setTimeout(tick, PAUSE_AFTER_DELETE);
            return;
          }
          setTimeout(tick, DELETE_SPEED);
        }
      }

      setTimeout(function () {
        isDeleting = true;
        tick();
      }, PAUSE_AFTER_TYPE);
    }

    /* Generic data-typewriter attribute support */
    const els = document.querySelectorAll('[data-typewriter]');
    if (!els.length) return;

    els.forEach(function (el) {
      const text = el.getAttribute('data-typewriter');
      el.textContent = '';
      let i = 0;

      const observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          function type() {
            if (i < text.length) {
              el.textContent += text.charAt(i);
              i++;
              setTimeout(type, 40);
            }
          }
          type();
          observer.unobserve(el);
        }
      }, { threshold: 0.5 });

      observer.observe(el);
    });
  }

  /* ---------- FAQ Accordion ---------- */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      const question = item.querySelector('.faq-question');
      if (!question) return;
      question.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');
        items.forEach(function (it) { it.classList.remove('open'); });
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  /* ---------- Magnetic Button Effect ---------- */
  function initMagneticButtons() {
    const btns = document.querySelectorAll('.btn-primary, .nav-cta');
    btns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translateY(-2px) translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Parallax on Hero ---------- */
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

  /* ---------- Init All ---------- */
  function init() {
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
