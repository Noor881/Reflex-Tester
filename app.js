/* ============================================================
   ReflexTester.fun — Shared App Logic
   Navigation, Active Links, Mobile Menu, Utilities
   ============================================================ */

(function () {
    'use strict';

    /* ---------- Mobile Nav Toggle ---------- */
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

    /* ---------- Active Nav Link ---------- */
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-link');
        links.forEach(function (link) {
            const href = link.getAttribute('href');
            if (!href) return;
            const linkPath = new URL(href, window.location.origin).pathname;
            if (currentPath === linkPath || (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
                link.classList.add('active');
            }
        });
    }

    /* ---------- Smooth Scroll for Anchor Links ---------- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* ---------- LocalStorage Helpers ---------- */
    window.ReflexStore = {
        get: function (key, fallback) {
            try {
                const val = localStorage.getItem('reflex_' + key);
                return val !== null ? JSON.parse(val) : fallback;
            } catch (err) {
                return fallback;
            }
        },
        set: function (key, value) {
            try {
                localStorage.setItem('reflex_' + key, JSON.stringify(value));
            } catch (err) {
                // Storage full or unavailable
            }
        }
    };

    /* ---------- Utility: Format ms ---------- */
    window.formatMs = function (ms) {
        return ms + 'ms';
    };

    /* ---------- Utility: Format Seconds ---------- */
    window.formatSec = function (sec) {
        return sec.toFixed(1) + 's';
    };

    /* ---------- Init ---------- */
    function init() {
        initMobileNav();
        setActiveNavLink();
        initSmoothScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
