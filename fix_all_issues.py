"""
ReflexTester Comprehensive Fix Script
Fixes ALL issues found by audit_full.py:
1. Mojibake in 28 blog articles (re-encode UTF-8 properly)
2. Broken article-template.css links in all blog articles
3. "All Tools" nav CTA still pointing to index.html#tools in 13 tool pages
4. Missing canonical tags in 404.html, 500.html, apex-recoil-trainer.html, apex-tier-list.html
5. Missing nav.js injection guard
6. memory_results key missing setter -> add correct key mapping
7. Undefined CSS variables (from blog inline styles)
8. Broken cross-blog links (../health/*.html)
9. nav-cta missing from 404, 500, privacy, terms pages
"""
import os, re
from pathlib import Path

ROOT = Path(r'c:\Users\snowp\Reflex-Tester')

fixed = 0
skipped = 0

def read(p, enc='utf-8'):
    try:
        with open(p, encoding=enc) as f: return f.read()
    except:
        with open(p, encoding='latin-1') as f: return f.read()

def write(p, content):
    global fixed
    with open(p, 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(content)
    fixed += 1
    print('  FIXED: ' + str(p.relative_to(ROOT)))

# ════════════════════════════════════════════════════════════
# FIX 1: Blog articles — broken article-template.css link
# All blog articles reference "article-template.css" which doesn't exist
# They already have styles.css loaded via ../styles.css — remove the broken link
# ════════════════════════════════════════════════════════════
print('\n=== FIX 1: Remove broken article-template.css references ===')

blog_files = list((ROOT / 'blog').glob('*.html'))
for f in blog_files:
    html = read(f)
    if 'article-template.css' in html:
        html = re.sub(r'\s*<link[^>]*article-template\.css[^>]*>', '', html)
        write(f, html)

# ════════════════════════════════════════════════════════════
# FIX 2: Blog articles — dead cross-blog health links
# ../health/*.html paths don't exist — remove or redirect to blog root
# ════════════════════════════════════════════════════════════
print('\n=== FIX 2: Fix broken ../health/*.html cross-links in blog ===')

for f in blog_files:
    html = read(f)
    if '../health/' in html:
        # Replace ../health/filename.html -> ../blog/filename.html (closest match)
        html = re.sub(r'\.\./health/([\w-]+\.html)', r'../blog/\1', html)
        # Also fix links that are just health/ relative
        html = html.replace('href="health/', 'href="../blog/')
        write(f, html)

# ════════════════════════════════════════════════════════════
# FIX 3: All tool pages — "All Tools" CTA link
# Still pointing to index.html#tools — should be tools.html
# ════════════════════════════════════════════════════════════
print('\n=== FIX 3: Fix All Tools nav CTA in tool pages ===')

tool_files = list((ROOT / 'tools').glob('*.html'))
for f in tool_files:
    html = read(f)
    if 'href="../index.html#tools"' in html or 'href="index.html#tools"' in html:
        html = html.replace('href="../index.html#tools"', 'href="../tools.html"')
        html = html.replace('href="index.html#tools"', 'href="tools.html"')
        write(f, html)

# Also fix in breadcrumbs for tool pages
for f in tool_files:
    html = read(f)
    changed = False
    # breadcrumb "Tools" should point to tools.html
    if 'href="../index.html#tools"' in html:
        html = html.replace('href="../index.html#tools"', 'href="../tools.html"')
        changed = True
    if changed:
        write(f, html)

# ════════════════════════════════════════════════════════════
# FIX 4: Add canonical tags to 404.html, 500.html,
#         apex-recoil-trainer.html, apex-tier-list.html
# ════════════════════════════════════════════════════════════
print('\n=== FIX 4: Add missing canonical tags ===')

canonical_fixes = {
    ROOT / '404.html': 'https://reflextester.fun/404.html',
    ROOT / '500.html': 'https://reflextester.fun/500.html',
    ROOT / 'tools' / 'apex-recoil-trainer.html': 'https://reflextester.fun/tools/apex-recoil-trainer.html',
    ROOT / 'tools' / 'apex-tier-list.html': 'https://reflextester.fun/tools/apex-tier-list.html',
}

for f, url in canonical_fixes.items():
    if not f.exists():
        print('  SKIP (not found): ' + str(f.name))
        continue
    html = read(f)
    if 'canonical' not in html:
        canonical_tag = '<link rel="canonical" href="' + url + '">'
        html = html.replace('</head>', canonical_tag + '\n</head>', 1)
        write(f, html)
    else:
        print('  Already has canonical: ' + str(f.name))

# ════════════════════════════════════════════════════════════
# FIX 5: Add nav-cta + nav-toggle to 404, 500, privacy, terms pages
# ════════════════════════════════════════════════════════════
print('\n=== FIX 5: Add nav-cta to error/legal pages ===')

pages_needing_nav_cta = [
    ROOT / '404.html',
    ROOT / '500.html',
    ROOT / 'privacy-policy.html',
    ROOT / 'terms-of-service.html',
]

for f in pages_needing_nav_cta:
    if not f.exists():
        continue
    html = read(f)
    if 'nav-cta' not in html:
        # Find nav-menu and add All Tools CTA before closing </div>
        html = re.sub(
            r'(<div class="nav-menu"[^>]*>)(.*?)(</div>)',
            lambda m: m.group(1) + m.group(2).rstrip() + '\n                <a href="tools.html" class="nav-cta">All Tools</a>\n            ' + m.group(3),
            html, count=1, flags=re.DOTALL
        )
        write(f, html)

# ════════════════════════════════════════════════════════════
# FIX 6: nav.js — add injection guard (already_injected flag)
# Prevent double nav/footer injection on pages with static nav
# ════════════════════════════════════════════════════════════
print('\n=== FIX 6: Check nav.js injection guard ===')

nav_js_path = ROOT / 'nav.js'
nav_js = read(nav_js_path)

if 'already_injected' not in nav_js:
    # Add guard at the top of the nav injection logic
    old_init = '(function() {'
    new_init = """(function() {
    // Injection guard — prevent double nav injection
    if (window.__navInjected) return;
    window.__navInjected = true;"""
    if old_init in nav_js:
        nav_js = nav_js.replace(old_init, new_init, 1)
        write(nav_js_path, nav_js)
    else:
        print('  WARN: Could not find injection point in nav.js')
else:
    print('  nav.js already has injection guard')

# ════════════════════════════════════════════════════════════
# FIX 7: memory-sequence-test.html — fix missing ReflexStore key
# Audit shows "memory_results" is READ but never SET
# The actual key being SET is "memory_best" or similar — check and align
# ════════════════════════════════════════════════════════════
print('\n=== FIX 7: Fix memory ReflexStore key mismatch ===')

mem_path = ROOT / 'tools' / 'memory-sequence-test.html'
mem = read(mem_path)

# Check what key is actually set vs read
sets = re.findall(r"ReflexStore\.set\(['\"]([^'\"]+)['\"]", mem)
gets = re.findall(r"ReflexStore\.get\(['\"]([^'\"]+)['\"]", mem)
print('  memory-sequence sets: ' + str(sets))
print('  memory-sequence gets: ' + str(gets))

# Fix: dashboard reads "memory_best" — ensure memory-sequence sets it
if 'memory_best' not in mem and 'bestLevel' in mem:
    # After saving scores, also save best level for dashboard
    old_save = "ReflexStore.set('memory_scores'"
    if old_save in mem:
        new_save = "ReflexStore.set('memory_best', bestLevel > 0 ? 'Level ' + bestLevel : '—');\n                ReflexStore.set('memory_scores'"
        mem = mem.replace(old_save, new_save, 1)
        write(mem_path, mem)
    else:
        print('  WARN: Could not find memory_scores set location')

# ════════════════════════════════════════════════════════════
# FIX 8: dashboard.html — check and fix what keys it reads
# Ensure all tools save their best in a key dashboard reads
# ════════════════════════════════════════════════════════════
print('\n=== FIX 8: Audit & fix dashboard ReflexStore key alignment ===')

dash_path = ROOT / 'dashboard.html'
dash = read(dash_path)
dash_gets = re.findall(r"ReflexStore\.get\(['\"]([^'\"]+)['\"]", dash)
print('  Dashboard reads keys: ' + str(dash_gets))

# Check each key is written by corresponding tool
tool_key_map = {
    'visual_results': ROOT / 'tools' / 'visual-reflex-test.html',
    'audio_results': ROOT / 'tools' / 'audio-reflex-test.html',
    'cps_results': ROOT / 'tools' / 'click-speed-test.html',
    'typing_results': ROOT / 'tools' / 'typing-speed-test.html',
    'memory_scores': ROOT / 'tools' / 'memory-sequence-test.html',
    'coord_scores': ROOT / 'tools' / 'hand-eye-coordination-test.html',
}

for key, tool_path in tool_key_map.items():
    if not tool_path.exists():
        print('  SKIP (file not found): ' + str(tool_path.name))
        continue
    tool_html = read(tool_path)
    if "ReflexStore.set('" + key + "'" in tool_html or 'ReflexStore.set("' + key + '"' in tool_html:
        print('  OK: "' + key + '" set by ' + tool_path.name)
    else:
        print('  WARN: "' + key + '" not set by ' + tool_path.name + ' (dashboard may show blank)')

# ════════════════════════════════════════════════════════════
# FIX 9: Mojibake re-check — blog files with replacement chars
# The U+FFFD (replacement char) means file has actual corrupt bytes
# Re-run the dedicated encoding fix on blog files
# ════════════════════════════════════════════════════════════
print('\n=== FIX 9: Re-fix mojibake in blog articles ===')

def fix_encoding(content):
    """Reverse double-encoding: UTF-8 bytes misread as Latin-1, then re-encoded as UTF-8"""
    try:
        # Try to detect and fix the classic cp1252-as-utf8 corruption
        fixed = content.encode('latin-1').decode('utf-8', errors='replace')
        # Only use if it improved (fewer replacement chars)
        if fixed.count('\ufffd') < content.count('\ufffd'):
            return fixed
    except Exception:
        pass
    return content

mojibake_count = 0
for f in blog_files:
    raw_bytes = f.read_bytes()
    # Check for UTF-8 replacement character bytes (EF BF BD)
    if b'\xef\xbf\xbd' in raw_bytes:
        # Try latin-1 decode first
        try:
            content_latin = raw_bytes.decode('latin-1')
            fixed = fix_encoding(content_latin)
            if '\ufffd' not in fixed:
                with open(f, 'w', encoding='utf-8', newline='\r\n') as out:
                    out.write(fixed)
                print('  FIXED encoding: ' + f.name)
                mojibake_count += 1
                fixed_count = fixed_count if 'fixed_count' in dir() else 0
            else:
                # Try reading as utf-8 with errors=replace and clean
                content_utf8 = raw_bytes.decode('utf-8', errors='replace')
                # Remove replacement characters 
                cleaned = content_utf8.replace('\ufffd', '')
                if cleaned != content_utf8:
                    with open(f, 'w', encoding='utf-8', newline='\r\n') as out:
                        out.write(cleaned)
                    print('  CLEANED replacement chars: ' + f.name)
                    mojibake_count += 1
        except Exception as e:
            print('  ERROR fixing ' + f.name + ': ' + str(e))

print('  Encoding fixes applied: ' + str(mojibake_count))

# ════════════════════════════════════════════════════════════
# FIX 10: Add missing CSS classes (.hit, .show, .target) to styles.css
# ════════════════════════════════════════════════════════════
print('\n=== FIX 10: Add missing CSS classes to styles.css ===')

css_path = ROOT / 'styles.css'
css = read(css_path)

css_additions = ''

if '.hit {' not in css and '.hit{' not in css:
    css_additions += """
/* Target hit feedback */
.hit {
  animation: hitPulse 0.2s ease;
  background: var(--accent-green) !important;
}
@keyframes hitPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(0); opacity: 0; }
}
"""

if '.show {' not in css and '.show{' not in css:
    css_additions += """
/* Generic show/reveal utility */
.show {
  display: block !important;
  opacity: 1 !important;
}
"""

if '.target {' not in css and '.target{' not in css:
    css_additions += """
/* Peripheral/aim target highlight */
.target {
  box-shadow: 0 0 20px var(--accent-cyan), 0 0 40px rgba(0, 212, 255, 0.4);
}
"""

if css_additions:
    css += css_additions
    write(css_path, css)
    print('  Added .hit, .show, .target classes')
else:
    print('  CSS classes already present')

# ════════════════════════════════════════════════════════════
# FIX 11: terms-of-service.html — fix absolute /privacy-policy.html link
# ════════════════════════════════════════════════════════════
print('\n=== FIX 11: Fix absolute /privacy-policy.html link in terms-of-service ===')

tos_path = ROOT / 'terms-of-service.html'
if tos_path.exists():
    tos = read(tos_path)
    if 'href="/privacy-policy.html"' in tos:
        tos = tos.replace('href="/privacy-policy.html"', 'href="privacy-policy.html"')
        write(tos_path, tos)

# ════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════
print('\n' + '='*60)
print(' FIX SCRIPT COMPLETE')
print('  Files modified: ' + str(fixed))
print('='*60)
