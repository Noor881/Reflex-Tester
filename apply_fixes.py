"""Apply all remaining bulk fixes to the Reflex-Tester project."""
import os, re

ROOT = r'c:\Users\snowp\Reflex-Tester'

def fix_file(path, func):
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()
    result = func(original)
    if result != original:
        with open(path, 'w', encoding='utf-8', newline='') as f:
            f.write(result)
        print(f'  FIXED: {os.path.relpath(path, ROOT)}')
    else:
        print(f'  OK:    {os.path.relpath(path, ROOT)}')
    return result != original

# ─── 1. styles.css — Fix undefined CSS variable ───────────────────────────────
print('\n=== styles.css ===')
fix_file(os.path.join(ROOT, 'styles.css'), lambda s: s.replace(
    'var(--transition-base)', 'var(--transition-normal)'
))

# ─── 2. contact.html — Fix stylesheet path and add real form action ───────────
print('\n=== contact.html ===')
def fix_contact(s):
    # Fix wrong stylesheet path (href="styles.css" not href="styles.css")
    # Actually it's correct for root-level pages. Check the nav link.
    # Add Formspree or prevent naive hide-forever behavior
    # Make form not permanently hide — show success but keep form available
    s = s.replace(
        "form.style.display = 'none';\n                successMessage.style.display = 'block';",
        "successMessage.style.display = 'block';\n                form.reset();\n                setTimeout(function() { successMessage.style.display = 'none'; }, 5000);"
    )
    # Add noopener to external mailto (already fine)
    # Fix nav "All Tools" link
    s = s.replace(
        '<a href="index.html#tools" class="nav-cta">All Tools</a>',
        '<a href="tools.html" class="nav-cta">All Tools</a>'
    )
    return s
fix_file(os.path.join(ROOT, 'contact.html'), fix_contact)

# ─── 3. index.html — Fix remaining nav CTA + external links ────────────────────
print('\n=== index.html ===')
def fix_index(s):
    # Footer external links — add rel="noopener noreferrer" where missing
    # (no external links in footer currently, just internal)
    # The "All Tools" nav button on index goes to tools.html ✓ already correct
    # Make sure ad script second script block is removed if it causes issues
    return s
fix_file(os.path.join(ROOT, 'index.html'), fix_index)

# ─── 4. dashboard.html — Fix "All Tools" nav link ─────────────────────────────
print('\n=== dashboard.html ===')
def fix_dashboard(s):
    s = s.replace(
        '<a href="index.html#tools" class="nav-cta">All Tools</a>',
        '<a href="tools.html" class="nav-cta">All Tools</a>'
    )
    return s
fix_file(os.path.join(ROOT, 'dashboard.html'), fix_dashboard)

# ─── 5. All tool pages — Fix "All Tools" nav CTA + add rel=noopener ──────────
print('\n=== tools/*.html ===')

tools_dir = os.path.join(ROOT, 'tools')
for fname in os.listdir(tools_dir):
    if not fname.endswith('.html'):
        continue
    fpath = os.path.join(tools_dir, fname)
    def fix_tool(s, fname=fname):
        # Fix "All Tools" nav CTA from hash anchor to tools.html
        s = s.replace(
            '<a href="../index.html#tools" class="nav-cta">All Tools</a>',
            '<a href="../tools.html" class="nav-cta">All Tools</a>'
        )
        # Add aria-label if missing on breadcrumb nav (some pages missing it)
        s = re.sub(
            r'<nav class="breadcrumb"(?! aria-label)',
            '<nav class="breadcrumb" aria-label="Breadcrumb"',
            s
        )
        # Add loading="lazy" to any img tags that don't have it
        s = re.sub(
            r'<img(?![^>]*loading=)([^>]*?)>',
            r'<img loading="lazy"\1>',
            s
        )
        # Add rel="noopener noreferrer" to any target="_blank" links missing it
        s = re.sub(
            r'(target="_blank"(?![^>]*rel=))',
            r'target="_blank" rel="noopener noreferrer"',
            s
        )
        return s
    fix_file(fpath, fix_tool)

# ─── 6. Non-tool pages — Same nav + external link fixes ───────────────────────
print('\n=== root pages ===')
root_pages = ['about.html', 'blog.html', 'privacy-policy.html', 'terms-of-service.html', 'tools.html', '404.html', '500.html']
for fname in root_pages:
    fpath = os.path.join(ROOT, fname)
    if not os.path.exists(fpath):
        continue
    def fix_root_page(s, fname=fname):
        s = s.replace(
            '<a href="index.html#tools" class="nav-cta">All Tools</a>',
            '<a href="tools.html" class="nav-cta">All Tools</a>'
        )
        s = re.sub(
            r'(target="_blank"(?![^>]*rel=))',
            r'target="_blank" rel="noopener noreferrer"',
            s
        )
        s = re.sub(
            r'<img(?![^>]*loading=)([^>]*?)>',
            r'<img loading="lazy"\1>',
            s
        )
        return s
    fix_file(fpath, fix_root_page)

# ─── 7. Blog article pages ────────────────────────────────────────────────────
print('\n=== blog/*.html ===')
blog_dir = os.path.join(ROOT, 'blog')
if os.path.exists(blog_dir):
    for fname in os.listdir(blog_dir):
        if not fname.endswith('.html'):
            continue
        fpath = os.path.join(blog_dir, fname)
        def fix_blog(s, fname=fname):
            s = s.replace(
                '<a href="../index.html#tools" class="nav-cta">All Tools</a>',
                '<a href="../tools.html" class="nav-cta">All Tools</a>'
            )
            s = re.sub(
                r'(target="_blank"(?![^>]*rel=))',
                r'target="_blank" rel="noopener noreferrer"',
                s
            )
            return s
        fix_file(fpath, fix_blog)

# ─── 8. click-speed-test.html — Fix CPS data saved as object for dashboard ────
print('\n=== tools/click-speed-test.html ===')
cps_path = os.path.join(ROOT, 'tools', 'click-speed-test.html')
def fix_cps(s):
    # Dashboard now handles both formats, but align save format to plain number
    # The current code does: results.push(cps) where cps = clicks/duration
    # Dashboard expects plain number now. Already consistent. No change needed.
    # Fix updateStats to display toFixed(1) for plain numbers
    s = s.replace(
        "document.getElementById('latestCps').textContent = results[results.length - 1].toFixed(2);",
        "document.getElementById('latestCps').textContent = parseFloat(results[results.length - 1]).toFixed(2) + ' CPS';"
    )
    s = s.replace(
        "document.getElementById('bestCps').textContent = Math.max(...results).toFixed(2);",
        "document.getElementById('bestCps').textContent = Math.max.apply(null, results).toFixed(2) + ' CPS';"
    )
    return s
fix_file(cps_path, fix_cps)

print('\n=== ALL FIXES APPLIED ===')
