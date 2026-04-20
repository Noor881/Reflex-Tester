"""
ReflexTester Full Static Audit - ASCII safe version
"""
import os, re, json
from pathlib import Path

ROOT = Path(r'c:\Users\snowp\Reflex-Tester')

issues = []
warnings = []

def issue(msg): issues.append(msg); print('  [FAIL] ' + msg)
def warn(msg):  warnings.append(msg); print('  [WARN] ' + msg)
def ok(msg):    print('  [PASS] ' + msg)

def read(p):
    try:
        with open(p, encoding='utf-8') as f: return f.read()
    except Exception:
        with open(p, encoding='latin-1') as f: return f.read()

def find_ids_in_html(html):
    return set(re.findall(r'id=["\']([^"\']+)["\']', html))

def find_getbyid_in_js(js):
    return set(re.findall(r'getElementById\(["\']([^"\']+)["\']\)', js))

def find_queryselector_ids(js):
    return set(re.findall(r'querySelector\(["\']#([^"\'"\]]+)["\']\)', js))

def find_css_classes(css):
    return set(re.findall(r'\.([\w-]+)\s*[{,]', css))

def find_classes_in_js(js):
    adds = set(re.findall(r'classList\.(?:add|remove|toggle)\(["\']([^"\']+)["\']', js))
    return adds

def find_hrefs(html):
    return re.findall(r'(?:href|src)=["\']([^"\'#?]+)["\']', html)

css_path = ROOT / 'styles.css'
css_content = read(css_path)
css_classes = find_css_classes(css_content)

# ===================================================
print('\n' + '='*60)
print(' PHASE 1: Collecting all HTML files')
print('='*60)

all_html = (list(ROOT.glob('*.html')) +
            list((ROOT / 'tools').glob('*.html')) +
            list((ROOT / 'blog').glob('*.html')) +
            list((ROOT / 'blog').glob('**/*.html')))
print(f'  Found {len(all_html)} HTML files total')

# ===================================================
print('\n' + '='*60)
print(' PHASE 2: Meta tags - charset, viewport, title, desc, canonical')
print('='*60)

for f in sorted(all_html):
    rel = str(f.relative_to(ROOT))
    html = read(f)
    errors = []
    if '<meta charset=' not in html: errors.append('NO charset')
    if 'name="viewport"' not in html: errors.append('NO viewport')
    if '<title>' not in html: errors.append('NO title')
    if 'name="description"' not in html: errors.append('NO description')
    if 'canonical' not in html: errors.append('NO canonical')
    if errors:
        issue(rel + ' -> ' + ', '.join(errors))
    else:
        ok(rel)

# ===================================================
print('\n' + '='*60)
print(' PHASE 3: Internal links/src - no broken hrefs')
print('='*60)

broken = []
for f in sorted(all_html):
    rel = str(f.relative_to(ROOT))
    html = read(f)
    base = f.parent
    for href in find_hrefs(html):
        if href.startswith('http') or href.startswith('//') or href.startswith('mailto'): continue
        if href.startswith('data:'): continue
        target = (base / href).resolve()
        if not target.exists():
            broken.append(rel + ' -> ' + href)
            issue('BROKEN: ' + rel + ' -> ' + href)

if not broken:
    ok('All internal links valid across all ' + str(len(all_html)) + ' files')

# ===================================================
print('\n' + '='*60)
print(' PHASE 4: Tool JS getElementById vs HTML IDs')
print('='*60)

tool_files = sorted((ROOT / 'tools').glob('*.html'))
for f in tool_files:
    rel = str(f.relative_to(ROOT))
    html = read(f)
    scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', html, re.DOTALL)
    inline_js = '\n'.join(scripts)
    html_ids = find_ids_in_html(html)
    js_ids = find_getbyid_in_js(inline_js) | find_queryselector_ids(inline_js)
    missing = js_ids - html_ids
    if missing:
        issue(rel + ' -> JS refs missing IDs: ' + str(missing))
    else:
        ok(rel + ' -> all IDs found')

# ===================================================
print('\n' + '='*60)
print(' PHASE 5: CSS classes used in JS vs defined in styles.css')
print('='*60)

js_classes_used = set()
for f in list(tool_files) + list(ROOT.glob('*.html')):
    html = read(f)
    scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', html, re.DOTALL)
    js_classes_used |= find_classes_in_js('\n'.join(scripts))

for jsf in [ROOT / 'main.js', ROOT / 'nav.js']:
    js_classes_used |= find_classes_in_js(read(jsf))

ignore = {'active', 'visible', 'loading', 'hidden', 'error', 'open',
          'disabled', 'selected', 'collapsed', 'expanded', 'fade-in',
          'scrolled', 'nav-open', 'reveal', 'animated', 'go', 'ready',
          'waiting', 'result', 'correct', 'wrong', 'matched', 'unmatched'}

