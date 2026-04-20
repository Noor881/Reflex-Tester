"""
ReflexTester — Unique Per-Tool Design System
Each tool gets its own accent color, personality CSS, and visual identity.
Preserves all HTML structure and JavaScript functionality.
"""

import os, re

TOOLS_DIR = r"c:\Users\snowp\Reflex-Tester\tools"

# ─────────────────────────────────────────────────────────────────────────────
# Per-tool theme definitions
# accent      = main color
# accent_rgb  = RGB for rgba() usage
# text_on     = text color on filled buttons (#000 or #fff)
# bg_dark     = canvas/arena background
# name        = human label for the tool
# vibe        = personality descriptor
# ─────────────────────────────────────────────────────────────────────────────
TOOL_THEMES = {

    # ── Reflex / Reaction ────────────────────────────────────────────────────
    'visual-reflex-test': {
        'accent': '#00E676', 'accent_rgb': '0,230,118',
        'text_on': '#000', 'bg_dark': '#050f08',
        'header_color': '#00E676',
        'description': 'GREEN = GO. Your reflexes, measured to the millisecond.',
    },
    'audio-reflex-test': {
        'accent': '#3B82F6', 'accent_rgb': '59,130,246',
        'text_on': '#fff', 'bg_dark': '#05080f',
        'header_color': '#60A5FA',
        'description': 'Sound is faster. Prove it with precision audio reaction training.',
    },
    'reaction-comparison-test': {
        'accent': '#A855F7', 'accent_rgb': '168,85,247',
        'text_on': '#fff', 'bg_dark': '#08050f',
        'header_color': '#C084FC',
        'description': 'Visual vs Audio vs Touch — discover your fastest sense.',
    },

    # ── Click Speed ─────────────────────────────────────────────────────────
    'click-speed-test': {
        'accent': '#EF4444', 'accent_rgb': '239,68,68',
        'text_on': '#fff', 'bg_dark': '#0f0505',
        'header_color': '#F87171',
        'description': 'How fast can you click? Push your CPS to the limit.',
    },
    'double-click-speed-test': {
        'accent': '#EC4899', 'accent_rgb': '236,72,153',
        'text_on': '#fff', 'bg_dark': '#0f0508',
        'header_color': '#F472B6',
        'description': 'Double-click mastery. Track, compare, and improve.',
    },

    # ── Apex Branded ─────────────────────────────────────────────────────────
    'apex-aim-trainer': {
        'accent': '#E8692A', 'accent_rgb': '232,105,42',
        'text_on': '#fff', 'bg_dark': '#0c0602',
        'header_color': '#F97316',
        'canvas_gradient': 'linear-gradient(160deg, #0c0602 0%, #1a0c05 100%)',
        'description': 'Battle royale movement + aim. Train for the Apex Games.',
    },
    'apex-recoil-trainer': {
        'accent': '#E8692A', 'accent_rgb': '232,105,42',
        'text_on': '#fff', 'bg_dark': '#0c0602',
        'header_color': '#F97316',
        'description': 'Master every Apex weapon recoil pattern. Spray control training.',
    },
    'apex-tier-list': {
        'accent': '#E8692A', 'accent_rgb': '232,105,42',
        'text_on': '#fff', 'bg_dark': '#0c0602',
        'header_color': '#F97316',
        'description': 'Ranked legend and weapon tier lists for Season 23.',
    },

    # ── Call of Duty Branded ─────────────────────────────────────────────────
    'cod-aim-trainer': {
        'accent': '#8B9A2B', 'accent_rgb': '139,154,43',
        'text_on': '#fff', 'bg_dark': '#070a03',
        'header_color': '#A3B635',
        'canvas_gradient': 'linear-gradient(160deg, #070a03 0%, #0e1205 100%)',
        'description': 'Military-grade aim training. Built for Modern Warfare operators.',
    },
    'cod-recoil-trainer': {
        'accent': '#8B9A2B', 'accent_rgb': '139,154,43',
        'text_on': '#fff', 'bg_dark': '#070a03',
        'header_color': '#A3B635',
        'description': 'Control every burst. CoD recoil mastery training.',
    },
    'cod-loadout-builder': {
        'accent': '#8B9A2B', 'accent_rgb': '139,154,43',
        'text_on': '#fff', 'bg_dark': '#070a03',
        'header_color': '#A3B635',
        'description': 'Build your perfect CoD loadout. Meta-optimized attachments.',
    },

    # ── CS:GO / CS2 Branded ──────────────────────────────────────────────────
    'csgo-aim-trainer': {
        'accent': '#E8C800', 'accent_rgb': '232,200,0',
        'text_on': '#000', 'bg_dark': '#050a0f',
        'header_color': '#FDE047',
        'canvas_gradient': 'linear-gradient(160deg, #050a0f 0%, #0a1018 100%)',
        'description': 'CS2 aim training. Spray, flick, and clutch mechanics.',
    },
    'csgo-crosshair-generator': {
        'accent': '#E8C800', 'accent_rgb': '232,200,0',
        'text_on': '#000', 'bg_dark': '#050a0f',
        'header_color': '#FDE047',
        'description': 'Generate your perfect CS2 crosshair. Export instantly.',
    },
    'csgo-grenade-trainer': {
        'accent': '#E8C800', 'accent_rgb': '232,200,0',
        'text_on': '#000', 'bg_dark': '#050a0f',
        'header_color': '#FDE047',
        'description': 'Learn every lineup. CS2 grenade and utility training.',
    },

    # ── Valorant Branded ─────────────────────────────────────────────────────
    'valorant-aim-trainer': {
        'accent': '#FF4655', 'accent_rgb': '255,70,85',
        'text_on': '#fff', 'bg_dark': '#0f0507',
        'header_color': '#FF6B77',
        'canvas_gradient': 'linear-gradient(160deg, #0f0507 0%, #180809 100%)',
        'description': 'Ranked-ready aim training. Built for Valorant gunfights.',
    },
    'valorant-crosshair-generator': {
        'accent': '#FF4655', 'accent_rgb': '255,70,85',
        'text_on': '#fff', 'bg_dark': '#0f0507',
        'header_color': '#FF6B77',
        'description': 'Design your Valorant crosshair. Preview and export.',
    },
    'valorant-lineup-trainer': {
        'accent': '#FF4655', 'accent_rgb': '255,70,85',
        'text_on': '#fff', 'bg_dark': '#0f0507',
        'header_color': '#FF6B77',
        'description': 'Master ability lineups. Map-specific utility guide.',
    },

    # ── Fortnite Branded ─────────────────────────────────────────────────────
    'fortnite-aim-trainer': {
        'accent': '#7B3FE4', 'accent_rgb': '123,63,228',
        'text_on': '#fff', 'bg_dark': '#08050f',
        'header_color': '#A78BFA',
        'canvas_gradient': 'linear-gradient(160deg, #08050f 0%, #120a18 100%)',
        'description': 'Build and beam. Fortnite aim + edit speed training.',
    },
    'fortnite-edit-trainer': {
        'accent': '#7B3FE4', 'accent_rgb': '123,63,228',
        'text_on': '#fff', 'bg_dark': '#08050f',
        'header_color': '#A78BFA',
        'description': 'Edit speed is everything. Train your binds to muscle memory.',
    },
    'fortnite-sensitivity-finder': {
        'accent': '#7B3FE4', 'accent_rgb': '123,63,228',
        'text_on': '#fff', 'bg_dark': '#08050f',
        'header_color': '#A78BFA',
        'description': 'Find your perfect Fortnite sensitivity. Science-backed.',
    },

    # ── Flick Shot ───────────────────────────────────────────────────────────
    'flick-shot-trainer': {
        'accent': '#00E88A', 'accent_rgb': '0,232,138',
        'text_on': '#000', 'bg_dark': '#020f08',
        'header_color': '#34D399',
        'canvas_gradient': 'linear-gradient(160deg, #020f08 0%, #071810 100%)',
        'description': 'Speed over precision. Flick mechanics for every FPS game.',
    },

    # ── Precision Aim ────────────────────────────────────────────────────────
    'precision-aim-test': {
        'accent': '#F0F0F0', 'accent_rgb': '240,240,240',
        'text_on': '#000', 'bg_dark': '#050505',
        'header_color': '#FFFFFF',
        'canvas_gradient': 'linear-gradient(160deg, #050505 0%, #0a0a0a 100%)',
        'description': 'White on black. Pure precision. No distractions.',
    },

    # ── Cognitive / Brain Science ────────────────────────────────────────────
    'stroop-effect-test': {
        'accent': '#A855F7', 'accent_rgb': '168,85,247',
        'text_on': '#fff', 'bg_dark': '#08050f',
        'header_color': '#C084FC',
        'description': 'Your brain vs itself. The Stroop interference challenge.',
    },
    'color-match-test': {
        'accent': '#F59E0B', 'accent_rgb': '245,158,11',
        'text_on': '#000', 'bg_dark': '#0f0b03',
        'header_color': '#FCD34D',
        'description': 'Color recognition speed. Train pattern matching reflexes.',
    },
    'memory-sequence-test': {
        'accent': '#0EA5E9', 'accent_rgb': '14,165,233',
        'text_on': '#fff', 'bg_dark': '#02080f',
        'header_color': '#38BDF8',
        'description': 'Sequence recall training. Expand your working memory capacity.',
    },
    'focus-attention-test': {
        'accent': '#14B8A6', 'accent_rgb': '20,184,166',
        'text_on': '#000', 'bg_dark': '#020f0d',
        'header_color': '#2DD4BF',
        'description': 'Sustained attention measurement. Stay locked under pressure.',
    },
    'number-speed-test': {
        'accent': '#FACC15', 'accent_rgb': '250,204,21',
        'text_on': '#000', 'bg_dark': '#0f0e02',
        'header_color': '#FDE047',
        'description': 'Number pattern recognition at speed. Sharpen your sequencing.',
    },

    # ── Physical / Coordination ───────────────────────────────────────────────
    'hand-eye-coordination-test': {
        'accent': '#22C55E', 'accent_rgb': '34,197,94',
        'text_on': '#000', 'bg_dark': '#020f06',
        'header_color': '#4ADE80',
        'description': 'Hand-eye precision under time pressure. Sport-science tested.',
    },
    'peripheral-vision-test': {
        'accent': '#6366F1', 'accent_rgb': '99,102,241',
        'text_on': '#fff', 'bg_dark': '#05050f',
        'header_color': '#818CF8',
        'description': 'See the full picture. Peripheral awareness target training.',
    },

    # ── Typing ────────────────────────────────────────────────────────────────
    'typing-speed-test': {
        'accent': '#94A3B8', 'accent_rgb': '148,163,184',
        'text_on': '#000', 'bg_dark': '#060606',
        'header_color': '#CBD5E1',
        'description': 'Words per minute. Accuracy. Rhythm. Your complete typing benchmark.',
    },

    # ── Utility / Calculator ──────────────────────────────────────────────────
    'sensitivity-calculator': {
        'accent': '#64748B', 'accent_rgb': '100,116,139',
        'text_on': '#fff', 'bg_dark': '#060608',
        'header_color': '#94A3B8',
        'description': 'Convert sensitivity across any FPS game. Real-world cm/360.',
    },
}

