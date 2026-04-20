"""
ReflexTester — Performance Lab Tool Redesign
Batch-updates inline <style> blocks across all 31 tool HTML files.
Does NOT touch JavaScript, HTML structure, or game logic.
"""

import os, re

TOOLS_DIR = r"c:\Users\snowp\Reflex-Tester\tools"

# ── Shared injectable CSS that goes into every tool's <style> block ──────────
SHARED_CSS = """
        /* ── Performance Lab Design System (injected) ── */
        :root {
            --orange: #FF4D00;
            --orange-dim: rgba(255,77,0,0.15);
            --orange-glow: 0 0 24px rgba(255,77,0,0.3);
        }

        /* Grade badges — Performance Lab */
        .grade-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 14px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            border: 1px solid;
            font-family: var(--font-display, 'Space Grotesk', sans-serif);
        }
        .grade-exceptional { background: rgba(34,197,94,0.1);  color: #22c55e; border-color: rgba(34,197,94,0.35); }
        .grade-excellent   { background: rgba(59,130,246,0.1); color: #60a5fa; border-color: rgba(59,130,246,0.35); }
        .grade-good        { background: rgba(255,77,0,0.1);   color: #FF4D00; border-color: rgba(255,77,0,0.35); }
        .grade-average     { background: rgba(250,204,21,0.1); color: #facc15; border-color: rgba(250,204,21,0.35); }
        .grade-poor        { background: rgba(239,68,68,0.1);  color: #f87171; border-color: rgba(239,68,68,0.35); }

        /* HUD cells */
        .hud-cell {
            background: #111;
            border: 1px solid rgba(255,255,255,0.08);
            border-top: 2px solid var(--orange);
            border-radius: 6px;
            padding: 14px 10px;
            text-align: center;
        }
        .hud-cell-val {
            font-family: var(--font-mono, 'JetBrains Mono', monospace);
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary, #f5f5f0);
            margin-bottom: 3px;
        }
        .hud-cell-lbl {
            font-size: 0.68rem;
            color: var(--text-muted, #444);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 600;
        }

        /* Score display card */
        .score-card {
            background: #0d0d0d;
            border: 1px solid rgba(255,255,255,0.08);
            border-top: 2px solid var(--orange);
            border-radius: 10px;
            padding: 24px 20px;
            text-align: center;
            margin: 16px 0;
        }
        .score-card-value {
            font-family: var(--font-mono, 'JetBrains Mono', monospace);
            font-size: 2.4rem;
            font-weight: 700;
            color: var(--orange);
            margin-bottom: 6px;
            letter-spacing: -0.02em;
        }
        .score-card-sub {
            font-size: 0.875rem;
            color: var(--text-secondary, #888);
            margin-bottom: 12px;
        }
"""

# ── Color substitutions applied to existing inline styles (regex) ────────────
# (pattern, replacement)  — only inside <style> blocks
COLOR_SUBS = [
    # Old blue-purple backgrounds → true dark
    (r'#1e1e3a', '#111111'),
    (r'#12122a', '#101010'),
    (r'#1a1835', '#0e0e0e'),
    (r'#0d1a2e', '#111111'),
    (r'#0a2a12', '#091a0d'),
    (r'#2a1010', '#1a0808'),
    (r'#1a0f0a', '#0e0a08'),
    (r'#0a0510', '#080808'),
    (r'#2a2a4a', 'rgba(255,255,255,0.1)'),
    (r'#3a3a5a', 'rgba(255,255,255,0.1)'),
    (r'#1f1f3a', '#111'),
    (r'#13131f', '#0e0e0e'),
    (r'#0e0e1a', '#0a0a0a'),
    
    # Border radius — round → sharp (only in style blocks, not game canvas)
    # Don't want to touch border-radius on circles/game elements
    
    # Old cyan accent → orange (only when used as UI color, not game indicator)
    # We'll skip blanket replacement here to preserve game state colors
    
    # Tab/mode button active states
    (r'background:\s*var\(--accent-cyan\);\s*\n(\s*)color:\s*#000', 
     r'background: #FF4D00;\n\1color: #000'),
    
    # box-shadow cyan → orange  
    (r'rgba\(0,200,255,0\.2\)', 'rgba(255,77,0,0.2)'),
    (r'rgba\(0,200,255,0\.25\)', 'rgba(255,77,0,0.2)'),
    
    # Old progress bar gradient
    (r'linear-gradient\(90deg,\s*var\(--accent-cyan\),\s*var\(--accent-green\)\)',
     'linear-gradient(90deg, #FF4D00, #22c55e)'),
    
    # Ripple color
    (r'rgba\(0,200,255,0\.25\)', 'rgba(255,77,0,0.2)'),
    
    # border-radius: 20px on non-circle elements → 8px
    # Applied carefully — only on non-game elements
]

