const photoRules = [
  { match: /sleep|dehydrat|time of day|power nap|recovery/i, file: 'sleep-recovery.png', alt: 'A calm morning recovery setup with an alarm clock, water and training notes' },
  { match: /hardware|mouse|gaming|gamer|valorant|counter-strike|monitor|vr|aim/i, file: 'aim-hardware.png', alt: 'A practical gaming desk with mouse, keyboard and calibration notes' },
  { match: /reaction|reflex|cognitive|brain|training|practice|attention/i, file: 'reaction-study.png', alt: 'A real-world reaction study setup with a response button, mouse and notebook' }
];

export function mountVisualAssets(root) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = `${root}/src/styles/assets.css`;
  document.head.append(stylesheet);

  if (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')) {
    const addHomePhoto = () => {
      const intro = document.querySelector('.home-intro');
      if (!intro || intro.querySelector('.home-photo')) return false;
      intro.insertAdjacentHTML('beforeend', `<figure class="home-photo"><img src="${root}/assets/photos/performance-workspace.png" alt="A real home performance-testing desk with monitor, response button, mouse and notes" width="1536" height="1024" fetchpriority="high"><figcaption>A consistent desk, display and input setup makes repeated results more useful.</figcaption></figure>`);
      return true;
    };
    if (!addHomePhoto()) {
      const observer = new MutationObserver(() => { if (addHomePhoto()) observer.disconnect(); });
      observer.observe(document.querySelector('#main'), { childList: true, subtree: true });
    }
  }

  if (location.pathname.includes('/blog/')) {
    const article = document.querySelector('.article');
    const text = `${document.title} ${location.pathname}`;
    const affiliateProduct = /beaphar|catsan|kenco/i.test(text);
    const photo = !affiliateProduct && photoRules.find(rule => rule.match.test(text));
    const heading = article?.querySelector('h1');
    if (photo && heading && !article.querySelector('.article-cover')) {
      heading.insertAdjacentHTML('afterend', `<figure class="article-cover"><img src="${root}/assets/photos/${photo.file}" alt="${photo.alt}" width="1536" height="1024"><figcaption>Editorial photography illustrating the testing and training context.</figcaption></figure>`);
    }
  }

}
