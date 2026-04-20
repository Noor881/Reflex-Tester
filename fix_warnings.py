"""Fix remaining 7 warnings"""
from pathlib import Path
import re

ROOT = Path(r'c:\Users\snowp\Reflex-Tester')

def read(p): return p.read_text(encoding='utf-8')
def write(p, c): p.write_text(c, encoding='utf-8', newline='\r\n'); print('FIXED: ' + str(p.relative_to(ROOT)))

# FIX 1: csgo-aim-trainer also saves to csgo_scores (dashboard key)
f = ROOT / 'tools' / 'csgo-aim-trainer.html'
h = read(f)
if 'csgo_scores' not in h:
    old = "ReflexStore.set('csgo_results', results);"
    new = ("ReflexStore.set('csgo_results', results);\n"
           "                ReflexStore.set('csgo_scores', results); // dashboard alias")
    h = h.replace(old, new)
    write(f, h)
else:
    print('csgo-aim-trainer: csgo_scores already saved')

# FIX 2: blog/index.html — add nav-cta if missing
f2 = ROOT / 'blog' / 'index.html'
if f2.exists():
    h2 = read(f2)
    if 'nav-cta' not in h2:
        marker = '</div>\n            <button class="nav-toggle"'
        replacement = ('                <a href="../tools.html" class="nav-cta">All Tools</a>\n'
                       '            </div>\n'
                       '            <button class="nav-toggle"')
        if marker in h2:
            h2 = h2.replace(marker, replacement)
            write(f2, h2)
        else:
            print('WARN: Could not find nav-menu close in blog/index.html')
    else:
        print('blog/index.html already has nav-cta')
else:
    print('blog/index.html not found')

print('Done')