# ── Tab/mode button normalizer (used across aim trainers) ────────────────────
AIM_MODE_BTN_CSS = """
        .aim-mode-btn {
            padding: 9px 18px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.1);
            color: var(--text-secondary);
            border-radius: 5px;
            cursor: pointer;
            font-family: var(--font-display, 'Space Grotesk', sans-serif);
            font-weight: 700;
            font-size: 0.8em;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.15s;
        }
        .aim-mode-btn:hover {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.2);
            color: var(--text-primary);
        }
        .aim-mode-btn.active {
            background: #FF4D00;
            color: #000;
            border-color: #FF4D00;
        }
"""

CPS_TAB_CSS = """
        .cps-tabs {
            display: flex;
            gap: 6px;
            background: transparent;
            border: none;
            padding: 0;
        }
        .cps-tab {
            padding: 8px 18px;
            border-radius: 5px;
            border: 1px solid rgba(255,255,255,0.1);
            background: transparent;
            color: var(--text-secondary);
            font-family: var(--font-display, 'Space Grotesk', sans-serif);
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.15s;
        }
        .cps-tab.active {
            background: #FF4D00;
            color: #000;
            border-color: #FF4D00;
        }
        .cps-tab:hover:not(.active) {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.2);
            color: var(--text-primary);
        }
"""

CLICK_ZONE_CSS = """
        .cps-click-zone {
            position: relative;
            width: min(480px, 90vw);
            height: 200px;
            border-radius: 10px;
            background: #0d0d0d;
            border: 2px solid rgba(255,255,255,0.08);
            border-top: 2px solid #FF4D00;
            cursor: pointer;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: border-color 0.15s, box-shadow 0.15s;
            user-select: none;
            -webkit-user-select: none;
        }
        .cps-click-zone.idle { border-top-color: rgba(255,255,255,0.15); }
        .cps-click-zone.running {
            border-top-color: #FF4D00;
            box-shadow: 0 0 30px rgba(255,77,0,0.15);
        }
        .cps-click-zone.done {
            border-top-color: #22c55e;
            box-shadow: 0 0 20px rgba(34,197,94,0.12);
            cursor: default;
        }
        .cps-main-count {
            font-family: var(--font-mono, 'JetBrains Mono', monospace);
            font-size: 4rem;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
            transition: color 0.15s;
        }
        .cps-main-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .cps-live-cps {
            font-family: var(--font-mono, monospace);
            font-size: 1rem;
            font-weight: 700;
            color: #FF4D00;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .cps-click-zone.running .cps-live-cps { opacity: 1; }
        .cps-progress-outer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: rgba(255,255,255,0.05);
        }
        .cps-progress-inner {
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, #FF4D00, #22c55e);
            transition: width 0.25s linear;
            transform-origin: left;
        }
        .cps-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,77,0,0.2);
            pointer-events: none;
            transform: scale(0);
            animation: cpsRipple 0.4s ease-out forwards;
        }
"""

