import os

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '₹' in content:
            content = content.replace('₹', '')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Removed symbol from {filepath}")
    except Exception as e:
        print(f"Failed {filepath}: {e}")

for root, dirs, files in os.walk(r"c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\admin\src"):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))
