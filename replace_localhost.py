import os

def replace_in_files(directory, old_str, new_str):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if old_str in content:
                    content = content.replace(old_str, new_str)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filepath}")

replace_in_files('user/src', 'http://localhost:5000', 'http://127.0.0.1:5000')
replace_in_files('admin/src', 'http://localhost:5000', 'http://127.0.0.1:5000')
