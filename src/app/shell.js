const root = location.pathname.startsWith('/tools/') || location.pathname.startsWith('/blog/') ? '..' : '.';

export function mountShell(active = '') {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `<a class="skip-link" href="#main">Skip to content</a><div class="header-inner"><a class="brand" href="${root}/index.html"><span class="brand-mark" aria-hidden="true">RT</span><span>ReflexTester</span></a><button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button><nav id="site-nav" aria-label="Primary"><a ${active==='test'?'aria-current="page"':''} href="${root}/tools.html?section=test">Test</a><a ${active==='train'?'aria-current="page"':''} href="${root}/tools.html?section=train">Train</a><a ${active==='utility'?'aria-current="page"':''} href="${root}/tools.html?section=utility">Utilities</a><a ${active==='results'?'aria-current="page"':''} href="${root}/dashboard.html">Results</a><a ${active==='learn'?'aria-current="page"':''} href="${root}/blog.html">Guides</a></nav></div>`;
  document.body.prepend(header);
  const button = header.querySelector('.menu-button');
  const nav = header.querySelector('nav');
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<div><a class="brand" href="${root}/index.html"><span class="brand-mark" aria-hidden="true">RT</span><span>ReflexTester</span></a><p>Browser-based performance tests and training tools. Results stay on this device.</p></div><nav aria-label="Footer"><a href="${root}/about.html">About</a><a href="${root}/contact.html">Contact</a><a href="${root}/privacy-policy.html">Privacy</a><a href="${root}/terms-of-service.html">Terms</a></nav>`;
  document.body.append(footer);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register(`${root}/sw.js`).catch(() => {});
}