missing_css_classes = js_classes_used - css_classes - ignore
if missing_css_classes:
    for cls in sorted(missing_css_classes):
        warn('CSS class used in JS but not defined: .' + cls)
else:
    ok('All JS classList.add() classes defined in styles.css (' + str(len(js_classes_used)) + ' checked)')

# ===================================================
print('\n' + '='*60)
print(' PHASE 6: ReflexStore key consistency')
print('='*60)

store_gets = {}
store_sets = {}

for f in list(tool_files) + [ROOT / 'dashboard.html']:
    html = read(f)
    rel = str(f.relative_to(ROOT))
    for k in re.findall(r"ReflexStore\.get\(['\"]([^'\"]+)['\"]", html):
        store_gets.setdefault(k, []).append(rel)
    for k in re.findall(r"ReflexStore\.set\(['\"]([^'\"]+)['\"]", html):
        store_sets.setdefault(k, []).append(rel)

all_keys = set(store_gets) | set(store_sets)
print('  Total ReflexStore keys: ' + str(len(all_keys)))
for key in sorted(all_keys):
    g = store_gets.get(key, [])
    s = store_sets.get(key, [])
    if g and not s:
        warn('Key "' + key + '" READ but never SET (always returns default)')
    elif s and not g:
        warn('Key "' + key + '" SET but never READ (data saved but hidden)')
    else:
        ok('"' + key + '" -> ' + str(len(s)) + ' setter(s), ' + str(len(g)) + ' getter(s)')

# ===================================================
print('\n' + '='*60)
print(' PHASE 7: Script loading order (DOMContentLoaded wrapping)')
print('='*60)

for f in list(tool_files) + [ROOT / 'dashboard.html']:
    rel = str(f.relative_to(ROOT))
    html = read(f)
    has_dom_wrapper = "document.addEventListener('DOMContentLoaded'" in html
    raw_iife = bool(re.search(r'<script>\s*\(function\s*\(\)', html))
    has_main = 'main.js' in html

    if raw_iife:
        issue(rel + ' -> inline IIFE without DOMContentLoaded (ReflexStore crash!)')
    elif has_dom_wrapper and has_main:
        ok(rel + ' -> DOMContentLoaded wrapper present')
    elif not has_main:
        warn(rel + ' -> no main.js reference found')

# ===================================================
print('\n' + '='*60)
print(' PHASE 8: Game logic verification')
print('='*60)

checks = [
    ('tools/click-speed-test.html',       "return; // Don't count the start click",    'start-click excluded'),
    ('tools/audio-reflex-test.html',      'audioCtx.resume()',                          'AudioContext.resume() present'),
    ('tools/typing-speed-test.html',      'typingComplete',                             'completion banner present'),
    ('tools/visual-reflex-test.html',     "result' ? 'waiting'",                        "result->waiting CSS mapping"),
    ('tools/stroop-effect-test.html',     'startBtn.disabled = false',                  'reset re-enables startBtn'),
    ('tools/hand-eye-coordination-test.html', "target.style.display !== 'none'",       'miss-click logic correct'),
    ('tools/peripheral-vision-test.html', 'peripheral-start-btn',                       'mobile start button present'),
    ('tools/memory-sequence-test.html',   'playerIndex = 0; // Reset input index',      'playerIndex reset in showSequence'),
    ('tools/color-match-test.html',       'startBtn.focus()',                           'color-match re-focuses start btn'),
    ('tools/number-speed-test.html',      "state === 'waiting'",                        'waiting state defined'),
]

for fname, needle, label in checks:
    content = read(ROOT / fname)
    if needle in content:
        ok(fname + ' -> ' + label)
    else:
        issue(fname + ' -> MISSING: ' + label)

# ===================================================
print('\n' + '='*60)
print(' PHASE 9: Nav structure - All Tools CTA link')
print('='*60)

bad_cta = []
for f in sorted(all_html):
    rel = str(f.relative_to(ROOT))
    html = read(f)
    if 'href="index.html#tools"' in html or 'href="../index.html#tools"' in html:
        bad_cta.append(rel)
        issue(rel + ' -> "All Tools" still points to index.html#tools')
    if 'nav-cta' not in html:
        warn(rel + ' -> no nav-cta button')

if not bad_cta:
    ok('All pages use tools.html for "All Tools" nav CTA')

# ===================================================
print('\n' + '='*60)
print(' PHASE 10: CSS variable usage')
print('='*60)

var_defs = set(re.findall(r'--([\w-]+)\s*:', css_content))
var_uses = set(re.findall(r'var\(--([\w-]+)\)', css_content))
for f in all_html:
    var_uses.update(re.findall(r'var\(--([\w-]+)\)', read(f)))

undef_vars = var_uses - var_defs
if undef_vars:
    for v in sorted(undef_vars):
        issue('Undefined CSS variable used: --' + v)
else:
    ok('All CSS variables defined (' + str(len(var_defs)) + ' defined, ' + str(len(var_uses)) + ' unique usages)')