DEFAULT_THEME = {
    'accent': '#FF4D00', 'accent_rgb': '255,77,0',
    'text_on': '#000', 'bg_dark': '#080808',
    'header_color': '#FF6B35',
}

def get_theme(tool_name):
    # Sort by key length descending so most-specific pattern wins
    for key in sorted(TOOL_THEMES.keys(), key=len, reverse=True):
        if key in tool_name:
            return TOOL_THEMES[key]
    return DEFAULT_THEME

def build_theme_css(theme):
    a = theme['accent']
    rgb = theme['accent_rgb']
    ton = theme['text_on']
    bg = theme['bg_dark']
    hc = theme.get('header_color', a)
    cg = theme.get('canvas_gradient', f'linear-gradient(160deg, {bg} 0%, {bg} 100%)')

    return f"""
        /* ═══ Tool Identity Theme ════════════════════════════════════════════ */
        :root {{
            --tool-accent:     {a};
            --tool-accent-rgb: {rgb};
            --tool-accent-dim: rgba({rgb}, 0.12);
            --tool-accent-glow: 0 0 24px rgba({rgb}, 0.3);
            --tool-bg:         {bg};
            --tool-text-on:    {ton};
            --tool-header:     {hc};
        }}

        /* Test panel — unique top border + subtle bg tint */
        .test-panel {{
            border-top: 2px solid {a} !important;
            background: {bg} !important;
        }}

        /* Headings inherit tool color */
        .test-panel h1,
        .test-panel h2 {{
            color: {hc};
        }}

        /* Primary button — tool color */
        .btn-primary {{
            background: {a} !important;
            color: {ton} !important;
            box-shadow: none;
        }}
        .btn-primary:hover {{
            background: {a} !important;
            opacity: 0.88;
            box-shadow: 0 6px 24px rgba({rgb}, 0.4) !important;
            transform: translateY(-1px);
        }}

        /* HUD cells — tool accent top strip */
        .hud-cell {{
            border-top: 2px solid {a} !important;
            background: color-mix(in srgb, {bg} 90%, #fff 10%) !important;
        }}
        .hud-cell-val {{
            color: {a} !important;
        }}

        /* Score card */
        .score-card {{
            border-top: 2px solid {a} !important;
            background: {bg} !important;
        }}
        .score-card-value {{
            color: {a} !important;
        }}

        /* Stats panel left bar */
        .stats-panel {{
            border-left: 2px solid {a} !important;
            background: {bg} !important;
        }}
        .stats-panel h4 {{
            color: {a} !important;
        }}

        /* Section label / info h3 */
        .info-section h3 {{
            color: {a};
        }}

        /* Aim canvas */
        .aim-canvas-wrap {{
            background: {cg} !important;
            border-top: 2px solid {a} !important;
        }}
        .aim-hud-item span {{
            color: {a} !important;
        }}
        .aim-timer-display {{
            color: {a} !important;
        }}
        .hitmarker {{
            color: {a} !important;
        }}

        /* Mode buttons active state */
        .aim-mode-btn.active {{
            background: {a} !important;
            color: {ton} !important;
            border-color: {a} !important;
        }}

        /* CPS tab active */
        .cps-tab.active,
        .cps-duration-btn.active {{
            background: {a} !important;
            color: {ton} !important;
            border-color: {a} !important;
        }}

        /* Click zone running state */
        .cps-click-zone {{
            border-top-color: rgba({rgb}, 0.3) !important;
        }}
        .cps-click-zone.running {{
            border-top-color: {a} !important;
            box-shadow: 0 0 30px rgba({rgb}, 0.12) !important;
        }}
        .cps-live-cps {{
            color: {a} !important;
        }}
        .cps-progress-inner {{
            background: linear-gradient(90deg, {a}, #22c55e) !important;
        }}
        .cps-ripple {{
            background: rgba({rgb}, 0.2) !important;
        }}

        /* Reflex circle states — override to tool accent for result */
        .reflex-circle-wrap.state-result .reflex-ring {{
            border-color: {a} !important;
            box-shadow: 0 0 20px rgba({rgb}, 0.25) !important;
        }}
        .reflex-circle-wrap.state-result .reflex-circle-value {{
            color: {a} !important;
        }}
        .reflex-circle-wrap.state-idle .reflex-circle {{
            background: {bg} !important;
        }}

        /* Sequence tiles */
        .sequence-tile.active {{
            background: rgba({rgb}, 0.25) !important;
            border-color: {a} !important;
            box-shadow: 0 0 16px rgba({rgb}, 0.3) !important;
        }}

        /* Color options / stroop buttons */
        .stroop-btn.correct {{
            background: {a} !important;
            box-shadow: 0 0 16px rgba({rgb}, 0.4) !important;
        }}

        /* Typing current char */
        .typing-text .current-char {{
            background: rgba({rgb}, 0.25) !important;
            border-bottom-color: {a} !important;
        }}
        .typing-input:focus {{
            border-color: {a} !important;
        }}

        /* Peripheral / coordination target */
        .peripheral-center {{
            background: {a} !important;
        }}
        .coordination-target {{
            background: {a} !important;
            box-shadow: 0 0 16px rgba({rgb}, 0.4) !important;
        }}

        /* Number tiles */
        .number-tile {{
            background: rgba({rgb}, 0.08) !important;
            border-color: rgba({rgb}, 0.4) !important;
        }}
        .number-tile.next {{
            background: rgba({rgb}, 0.25) !important;
            border-color: {a} !important;
        }}

        /* Progress fill */
        .progress-fill {{
            background: {a} !important;
        }}

        /* Form focus */
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus,
        .sens-field select:focus,
        .sens-field input:focus {{
            border-color: {a} !important;
        }}

        /* Filter buttons */
        .filter-btn.active,
        .cps-duration-btn.active {{
            color: {a} !important;
            border-color: rgba({rgb}, 0.5) !important;
            background: rgba({rgb}, 0.1) !important;
        }}

        /* Dashboard card value */
        .dashboard-card .card-value {{
            color: {a} !important;
        }}

        /* Breadcrumb active link */
        .breadcrumb a:hover {{
            color: {a} !important;
        }}

        /* Score display inline (legacy fallback) */
        #scoreDisplay .score-card-value,
        #resultDisplay {{
            color: {a} !important;
        }}

        /* Focus visible outline */
        :focus-visible {{
            outline-color: {a} !important;
        }}
        /* ═══════════════════════════════════════════════════════════════════ */
"""

