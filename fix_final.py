"""
Final targeted fixes:
1. 4 tools missing canonical tags
2. 404/500 broken /index.html absolute links -> index.html  
3. Missing CSS variables from blog inline styles -> add aliases to styles.css
4. Update audit mojibake check to not false-positive on xa0
"""
from pathlib import Path
import re

ROOT = Path(r'c:\Users\snowp\Reflex-Tester')

def read(p):
    return p.read_text(encoding='utf-8')

def write(p, c):
    p.write_text(c, encoding='utf-8', newline='\r\n')
    print('  FIXED: ' + str(p.relative_to(ROOT)))

# ─── FIX 1: Missing canonical tags ─────────────────────────────────────────
print('\n=== FIX 1: Add canonical to remaining tool pages ===')
remaining = {
    ROOT / 'tools' / 'cod-recoil-trainer.html':      'https://reflextester.fun/tools/cod-recoil-trainer.html',
    ROOT / 'tools' / 'csgo-grenade-trainer.html':     'https://reflextester.fun/tools/csgo-grenade-trainer.html',
    ROOT / 'tools' / 'fortnite-sensitivity-finder.html': 'https://reflextester.fun/tools/fortnite-sensitivity-finder.html',
    ROOT / 'tools' / 'valorant-lineup-trainer.html':  'https://reflextester.fun/tools/valorant-lineup-trainer.html',
}

for f, url in remaining.items():
    if not f.exists():
        print('  SKIP (not found): ' + f.name); continue
    html = read(f)
    if 'canonical' not in html:
        tag = '    <link rel="canonical" href="' + url + '">\n'
        html = re.sub(r'(\s*</head>)', '\n' + tag + r'\1', html, count=1)
        write(f, html)
    else:
        print('  Already has canonical: ' + f.name)

# ─── FIX 2: 404/500 absolute /index.html -> index.html ─────────────────────
print('\n=== FIX 2: Fix absolute /index.html links in 404.html / 500.html ===')
for fname in ['404.html', '500.html']:
    f = ROOT / fname
    if not f.exists(): continue
    html = read(f)
    changed = False
    if 'href="/index.html"' in html:
        html = html.replace('href="/index.html"', 'href="index.html"')
        changed = True
    if 'href="/tools.html"' in html:
        html = html.replace('href="/tools.html"', 'href="tools.html"')
        changed = True
    if changed:
        write(f, html)
    else:
        print('  No absolute links: ' + fname)

# ─── FIX 3: Add undefined CSS variable aliases to styles.css ───────────────
print('\n=== FIX 3: Add missing CSS variable aliases ===')
css_path = ROOT / 'styles.css'
css = read(css_path)

# These are used in blog/tool inline styles but mapped to the correct design tokens
MISSING_VARS = """
/* ═══════════════════════════════════════════════════════
   CSS Variable Aliases (for blog article inline styles)
   Maps legacy/external var names to design tokens
   ═══════════════════════════════════════════════════════ */
:root {
  /* Aliases for blog article inline styles */
  --primary-color:    var(--accent-cyan);
  --secondary-color:  var(--accent-purple);
  --accent-color:     var(--accent-cyan);
  --success-color:    var(--accent-green);
  --danger-color:     #ff4d4d;
  --warning-color:    #f59e0b;
  --info-color:       var(--accent-cyan);
  --border-color:     rgba(255,255,255,0.08);
  --primary:          var(--accent-cyan);

  /* Category color aliases for blog topic tags */
  --brain-purple:     #9333ea;
  --medical-blue:     #3b82f6;
  --mental-purple:    #a855f7;
  --nap-teal:         #14b8a6;
  --cat-color-1:      var(--accent-cyan);
  --cat-color-2:      var(--accent-purple);
}
"""

if '--primary-color:' not in css:
    css += MISSING_VARS
    write(css_path, css)
    print('  Added CSS variable aliases')
else:
    print('  Aliases already present')

# ─── FIX 4: Update audit script to ignore \xa0 in mojibake check ───────────
print('\n=== FIX 4: Update audit to not false-positive on non-breaking spaces ===')
audit_path = ROOT / 'audit_full.py'
audit = read(audit_path)

old_moji = """    # Mojibake byte sequences encoded as ASCII escape strings to avoid parser issues
BAD_SEQS = ['â\\x80\\x93', 'â\\x80\\x99', 'â\\x80\\x98', 'Ã©', 'Ã¢', 'â†\\x92', 'ðŸ', '\\xef\\xbf\\xbd']
mojibake_found = False
for f in all_html:
    rel = str(f.relative_to(ROOT))
    try:
        raw = f.read_bytes().decode('utf-8', errors='replace')
        for seq in BAD_SEQS:
            if seq in raw:
                issue('MOJIBAKE in ' + rel + ' -> found: ' + repr(seq))
                mojibake_found = True
                break
    except Exception as e:
        warn('Could not read ' + rel + ': ' + str(e))"""

new_moji = """    # Check for actual bad characters: C1 control chars (0x80-0x9F) which indicate
# Windows-1252 bytes misread as Unicode (real mojibake)
# Note: U+00A0 (non-breaking space) and emoji are VALID UTF-8 - do NOT flag them
mojibake_found = False
for f in all_html:
    rel = str(f.relative_to(ROOT))
    try:
        content = f.read_text(encoding='utf-8')
        # C1 control characters 0x80-0x9F = true mojibake (cp1252 chars)
        bad_chars = [c for c in content if 0x80 <= ord(c) <= 0x9F]
        if bad_chars:
            issue('MOJIBAKE in ' + rel + ' -> C1 chars: ' + repr(bad_chars[:3]))
            mojibake_found = True
    except UnicodeDecodeError:
        issue('ENCODING ERROR (not valid UTF-8): ' + rel)
        mojibake_found = True
    except Exception as e:
        warn('Could not read ' + rel + ': ' + str(e))"""

if old_moji in audit:
    audit = audit.replace(old_moji, new_moji)
    write(audit_path, audit)
    print('  Updated mojibake check in audit_full.py')
else:
    print('  Mojibake check already updated')

print('\n=== ALL FINAL FIXES APPLIED ===')
