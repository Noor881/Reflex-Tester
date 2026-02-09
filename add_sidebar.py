"""
Script to add sidebar navigation to all blog post HTML files
"""
import os
import re

# Sidebar HTML template (for files in subdirectories like reaction/, health/, etc.)
SIDEBAR_HTML = '''    <!-- Sidebar Navigation -->
    <nav class="sidebar" id="sidebar">
        <a href="../index.html" class="logo">⚡ ReflexTester</a>
        
        <ul class="sidebar-menu">
            <li><a href="../index.html">🏠 Home</a></li>
            <li><a href="../dashboard.html">📊 Dashboard</a></li>
            <li><a href="../blog.html" class="active">📝 Blog</a></li>
            <li><a href="../about.html">ℹ️ About</a></li>
            <li><a href="../contact.html">📧 Contact</a></li>
        </ul>
    </nav>

    <button class="mobile-toggle" id="mobileToggle">☰</button>

    <div class="main-content">'''

# Sidebar CSS (minimal - add to existing <style> section)
SIDEBAR_CSS = '''
        /* Sidebar Navigation */
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 250px;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(15px);
            padding: 20px;
            z-index: 1000;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease;
        }

        .sidebar .logo {
            font-size: 1.5em;
            font-weight: bold;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-decoration: none;
            display: block;
            margin-bottom: 30px;
        }

        .sidebar-menu {
            list-style: none;
            padding: 0;
        }

        .sidebar-menu li {
            margin-bottom: 15px;
        }

        .sidebar-menu a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            padding: 12px 15px;
            border-radius: 10px;
            display: block;
        }

        .sidebar-menu a:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #4ecdc4;
        }

        .sidebar-menu a.active {
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        /* Main content wrapper */
        .main-content {
            margin-left: 250px;
            min-height: 100vh;
        }

        /* Mobile Toggle */
        .mobile-toggle {
            display: none;
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1001;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1.2em;
        }

        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.active {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
            }

            .mobile-toggle {
                display: block;
            }
        }
'''

# Mobile toggle script
MOBILE_SCRIPT = '''
    <script>
        // Mobile sidebar toggle
        const mobileToggle = document.getElementById('mobileToggle');
        const sidebar = document.getElementById('sidebar');

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(event) {
                if (window.innerWidth <= 768) {
                    if (!sidebar.contains(event.target) && !mobileToggle.contains(event.target)) {
                        sidebar.classList.remove('active');
                    }
                }
            });
        }
    </script>'''

def add_sidebar_to_file(filepath):
    """Add sidebar navigation to an HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if sidebar already exists
        if 'class="sidebar"' in content or 'id="sidebar"' in content:
            print(f"✓ Skipped {filepath} - already has sidebar")
            return False
        
        # Add CSS to <style> section
        if '</style>' in content:
            content = content.replace('</style>', SIDEBAR_CSS + '\n    </style>', 1)
        
        # Add sidebar HTML after <body> tag
        if '<body>' in content:
            content = content.replace('<body>', '<body>\n' + SIDEBAR_HTML, 1)
        
        # Close main-content div before </body>
        if '</body>' in content:
            # Add closing div and script before </body>
            content = content.replace('</body>', '    </div>\n' + MOBILE_SCRIPT + '\n</body>', 1)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Added sidebar to {filepath}")
        return True
    except Exception as e:
        print(f"✗ Error processing {filepath}: {str(e)}")
        return False

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # List of directories to process
    directories = [
        os.path.join(base_dir, 'reaction'),
        os.path.join(base_dir, 'health'),
        os.path.join(base_dir, 'guides'),
        os.path.join(base_dir, 'resources'),
    ]
    
    total_processed = 0
    total_modified = 0
    
    for directory in directories:
        if not os.path.exists(directory):
            print(f"Directory not found: {directory}")
            continue
        
        print(f"\nProcessing {os.path.basename(directory)}/ directory...")
        
        for filename in os.listdir(directory):
            if filename.endswith('.html'):
                filepath = os.path.join(directory, filename)
                total_processed += 1
                if add_sidebar_to_file(filepath):
                    total_modified += 1
    
    print(f"\n{'='*60}")
    print(f"Summary: Modified {total_modified} out of {total_processed} files")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
