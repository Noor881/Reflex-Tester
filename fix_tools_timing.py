"""
Fix the critical ReflexStore timing bug in all tool pages.
The inline <script> runs before main.js defer, so ReflexStore is undefined.
Wrap each inline IIFE in a DOMContentLoaded listener so it runs after main.js.
"""
import os, re

ROOT = r'c:\Users\snowp\Reflex-Tester'
TOOLS_DIR = os.path.join(ROOT, 'tools')

# Pattern: <script src="../main.js" defer></script><script>...(function(){...})();</script>
# We need to change the inline script to use DOMContentLoaded.

IIFE_PATTERN = re.compile(
    r'(<script src=\"\.\./main\.js\" defer></script>)\s*<script>\s*\(function\s*\(\)\s*\{(.*?)\}\)\(\);\s*</script>',
    re.DOTALL
)

def wrap_in_domcontentloaded(match):
    main_script = match.group(1)
    inner_body = match.group(2)
    # Indent the inner body consistently
    return (
        main_script + '\n    <script>\n'
        '        document.addEventListener(\'DOMContentLoaded\', function () {\n'
        '            (function () {' + inner_body + '})();\n'
        '        });\n'
        '    </script>'
    )

fixed = 0
skipped = 0

for fname in sorted(os.listdir(TOOLS_DIR)):
    if not fname.endswith('.html'):
        continue
    fpath = os.path.join(TOOLS_DIR, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, count = IIFE_PATTERN.subn(wrap_in_domcontentloaded, content)

    if count > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'  FIXED ({count}): {fname}')
        fixed += 1
    else:
        # Try alternate pattern (some tools may already be DOMContentLoaded or have different structure)
        if 'ReflexStore' in content and 'DOMContentLoaded' not in content:
            print(f'  WARN (no pattern match, has ReflexStore): {fname}')
        else:
            print(f'  OK:   {fname}')
        skipped += 1

print(f'\nDone: {fixed} fixed, {skipped} skipped/OK.')
