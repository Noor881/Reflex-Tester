/* ============================================================
   nav.js — Shared Navigation (single source of truth)
   Injects nav + footer only if not already present in HTML
   ============================================================ */

(function () {
  const path = window.location.pathname;
  const inBlog = path.includes('/blog/');
  const inTools = path.includes('/tools/');
  const base = inBlog || inTools ? '../' : '';

  // Active link detection
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
          <span class="logo-icon">⚡</span> ReflexTester
        </a>
        <div class="nav-menu" id="navMenu">
          <a href="${base}index.html" class="nav-link${isActive('index.html') ? ' active' : ''}">Home</a>
          <a href="${base}dashboard.html" class="nav-link${isActive('dashboard.html') ? ' active' : ''}">Dashboard</a>
          <a href="${base}blog.html" class="nav-link${isActive('blog.html') ? ' active' : ''}">Blog</a>
          <a href="${base}about.html" class="nav-link${isActive('about.html') ? ' active' : ''}">About</a>
          <a href="${base}contact.html" class="nav-link${isActive('contact.html') ? ' active' : ''}">Contact</a>
          <a href="${base}tools.html" class="nav-cta">All Tools</a>
        </div>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation menu" aria-expanded="false">☰</button>
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
          </div>
          <div class="footer-section">
            <h4>Reflex Tests</h4>
            <ul>
              <li><a href="${base}tools/visual-reflex-test.html">Visual Reflex Test</a></li>
              <li><a href="${base}tools/audio-reflex-test.html">Audio Reflex Test</a></li>
              <li><a href="${base}tools/memory-sequence-test.html">Memory Sequence</a></li>
              <li><a href="${base}tools/color-match-test.html">Color Match Test</a></li>
              <li><a href="${base}tools/click-speed-test.html">Click Speed (CPS)</a></li>
              <li><a href="${base}tools/typing-speed-test.html">Typing Speed Test</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Aim Trainers</h4>
            <ul>
              <li><a href="${base}tools/csgo-aim-trainer.html">CS:GO Aim Trainer</a></li>
              <li><a href="${base}tools/cod-aim-trainer.html">COD Aim Trainer</a></li>
              <li><a href="${base}tools/fortnite-aim-trainer.html">Fortnite Aim Trainer</a></li>
              <li><a href="${base}tools/valorant-aim-trainer.html">Valorant Aim Trainer</a></li>
              <li><a href="${base}tools/apex-aim-trainer.html">Apex Aim Trainer</a></li>
              <li><a href="${base}tools/flick-shot-trainer.html">Flick Shot Trainer</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="${base}blog.html">Blog</a></li>
              <li><a href="${base}dashboard.html">Dashboard</a></li>
              <li><a href="${base}about.html">About Us</a></li>
              <li><a href="${base}contact.html">Contact</a></li>
              <li><a href="${base}privacy-policy.html">Privacy Policy</a></li>
              <li><a href="${base}terms-of-service.html">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 ReflexTester.fun — Professional Reflex Testing Platform. All rights reserved.</p>
          <div class="footer-tags">
            <span class="footer-tag">Reflex Tester</span>
            <span class="footer-tag">Aim Trainer</span>
            <span class="footer-tag">Reaction Time</span>
            <span class="footer-tag">CS:GO</span>
            <span class="footer-tag">Fortnite</span>
            <span class="footer-tag">COD</span>
          </div>
        </div>
      </div>
    </footer>
  `;
  // Only inject nav if page doesn't already have one
  if (!document.querySelector('nav.nav')) {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  }

  // Inject footer before end of body (if no footer already present)
  if (!document.querySelector('footer.footer')) {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }

  // Mobile toggle — handled by main.js initMobileNav()
  // Scroll progress bar — handled by main.js initScrollProgress()
})();