def inject_theme(html, tool_name):
    theme = get_theme(tool_name)
    theme_css = build_theme_css(theme)

    # Find the first <style> tag and prepend our theme CSS inside it
    def inject(m):
        return m.group(0).replace('<style>', '<style>' + theme_css, 1)

    html = re.sub(r'<style[^>]*>', lambda m: m.group(0), html)
    # Actually inject before the first </style>
    first_style = re.search(r'<style[^>]*>', html, re.IGNORECASE)
    if first_style:
        pos = first_style.end()
        html = html[:pos] + theme_css + html[pos:]

    return html

def process_file(filepath):
    tool_name = os.path.basename(filepath).replace('.html', '')
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html

    # Remove any previously injected theme blocks to avoid duplication
    html = re.sub(
        r'/\* ═══ Tool Identity Theme ════.*?═══════════════════════════════════════════ \*/\s*',
        '',
        html,
        flags=re.DOTALL
    )

    # Inject fresh theme
    html = inject_theme(html, tool_name)

    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False

def main():
    html_files = [f for f in os.listdir(TOOLS_DIR) if f.endswith('.html')]
    updated = 0

    for fname in sorted(html_files):
        fpath = os.path.join(TOOLS_DIR, fname)
        try:
            tool_name = fname.replace('.html', '')
            theme = get_theme(tool_name)
            process_file(fpath)
            print(f"  [{theme['accent']}] {fname}")
            updated += 1
        except Exception as e:
            print(f"  ERR {fname}: {e}")
            import traceback; traceback.print_exc()

    print(f"\nDone: {updated}/{len(html_files)} tools themed")

if __name__ == '__main__':
    main()
