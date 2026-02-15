import os
import re
from pathlib import Path

# Define limits
MAX_TITLE_LENGTH = 60
MAX_DESC_LENGTH = 160

def extract_meta_content(file_path):
    """Extract title and meta description from HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title
        title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
        title = title_match.group(1).strip() if title_match else None
        
        # Extract meta description
        desc_match = re.search(r'<meta\s+name="description"\s+content="(.*?)"', content, re.DOTALL)
        description = desc_match.group(1).strip() if desc_match else None
        
        return title, description
    except Exception as e:
        return None, None

def analyze_all_html_files(root_dir):
    """Analyze all HTML files and find those exceeding limits"""
    too_long_titles = []
    too_long_descriptions = []
    
    for file_path in Path(root_dir).rglob('*.html'):
        title, description = extract_meta_content(file_path)
        
        rel_path = str(file_path.relative_to(root_dir))
        
        if title and len(title) > MAX_TITLE_LENGTH:
            too_long_titles.append({
                'file': rel_path,
                'length': len(title),
                'content': title
            })
        
        if description and len(description) > MAX_DESC_LENGTH:
            too_long_descriptions.append({
                'file': rel_path,
                'length': len(description),
                'content': description
            })
    
    return too_long_titles, too_long_descriptions

if __name__ == '__main__':
    root = r'c:\Users\snowp\Reflex-Tester'
    
    print("🔍 Analyzing HTML files for SEO meta tag length issues...\n")
    
    titles, descriptions = analyze_all_html_files(root)
    
    print(f"📊 RESULTS:")
    print(f"   Titles exceeding {MAX_TITLE_LENGTH} chars: {len(titles)}")
    print(f"   Descriptions exceeding {MAX_DESC_LENGTH} chars: {len(descriptions)}")
    print()
    
    if titles:
        print("=" * 80)
        print("🔴 TITLES TOO LONG (>{} characters)".format(MAX_TITLE_LENGTH))
        print("=" * 80)
        for item in sorted(titles, key=lambda x: x['length'], reverse=True):
            print(f"\n📄 {item['file']}")
            print(f"   Length: {item['length']} chars (trim {item['length'] - MAX_TITLE_LENGTH} chars)")
            print(f"   Title: {item['content']}")
    
    if descriptions:
        print("\n" + "=" * 80)
        print(f"🔴 META DESCRIPTIONS TOO LONG (>{MAX_DESC_LENGTH} characters)")
        print("=" * 80)
        for item in sorted(descriptions, key=lambda x: x['length'], reverse=True):
            print(f"\n📄 {item['file']}")
            print(f"   Length: {item['length']} chars (trim {item['length'] - MAX_DESC_LENGTH} chars)")
            print(f"   Description: {item['content']}")
    
    print("\n" + "=" * 80)
    print("✅ Analysis complete!")
    print("=" * 80)
