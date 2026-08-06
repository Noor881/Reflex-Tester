/* ============================================================
   nav.js - Shared Navigation (single source of truth)
   Injects nav + footer only if not already present in HTML
   ============================================================ */

(function () {
  if (window.__navAlreadyInjected) return;
  window.__navAlreadyInjected = true;

  const path = window.location.pathname;
  const inBlog = path.includes('/blog/');
  const inTools = path.includes('/tools/');
  const base = inBlog || inTools ? '../' : '';

  const fontHref = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
  if (!document.querySelector('link[href*="Plus+Jakarta+Sans"]')) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = fontHref;
    document.head.appendChild(fontLink);
  }

  // AdMaven Integration
  if (!document.querySelector('meta[name="admaven-placement"]')) {
    const adMeta = document.createElement('meta');
    adMeta.name = 'admaven-placement';
    adMeta.content = 'BqjsEqTU5';
    document.head.appendChild(adMeta);
  }

  const adScripts = ['1515369'];
  adScripts.forEach(id => {
    if (!document.querySelector(`script[src*="${id}"]`)) {
      const s = document.createElement('script');
      s.dataset.cfasync = 'false';
      s.src = `//dcbbwymp1bhlf.cloudfront.net/?wbbcd=${id}`;
      document.head.appendChild(s);
    }
  });

  function isActive(href) {
    const full = base + href;
    return path.endsWith(full) || path.endsWith(href);
  }

  const navHTML = `
    <a href="#main" class="skip-link">Skip to content</a>
    <div class="scroll-progress" aria-hidden="true"></div>
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <div class="nav-inner">
        <a href="${base}index.html" class="nav-logo">
          <span class="logo-icon" aria-hidden="true">RT</span>
          <span><span class="logo-gradient">Reflex</span>Tester</span>
        </a>
        <div class="nav-menu" id="navMenu">
          <a href="${base}index.html" class="nav-link${isActive('index.html') ? ' active' : ''}">Home</a>
          <a href="${base}dashboard.html" class="nav-link${isActive('dashboard.html') ? ' active' : ''}">Dashboard</a>
          <a href="${base}blog.html" class="nav-link${isActive('blog.html') ? ' active' : ''}">Blog</a>
          <a href="${base}about.html" class="nav-link${isActive('about.html') ? ' active' : ''}">About</a>
          <a href="${base}contact.html" class="nav-link${isActive('contact.html') ? ' active' : ''}">Contact</a>
          <a href="${base}tools.html" class="nav-cta">All Tools</a>
        </div>
        <button type="button" class="nav-toggle" id="navToggle" aria-label="Toggle navigation menu" aria-expanded="false">&#9776;</button>
      </div>
    </nav>
  `;

  const footerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-section">
            <h4>ReflexTester.fun</h4>
            <p>Professional reflex testing and aim training platform. Free forever, no sign-up required.</p>
            <div class="footer-social" aria-label="Social links">
              <a href="${base}contact.html" aria-label="Contact ReflexTester">RT</a>
              <a href="${base}blog.html" aria-label="Read the ReflexTester blog">BL</a>
              <a href="${base}tools.html" aria-label="Browse ReflexTester tools">TL</a>
            </div>
          </div>
          <div class="footer-section">
            <h4>Reflex Tests</h4>
            <ul>
              <li><a href="${base}tools/visual-reflex-test.html">Visual Reflex Test</a></li>
              <li><a href="${base}tools/audio-reflex-test.html">Audio Reflex Test</a></li>
              <li><a href="${base}tools/reaction-comparison-test.html">Reaction Comparison</a></li>
              <li><a href="${base}tools/click-speed-test.html">Click Speed Test</a></li>
              <li><a href="${base}tools/color-match-test.html">Color Match Test</a></li>
              <li><a href="${base}tools/peripheral-vision-test.html">Peripheral Vision</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Aim Trainers</h4>
            <ul>
              <li><a href="${base}tools/valorant-aim-trainer.html">Valorant Aim Trainer</a></li>
              <li><a href="${base}tools/csgo-aim-trainer.html">CS2 Aim Trainer</a></li>
              <li><a href="${base}tools/apex-aim-trainer.html">Apex Aim Trainer</a></li>
              <li><a href="${base}tools/cod-aim-trainer.html">COD Aim Trainer</a></li>
              <li><a href="${base}tools/fortnite-aim-trainer.html">Fortnite Aim Trainer</a></li>
              <li><a href="${base}tools/gridshot-arena.html">Gridshot Arena</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="${base}tools.html">All Tools</a></li>
              <li><a href="${base}blog.html">Blog</a></li>
              <li><a href="${base}dashboard.html">Dashboard</a></li>
              <li><a href="${base}about.html">About</a></li>
              <li><a href="${base}contact.html">Contact</a></li>
              <li><a href="${base}privacy-policy.html">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025-2026 ReflexTester.fun - Professional Reflex Testing Platform. All rights reserved.</p>
          <div class="footer-tags">
            <span class="footer-tag">Reflex Tester</span>
            <span class="footer-tag">Aim Trainer</span>
            <span class="footer-tag">Reaction Time</span>
            <span class="footer-tag">Valorant</span>
            <span class="footer-tag">CS2</span>
            <span class="footer-tag">Fortnite</span>
          </div>
        </div>
      </div>
    </footer>
  `;

  if (!document.querySelector('nav.nav')) {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  }

  if (!document.querySelector('footer.footer')) {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }
})();