# ===================================================
print('\n' + '='*60)
print(' PHASE 11: Encoding check - no mojibake')
print('='*60)

# Only C1 control characters (U+0080 to U+009F) indicate true Windows-1252 mojibake
# U+00A0 (non-breaking space), emoji, and other Unicode are NOT mojibake
mojibake_found = False
for f in all_html:
    rel = str(f.relative_to(ROOT))
    try:
        content = f.read_text(encoding='utf-8')
        c1_chars = [c for c in content if 0x80 <= ord(c) <= 0x9F]
        if c1_chars:
            issue('MOJIBAKE in ' + rel + ' -> C1 control chars: ' + repr(c1_chars[:3]))
            mojibake_found = True
    except UnicodeDecodeError:
        issue('ENCODING ERROR (not valid UTF-8): ' + rel)
        mojibake_found = True
    except Exception as e:
        warn('Could not read ' + rel + ': ' + str(e))

if not mojibake_found:
    ok('No mojibake found in any HTML file')

# ===================================================
print('\n' + '='*60)
print(' PHASE 12: Dashboard required elements')
print('='*60)

dash = read(ROOT / 'dashboard.html')
dash_ids = find_ids_in_html(dash)
dash_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', dash, re.DOTALL)
dash_js = '\n'.join(dash_scripts)

required_ids = ['visualBest', 'audioBest', 'cpsBest', 'typingBest',
                'memoryBest', 'historyContainer', 'clearBtn']
for rid in required_ids:
    in_html = rid in dash_ids
    in_js   = rid in dash_js
    if not in_html:
        issue('dashboard: HTML missing #' + rid)
    elif not in_js:
        warn('dashboard: JS does not reference #' + rid)
    else:
        ok('dashboard: #' + rid + ' present in HTML + JS')

# ===================================================
print('\n' + '='*60)
print(' PHASE 13: vercel.json validation')
print('='*60)

vp = ROOT / 'vercel.json'
try:
    vercel = json.loads(read(vp))
    for i, h in enumerate(vercel.get('headers', [])):
        src = h.get('source', '')
        if ('|' in src and '(' in src) or '(*.' in src:
            issue('vercel.json header[' + str(i) + '] bad pattern: ' + src)
        else:
            ok('vercel.json header[' + str(i) + '] OK: ' + src)
    ok('vercel.json is valid JSON')
except Exception as e:
    issue('vercel.json error: ' + str(e))

# ===================================================
print('\n' + '='*60)
print(' PHASE 14: main.js & nav.js structure')
print('='*60)

main_js = read(ROOT / 'main.js')
nav_js = read(ROOT / 'nav.js')

checks_js = [
    (main_js, 'window.ReflexStore',       'main.js: ReflexStore defined on window'),
    (main_js, 'initTypewriter',            'main.js: typewriter function present'),
    (main_js, 'initCounters',              'main.js: counter animation present'),
    (main_js, 'initScrollReveals',         'main.js: scroll reveal present'),
    (nav_js,  'navToggle',                 'nav.js: mobile toggle handler'),
    (nav_js,  'scroll-progress',           'nav.js: scroll progress bar'),
    (nav_js,  '__navAlreadyInjected',       'nav.js: injection guard present'),
]
for (src, needle, label) in checks_js:
    if needle in src:
        ok(label)
    else:
        issue('MISSING: ' + label)

# ===================================================
print('\n' + '='*60)
print(' PHASE 15: Blog article count & structure')
print('='*60)

blog_html = list((ROOT / 'blog').glob('*.html'))
print('  Blog articles found: ' + str(len(blog_html)))
blog_issues = 0
for f in sorted(blog_html):
    rel = str(f.relative_to(ROOT))
    html = read(f)
    errs = []
    if '<h1' not in html: errs.append('no h1')
    if 'schema.org' not in html: errs.append('no schema.org')
    if 'canonical' not in html: errs.append('no canonical')
    if errs:
        warn(rel + ' -> ' + ', '.join(errs))
        blog_issues += 1

if blog_issues == 0:
    ok('All ' + str(len(blog_html)) + ' blog articles pass structural checks')

# ===================================================
print('\n\n' + '='*60)
print(' FINAL SUMMARY')
print('='*60)
print('  Files audited: ' + str(len(all_html)) + ' HTML files + CSS + JS + vercel.json')
print('  ISSUES  (must fix): ' + str(len(issues)))
print('  WARNINGS (review): ' + str(len(warnings)))

if issues:
    print('\n--- ISSUES TO FIX ---')
    for i, iss in enumerate(issues, 1):
        print('  {:02d}. {}'.format(i, iss))

if warnings:
    print('\n--- WARNINGS ---')
    for i, w in enumerate(warnings, 1):
        print('  {:02d}. {}'.format(i, w))

if not issues and not warnings:
    print('\n  ALL CLEAN - No issues found!')
elif not issues:
    print('\n  No critical issues - only warnings to review.')
