import os
import re

def audit_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    findings = []
    
    # Title
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""
    if not title or len(title) < 10 or len(title) > 70:
        findings.append(f"Title issues: '{title}' (Length: {len(title)})")
    
    # Meta Description
    meta_desc_match = re.search(r'<meta\s+name="description"\s+content="(.*?)"', content, re.IGNORECASE)
    desc_content = meta_desc_match.group(1) if meta_desc_match else ""
    if not desc_content or len(desc_content) < 50 or len(desc_content) > 165:
        findings.append(f"Meta Description issues: (Length: {len(desc_content)})")

    # H1
    h1_count = len(re.findall(r'<h1', content, re.IGNORECASE))
    if h1_count != 1:
        findings.append(f"H1 count: {h1_count}")

    # Canonical
    if not re.search(r'<link\s+rel="canonical"', content, re.IGNORECASE):
        findings.append("Missing Canonical link")

    # Robots
    if not re.search(r'<meta\s+name="robots"', content, re.IGNORECASE):
        findings.append("Missing Robots meta")

    # OG / Twitter
    if not re.search(r'property="og:', content, re.IGNORECASE):
        findings.append("Missing OG tags")
    if not re.search(r'name="twitter:', content, re.IGNORECASE):
        findings.append("Missing Twitter tags")

    # Imgs without alt
    all_imgs = re.findall(r'<img\s+[^>]*>', content, re.IGNORECASE)
    imgs_with_alt = re.findall(r'<img\s+[^>]*alt="[^"]*"[^>]*>', content, re.IGNORECASE)
    imgs_no_alt_count = len(all_imgs) - len(imgs_with_alt)
    if imgs_no_alt_count > 0:
        findings.append(f"Images without alt: {imgs_no_alt_count}")

    # Anchors genéricos sin aria-label
    generic_patterns = [r'leer más', r'click aquí', r'ver más', r'read more']
    generic_anchors_count = 0
    # Find all <a> tags
    anchors = re.findall(r'<a\s+[^>]*>(.*?)</a>', content, re.IGNORECASE | re.DOTALL)
    for a_content in anchors:
        text = re.sub('<[^<]+?>', '', a_content).strip().lower()
        if any(re.match(p, text) for p in generic_patterns):
            # Check if aria-label exists in the surrounding tag (this is a bit rough with regex)
            # We'll just count them based on text for now as a proxy
            generic_anchors_count += 1
    if generic_anchors_count > 0:
         findings.append(f"Generic anchors (potential missing aria-label): {generic_anchors_count}")

    # Anchors vacíos
    empty_anchors = re.findall(r'<a\s+[^>]*>\s*</a>', content, re.IGNORECASE)
    if empty_anchors:
        findings.append(f"Empty anchors: {len(empty_anchors)}")

    # Main
    if not re.search(r'<main', content, re.IGNORECASE):
        findings.append("Missing <main> tag")

    # JSON-LD
    if not re.search(r'type="application/ld\+json"', content, re.IGNORECASE):
        findings.append("Missing JSON-LD")

    return findings

if __name__ == "__main__":
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    for file in html_files:
        problems = audit_html(file)
        if problems:
            print(f"--- {file} ---")
            for p in problems:
                print(f"  [!] {p}")