REFLEX_CIRCLE_CSS = """
        .reflex-circle-wrap.state-idle .reflex-circle  { background: #111; }
        .reflex-circle-wrap.state-idle .reflex-ring    { border-color: rgba(255,255,255,0.1); }
        .reflex-circle-wrap.state-ready .reflex-circle { background: #120808; }
        .reflex-circle-wrap.state-ready .reflex-ring   { border-color: #FF4D00; box-shadow: 0 0 20px rgba(255,77,0,0.25); }
        .reflex-circle-wrap.state-ready .reflex-circle-value { color: #FF4D00; }
        .reflex-circle-wrap.state-go .reflex-circle    { background: #091a0d; box-shadow: 0 0 60px rgba(34,197,94,0.4); }
        .reflex-circle-wrap.state-go .reflex-ring      { border-color: #22c55e; box-shadow: 0 0 30px rgba(34,197,94,0.5); }
        .reflex-circle-wrap.state-go .reflex-circle-value { color: #22c55e; }
        .reflex-circle-wrap.state-go .reflex-circle-label { color: #22c55e; }
        .reflex-circle-wrap.state-result .reflex-circle { background: #0e0e0e; }
        .reflex-circle-wrap.state-result .reflex-ring  { border-color: #FF4D00; box-shadow: 0 0 20px rgba(255,77,0,0.25); }
        .reflex-circle-wrap.state-result .reflex-circle-value { color: #FF4D00; font-size: 2.2rem; }
        .reflex-circle-wrap.state-early .reflex-circle { background: #1a0808; }
        .reflex-circle-wrap.state-early .reflex-ring   { border-color: #facc15; }
        .reflex-circle-wrap.state-early .reflex-circle-value { color: #facc15; }
        .reflex-circle { background: #111; }
        .reflex-circle-value { font-family: var(--font-mono, 'JetBrains Mono', monospace); }
"""

AIM_CANVAS_CSS = """
        .aim-canvas-wrap {
            position: relative;
            width: 100%;
            height: 520px;
            background: linear-gradient(160deg, #080808 0%, #100a06 100%);
            border-radius: 10px;
            overflow: hidden;
            cursor: crosshair;
            user-select: none;
            border: 1px solid rgba(255,255,255,0.08);
            border-top: 2px solid #FF4D00;
        }
        .aim-hud {
            position: absolute;
            top: 14px;
            left: 16px;
            display: flex;
            gap: 24px;
            font-size: 0.85rem;
            color: rgba(255,255,255,0.7);
            font-family: var(--font-mono, monospace);
            text-shadow: 0 1px 4px rgba(0,0,0,0.9);
        }
        .aim-hud-item span {
            color: #FF4D00;
            font-weight: 700;
        }
        .aim-timer-display {
            position: absolute;
            top: 12px;
            right: 16px;
            font-family: var(--font-mono, monospace);
            font-size: 1.3rem;
            font-weight: 700;
            color: #FF4D00;
            text-shadow: 0 1px 4px rgba(0,0,0,0.9);
        }
        .hitmarker {
            position: absolute;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s;
            font-size: 1.8rem;
            color: #FF4D00;
        }
        .hitmarker.show { opacity: 1; }
"""

SENSITIVITY_CSS = """
        .sens-form {
            display: grid;
            gap: 16px;
            max-width: 560px;
            margin: 0 auto;
        }
        .sens-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .sens-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .sens-field label {
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-secondary);
        }
        .sens-field select,
        .sens-field input[type=number] {
            background: #111;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 5px;
            color: var(--text-primary);
            padding: 10px 12px;
            font-size: 0.95rem;
            font-family: var(--font-mono, monospace);
            outline: none;
            transition: border-color 0.15s;
            -webkit-appearance: none;
            appearance: none;
        }
        .sens-field select:focus,
        .sens-field input[type=number]:focus {
            border-color: #FF4D00;
        }
        #resultBox {
            background: #0d0d0d;
            border: 1px solid rgba(255,255,255,0.08);
            border-top: 2px solid #FF4D00;
            border-radius: 10px;
            padding: 20px;
            font-family: var(--font-mono, monospace);
            min-height: 60px;
            white-space: pre-wrap;
            color: var(--text-primary);
            font-size: 0.9rem;
        }
"""

