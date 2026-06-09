import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if there's anything to replace
    if 'â‚¹' in content or 'âœ¦' in content or 'â˜…' in content or 'â€¢' in content or 'â— ' in content or 'âš¡' in content or 'âš™' in content or 'â–¼' in content:
        content = content.replace('â‚¹', '₹')
        content = content.replace('âœ¦', '✦')
        content = content.replace('â˜…', '★')
        content = content.replace('â€¢', '•')
        content = content.replace('â— ', '●')
        content = content.replace('âš¡', '⚡')
        content = content.replace('âš™', '⚙')
        content = content.replace('â–¼', '▼')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk(r"c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\admin\src"):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))
