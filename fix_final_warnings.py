"""Fix final 5 audit warnings"""
from pathlib import Path
import re

ROOT = Path(r'c:\Users\snowp\Reflex-Tester')

# 1. Add .hit-anim to styles.css
css = ROOT / 'styles.css'
content = css.read_text(encoding='utf-8')
if '.hit-anim' not in content:
    content += (
        '\n/* Precision aim test hit animation (scoped to global sheet) */\n'
        '.hit-anim { animation: precHitFlash 0.25s ease forwards; }\n'
        '@keyframes precHitFlash {\n'
        '  0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }\n'
        '  100% { opacity: 0; transform: translate(-50%, -50%) scale(2.5); }\n'
        '}\n'
    )
    css.write_text(content, encoding='utf-8', newline='\r\n')
    print('Added .hit-anim to styles.css')
else:
    print('.hit-anim already in styles.css')

# 2. Add nav-cta to legal/error pages
CTA = '<a href="tools.html" class="nav-cta">All Tools</a>\n'
for fname in ['404.html', '500.html', 'privacy-policy.html', 'terms-of-service.html']:
    f = ROOT / fname
    if not f.exists():
        print('SKIP (not found):', fname)
        continue
    h = f.read_text(encoding='utf-8')
    if 'nav-cta' in h:
        print('already has nav-cta:', fname)
        continue
    # Strategy: find the nav-menu div closing tag pattern
    # Pattern 1: </div>\n            <button
    p1 = '</div>\n            <button class="nav-toggle"'
    p2 = '</div>\r\n            <button class="nav-toggle"'
    if p1 in h:
        h = h.replace(p1, '                ' + CTA + '            </div>\n            <button class="nav-toggle"', 1)
        f.write_text(h, encoding='utf-8', newline='\r\n')
        print('Fixed (p1):', fname)
    elif p2 in h:
        h = h.replace(p2, '                ' + CTA + '            </div>\r\n            <button class="nav-toggle"', 1)
        f.write_text(h, encoding='utf-8', newline='\r\n')
        print('Fixed (p2):', fname)
    elif 'nav-menu' in h:
        # Find nav-menu and inject before its closing </div>
        # Nav menu pattern: <div class="nav-menu" ...>...links...</div>
        match = re.search(r'(<div[^>]*class="nav-menu[^"]*"[^>]*>)(.*?)(</div>)', h, re.DOTALL)
        if match:
            new_section = match.group(1) + match.group(2) + '                ' + CTA + match.group(3)
            h = h[:match.start()] + new_section + h[match.end():]
            f.write_text(h, encoding='utf-8', newline='\r\n')
            print('Fixed (regex):', fname)
        else:
            print('WARN: Could not locate nav-menu in', fname)
    else:
        print('WARN: No nav-menu found in', fname)

print('Done')