# Map of file patterns → extra CSS to inject
EXTRA_CSS_MAP = {
    'visual-reflex-test': REFLEX_CIRCLE_CSS,
    'audio-reflex-test': REFLEX_CIRCLE_CSS,
    'reaction-comparison-test': REFLEX_CIRCLE_CSS,
    'click-speed-test': CPS_TAB_CSS + CLICK_ZONE_CSS,
    'double-click-speed-test': CPS_TAB_CSS + CLICK_ZONE_CSS,
    'apex-aim-trainer': AIM_CANVAS_CSS + AIM_MODE_BTN_CSS,
    'cod-aim-trainer': AIM_CANVAS_CSS + AIM_MODE_BTN_CSS,
    'csgo-aim-trainer': AIM_CANVAS_CSS + AIM_MODE_BTN_CSS,
    'valorant-aim-trainer': AIM_CANVAS_CSS + AIM_MODE_BTN_CSS,
    'fortnite-aim-trainer': AIM_CANVAS_CSS + AIM_MODE_BTN_CSS,
    'flick-shot-trainer': AIM_CANVAS_CSS + AIM_MODE_BTN_CSS,
    'precision-aim-test': AIM_CANVAS_CSS + AIM_MODE_BTN_CSS,
    'sensitivity-calculator': SENSITIVITY_CSS,
}

def apply_color_subs(css_text):
    """Apply color substitutions to a CSS string."""
    for pattern, replacement in COLOR_SUBS:
        css_text = re.sub(pattern, replacement, css_text)
    return css_text

def inject_shared_css(style_block):
    """Append shared CSS to an existing <style> block."""
    return style_block.replace('</style>', SHARED_CSS + '\n    </style>')

def inject_extra_css(style_block, tool_name):
    """Append tool-specific CSS overrides."""
    extra = ''
    for key, css in EXTRA_CSS_MAP.items():
        if key in tool_name:
            extra += css
    if extra:
        return style_block.replace('</style>', extra + '\n    </style>')
    return style_block

def process_style_block(match, tool_name):
    """Process a <style>...</style> block."""
    full = match.group(0)
    # Apply color substitutions inside the style block only
    full = apply_color_subs(full)
    # Inject shared design system CSS
    full = inject_shared_css(full)
    # Inject tool-specific overrides
    full = inject_extra_css(full, tool_name)
    return full

def update_score_display_divs(html):
    """Update hardcoded scoreDisplay divs to use new card styling."""
    # Replace old inline style on scoreDisplay container
    old_pattern = r'id="scoreDisplay" style="display:none; text-align:center; padding:20px; background:var\(--bg-card\); border-radius:16px; border:1px solid var\(--border-subtle\); margin:16px 0;"'
    new_style = 'id="scoreDisplay" class="score-card" style="display:none;"'
    html = re.sub(old_pattern, new_style, html)
    
    # Update score value spans
    old_score = r'<div style="font-size:2rem;font-weight:900;margin-bottom:4px;" id="sDisplayScore">'
    new_score = '<div class="score-card-value" id="sDisplayScore">'
    html = html.replace(old_score, new_score)
    
    # Update sub text
    old_sub = r'<div style="font-size:0.9rem;color:var\(--text-secondary\);margin-bottom:10px;" id="sDisplaySub">'
    new_sub = '<div class="score-card-sub" id="sDisplaySub">'
    html = re.sub(old_sub, new_sub, html)
    
    return html

def update_hud_cells(html):
    """Update hud-cell border-radius in inline styles if present."""
    # Fix old border-radius:12px on hud cells (already in CSS override, but clean inline ones)
    html = html.replace('border-radius: 12px', 'border-radius: 6px')
    return html

def process_file(filepath):
    tool_name = os.path.basename(filepath).replace('.html', '')
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    original = html
    
    # Process all <style> blocks
    html = re.sub(
        r'<style[^>]*>.*?</style>',
        lambda m: process_style_block(m, tool_name),
        html,
        flags=re.DOTALL | re.IGNORECASE
    )
    
    # Update score display divs
    html = update_score_display_divs(html)
    
    # Fix hud cell radius
    html = update_hud_cells(html)
    
    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False

def main():
    html_files = [f for f in os.listdir(TOOLS_DIR) if f.endswith('.html')]
    updated = 0
    skipped = 0
    
    for fname in sorted(html_files):
        fpath = os.path.join(TOOLS_DIR, fname)
        try:
            if process_file(fpath):
                print(f"  OK {fname}")
                updated += 1
            else:
                print(f"  -- {fname} (no change)")
                skipped += 1
        except Exception as e:
            print(f"  ERR {fname}: {e}")
    
    print(f"\n{'='*50}")
    print(f"Updated: {updated}  |  Skipped: {skipped}  |  Total: {len(html_files)}")

if __name__ == '__main__':
    main()
