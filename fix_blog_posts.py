#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_blog_posts.py -- ReflexTester AdSense Fix
Fixes all blog posts:
  1. Removes broken purple-gradient body CSS, sidebar nav, mobile-toggle
  2. Injects clean blog article CSS that inherits the main dark site design
  3. Removes <link rel="stylesheet"> placed inside <body>
  4. Fixes encoding corruption (mojibake latin-1 mis-reads of UTF-8)
  5. Updates GA placeholder IDs to the real G-SQXHSZ3JNC
  6. Adds author bio box to each article
"""

import os
import re

BLOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blog')
REAL_GA_ID = 'G-SQXHSZ3JNC'

# ---------------------------------------------------------------------------
# Mojibake repair table
# These are latin-1 mis-interpretations of UTF-8 byte sequences.
# We replace them with the correct Unicode text.
# ---------------------------------------------------------------------------
MOJIBAKE = [
    # Multi-byte sequences
    ('\xc3\xb0\xc5\xb8\xe2\x80\x9c\xe2\x80\xa6', '\U0001f4c5'),  # calendar
    # Commonly seen as literal strings in the saved HTML files:
    ('&#x1F4C5;', '\U0001f4c5'),
    ('&#x1F464;', '\U0001f464'),

    # ---- Text patterns that appear verbatim in the corrupted files ----
    # Emoji rendered as question marks or garbled
    ('?? Home',             '\U0001f3e0 Home'),
    ('?? Dashboard',        '\U0001f4ca Dashboard'),
    ('?? Blog',             '\U0001f4dd Blog'),
    ('?? About',            '\u2139\ufe0f About'),
    ('?? Contact',          '\u2709\ufe0f Contact'),
    ('? Back to Blog',      '\u2190 Back to Blog'),
    ('? Quick Answer',      '\u26a1 Quick Answer'),
    ('? ReflexTester',      '\u26a1 ReflexTester'),

    # Date / author / read-time meta prefixes
    # These show as single ? in the HTML
    # We match context: the ? appears before known words/patterns

    # Latin-1 encoded emoji sequences (the most common corruptions seen)
    # Format: latin-1 string -> correct emoji
    ('\xf0\x9f\x93\x85', '\U0001f4c5'),   # calendar
    ('\xf0\x9f\x91\xa4', '\U0001f464'),   # bust in silhouette
    ('\xf0\x9f\x93\x9a', '\U0001f4da'),   # books
    ('\xf0\x9f\xa7\xa0', '\U0001f9e0'),   # brain
    ('\xf0\x9f\x92\xaa', '\U0001f4aa'),   # muscle
    ('\xf0\x9f\x8e\xae', '\U0001f3ae'),   # game controller
    ('\xf0\x9f\x93\x88', '\U0001f4c8'),   # chart
    ('\xf0\x9f\x8f\x86', '\U0001f3c6'),   # trophy
    ('\xf0\x9f\x8e\xaf', '\U0001f3af'),   # target
    ('\xe2\x9a\xa1',     '\u26a1'),        # lightning
    ('\xf0\x9f\x9a\x80', '\U0001f680'),   # rocket
    ('\xe2\x9c\x85',     '\u2705'),        # check
    ('\xe2\x80\x94',     '\u2014'),        # em dash
    ('\xe2\x80\x99',     '\u2019'),        # right single quote
    ('\xe2\x80\x9c',     '\u201c'),        # left double quote
    ('\xe2\x80\x9d',     '\u201d'),        # right double quote
    ('\xe2\x80\xa2',     '\u2022'),        # bullet
    ('\xc3\xa9',         '\xe9'),          # e acute
    ('\xe2\x86\x92',     '\u2192'),        # right arrow
    ('\xe2\x86\x93',     '\u2193'),        # down arrow
    ('\xe2\x86\x91',     '\u2191'),        # up arrow
    ('\xe2\x89\xa5',     '\u2265'),        # >=
    ('\xe2\x89\xa4',     '\u2264'),        # <=
    ('\xc2\xb0',         '\xb0'),          # degree
    ('\xc2\xb7',         '\xb7'),          # middle dot
    ('\xc2\xbd',         '\xbd'),          # 1/2
    ('\xe2\x84\xa2',     '\u2122'),        # TM
    ('\xc2\xae',         '\xae'),          # (R)
    # HTML entity garbling
    ('&acirc;&euro;&ldquo;', '\u201c'),
    ('&acirc;&euro;&rdquo;', '\u201d'),
    ('&acirc;&euro;&trade;', '\u2019'),
    ('&acirc;&euro;&",', '\u2014'),
    # The specific garbled sequences seen in the viewed files
    ('ðŸ"…', '\U0001f4c5'),   # calendar emoji
    ('ðŸ'¤', '\U0001f464'),   # person silhouette
    ('ðŸ"š', '\U0001f4da'),   # books
    ('ðŸ§ ',  '\U0001f9e0'),  # brain
    ('ðŸ'ª', '\U0001f4aa'),   # muscle
    ('ðŸŽ®', '\U0001f3ae'),   # game controller
    ('ðŸ"ˆ', '\U0001f4c8'),   # chart
    ('ðŸ†',  '\U0001f3c6'),   # trophy
    ('ðŸŽ¯', '\U0001f3af'),   # target
    ('âš¡',  '\u26a1'),       # lightning
    ('ðŸš€', '\U0001f680'),   # rocket
    ('âœ…',  '\u2705'),       # check
    ('â€"',  '\u2014'),       # em dash
    ('â€™',  '\u2019'),       # right single quote
    ('â€œ',  '\u201c'),       # left double quote
    ('â€',   '\u201d'),       # right double quote
    ('â€¢',  '\u2022'),       # bullet
    ('Ã©',   '\xe9'),          # e-acute
    ('â†'',  '\u2192'),       # right arrow
    ('â†"',  '\u2193'),       # down arrow
    ('â†'',  '\u2191'),       # up arrow
    ('â‰¥',  '\u2265'),       # >=
    ('â‰¤',  '\u2264'),       # <=
    ('Â°',   '\xb0'),          # degree
    ('Â·',   '\xb7'),          # middle dot
    ('Â½',   '\xbd'),          # 1/2
    ('â„¢',  '\u2122'),       # TM
    ('Â®',   '\xae'),          # (R)

    # 3-char replacement sequences that start as ?
    # For things like "?? " prefix patterns used in sidebar links
    # Already handled above via explicit string matches.
]

# ---------------------------------------------------------------------------
# Clean CSS for blog articles (uses main site CSS variables)
# ---------------------------------------------------------------------------
BLOG_CSS = '''
        /* == Blog Article Styles (AdSense Fix) == */
        .blog-wrapper {
            max-width: 860px;
            margin: 0 auto;
            padding: 120px 24px 80px;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 32px;
            color: var(--accent-orange);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            transition: gap 0.2s;
        }
        .back-link:hover { gap: 14px; }
        .blog-article {
            background: var(--bg-secondary);
            border: 1px solid var(--border-subtle);
            border-radius: 20px;
            padding: 48px;
        }
        .blog-article h1 {
            font-size: clamp(1.8rem, 4vw, 2.6rem);
            line-height: 1.25;
            margin-bottom: 24px;
            color: var(--text-primary);
        }
        .post-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 32px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-subtle);
            font-size: 0.9rem;
            color: var(--text-muted);
        }
        .blog-article h2 {
            font-size: 1.5rem;
            margin: 48px 0 16px;
            color: var(--accent-orange);
            padding-bottom: 10px;
            border-bottom: 2px solid var(--border-subtle);
        }
        .blog-article h3 {
            font-size: 1.2rem;
            margin: 32px 0 12px;
            color: var(--text-primary);
        }
        .blog-article h4 {
            font-size: 1.05rem;
            margin: 24px 0 10px;
            color: var(--accent-orange);
        }
        .blog-article p {
            color: var(--text-secondary);
            line-height: 1.85;
            margin-bottom: 18px;
            font-size: 1.05rem;
        }
        .blog-article ul, .blog-article ol {
            margin: 16px 0 20px 28px;
            color: var(--text-secondary);
        }
        .blog-article li {
            margin-bottom: 10px;
            line-height: 1.8;
        }
        .blog-article li strong, .blog-article p strong {
            color: var(--text-primary);
        }
        .blog-article blockquote {
            border-left: 4px solid var(--accent-orange);
            padding: 16px 24px;
            margin: 28px 0;
            background: var(--bg-tertiary);
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: var(--text-secondary);
        }
        .highlight-box, .quick-answer, .info-box, .research-note {
            background: rgba(255,77,0,0.07);
            border-left: 4px solid var(--accent-orange);
            padding: 20px 24px;
            margin: 28px 0;
            border-radius: 0 12px 12px 0;
        }
        .warning-box {
            background: rgba(245,158,11,0.08);
            border-left: 4px solid #f59e0b;
            padding: 20px 24px;
            margin: 28px 0;
            border-radius: 0 12px 12px 0;
        }
        .quick-answer h3 { margin-top: 0; color: var(--accent-orange); }
        .stat-badge {
            display: inline-block;
            background: rgba(255,77,0,0.12);
            color: var(--accent-orange);
            padding: 2px 10px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 0.9em;
            border: 1px solid rgba(255,77,0,0.3);
        }
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 28px 0;
            font-size: 0.95rem;
        }
        .comparison-table th, .comparison-table td {
            padding: 14px 16px;
            text-align: left;
            border-bottom: 1px solid var(--border-subtle);
        }
        .comparison-table thead th {
            background: var(--bg-tertiary);
            color: var(--accent-orange);
            font-weight: 600;
        }
        .comparison-table tbody tr:hover { background: var(--bg-tertiary); }
        .technique-card {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            transition: border-color 0.2s;
        }
        .technique-card:hover { border-color: var(--accent-orange); }
        .technique-card h4 { margin-top: 0; }
        .breathing-cycle {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin: 20px 0;
        }
        .cycle-step {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 16px;
            text-align: center;
        }
        .cycle-step h5 { color: var(--accent-orange); margin-bottom: 8px; }
        .article-nav {
            display: flex;
            gap: 16px;
            margin: 48px 0 24px;
        }
        .article-nav-btn {
            flex: 1;
            padding: 14px 20px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-subtle);
            color: var(--accent-orange);
            text-decoration: none;
            border-radius: 12px;
            text-align: center;
            font-weight: 600;
            transition: border-color 0.2s, background 0.2s;
        }
        .article-nav-btn:hover {
            border-color: var(--accent-orange);
            background: rgba(255,77,0,0.06);
        }
        .reference-link {
            color: var(--accent-orange);
            text-decoration: none;
            border-bottom: 1px dashed var(--accent-orange);
        }
        .reference-link:hover { border-bottom-style: solid; }
        .blog-article a:not(.reference-link):not(.article-nav-btn) {
            color: var(--accent-orange);
            text-decoration: none;
        }
        .blog-article a:not(.reference-link):not(.article-nav-btn):hover {
            text-decoration: underline;
        }
        .author-bio {
            display: flex;
            gap: 20px;
            align-items: flex-start;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-subtle);
            border-radius: 16px;
            padding: 28px;
            margin-top: 48px;
        }
        .author-bio .bio-avatar {
            width: 56px;
            height: 56px;
            background: rgba(255,77,0,0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        .author-bio h4 { margin: 0 0 6px; font-size: 1rem; }
        .author-bio p  { margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; }
        .related-articles {
            max-width: 860px;
            margin: 32px auto 0;
            padding: 0 24px 80px;
        }
        .related-articles h2 {
            font-size: 1.3rem;
            margin-bottom: 20px;
            color: var(--text-primary);
        }
        .related-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
        }
        .related-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            transition: border-color 0.2s;
        }
        .related-card:hover { border-color: var(--accent-orange); }
        .related-card a { display: block; padding: 20px; text-decoration: none; }
        .related-card h3 { font-size: 1rem; margin-bottom: 8px; color: var(--text-primary); }
        .related-card p  { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
        @media (max-width: 768px) {
            .blog-wrapper { padding: 100px 16px 60px; }
            .blog-article  { padding: 24px 20px; }
            .article-nav   { flex-direction: column; }
            .author-bio    { flex-direction: column; }
        }
'''

AUTHOR_BIO_HTML = '''
            <div class="author-bio">
                <div class="bio-avatar">&#9998;</div>
                <div>
                    <h4>ReflexTester Editorial Team</h4>
                    <p>Written by gamers, developers, and performance researchers dedicated to helping you measure and improve your reflexes. All articles are based on peer-reviewed science and real testing data collected from reflextester.fun.</p>
                </div>
            </div>'''

# ---------------------------------------------------------------------------
# CSS regex patterns to strip from existing <style> blocks
# ---------------------------------------------------------------------------
STRIP_PATTERNS = [
    # body { background: linear-gradient(...) } block
    re.compile(r'body\s*\{[^{}]*background\s*:\s*linear-gradient[^{}]*\}', re.DOTALL),
    # /* Sidebar Navigation */ comment + all rules following it until end of common sidebar selectors
    re.compile(r'/\*\s*Sidebar Navigation\s*\*/.*', re.DOTALL),
    # Individual fallback strips
    re.compile(r'\.sidebar\b[^{]*\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}', re.DOTALL),
    re.compile(r'\.sidebar-menu\b[^{]*\{[^{}]*\}', re.DOTALL),
    re.compile(r'\.main-content\s*\{[^{}]*\}', re.DOTALL),
    re.compile(r'\.mobile-toggle\s*\{[^{}]*\}', re.DOTALL),
    # @media blocks that contain sidebar/mobile-toggle
    re.compile(r'@media[^{]+\{[^{}]*\.sidebar[^{}]*(?:\{[^{}]*\}[^{}]*)?\}', re.DOTALL),
]


def strip_css_block(style_inner):
    for pat in STRIP_PATTERNS:
        style_inner = pat.sub('', style_inner)
    return style_inner


def fix_mojibake(text):
    for broken, fixed in MOJIBAKE:
        if broken in text:
            text = text.replace(broken, fixed)
    return text


def process_file(filepath):
    try:
        raw = open(filepath, 'rb').read()
        # Try to decode as utf-8; on failure fall back to latin-1 so we get the garbled chars
        try:
            text = raw.decode('utf-8')
        except UnicodeDecodeError:
            text = raw.decode('latin-1')
    except Exception as e:
        print('  ERROR reading %s: %s' % (filepath, e))
        return False

    original = text

    # 1. Fix mojibake text replacements
    text = fix_mojibake(text)

    # 2. Fix GA placeholder
    text = text.replace('G-XXXXXXXXXX', REAL_GA_ID)

    # 3. Process <style> blocks
    css_injected = [False]

    def handle_style(m):
        inner = m.group(1)
        inner = strip_css_block(inner)
        if not css_injected[0]:
            inner = BLOG_CSS + '\n' + inner
            css_injected[0] = True
        return '<style>' + inner + '</style>'

    text = re.sub(r'<style>(.*?)</style>', handle_style, text, flags=re.DOTALL)

    # 4. Remove <link rel="stylesheet"> inside <body> (stray one after nav)
    # Replace the one right after </nav> and before <!-- Sidebar
    text = re.sub(
        r'(?<=</nav>)\s*\n<link rel="stylesheet" href="\.\./styles\.css">',
        '',
        text)
    # Generic fallback: any link tag in body that isn't already in head
    # (body comes after </head>)
    head_end = text.find('</head>')
    if head_end != -1:
        body_part = text[head_end:]
        body_part = re.sub(
            r'<link\s+rel="stylesheet"[^>]*href="[^"]*styles\.css"[^>]*/?>',
            '',
            body_part)
        text = text[:head_end] + body_part

    # 5. Remove broken sidebar nav from body
    # Remove <nav class="sidebar" ...>...</nav>
    text = re.sub(r'<nav\s+class="sidebar"[^>]*>.*?</nav>', '', text, flags=re.DOTALL)

    # Remove mobile-toggle button
    text = re.sub(r'<button\s+class="mobile-toggle"[^>]*>.*?</button>', '', text, flags=re.DOTALL)

    # 6. Replace <div class="main-content"> wrapper opening tag only (keep content)
    text = re.sub(r'\n\s*<div\s+class="main-content"\s*>', '', text)

    # 7. Fix <div class="container"> -> <div class="blog-wrapper">
    # Only the first occurrence in body that wraps the back-link + article
    head_end2 = text.find('</head>')
    if head_end2 != -1:
        body_section = text[head_end2:]
        body_section = body_section.replace(
            '<div class="container">', '<div class="blog-wrapper">', 1)
        text = text[:head_end2] + body_section

    # 8. Fix back-link text (remove broken span wrapper around arrow)
    text = re.sub(
        r'(<a[^>]+class="back-link"[^>]*>)\s*(?:<span>[^<]*</span>\s*)?(?:&larr;|&#8592;|&#x2190;|\u2190|&lt;)?\s*Back to Blog',
        r'\1\u2190 Back to Blog',
        text)

    # 9. Add author bio before closing </article> if not already present
    if 'author-bio' not in text and '</article>' in text:
        text = text.replace('</article>', AUTHOR_BIO_HTML + '\n        </article>', 1)

    if text != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        return True
    return False


def main():
    if not os.path.isdir(BLOG_DIR):
        print('ERROR: Blog directory not found: %s' % BLOG_DIR)
        return

    files = sorted(f for f in os.listdir(BLOG_DIR)
                   if f.endswith('.html') and f != 'index.html')

    print('Processing %d blog posts...\n' % len(files))
    changed = 0
    for fname in files:
        path = os.path.join(BLOG_DIR, fname)
        modified = process_file(path)
        print('  [%s] %s' % ('FIXED' if modified else 'skip ', fname))
        if modified:
            changed += 1

    print('\nDone. %d/%d files updated.' % (changed, len(files)))


if __name__ == '__main__':
    main()
