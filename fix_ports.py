import os

dirs_to_check = [
    r"c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\user\src",
    r"c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\admin\src"
]

for d in dirs_to_check:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith(('.js', '.jsx')):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                if 'http://localhost:5000' in content:
                    content = content.replace('http://localhost:5000', 'http://localhost:5001')
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(content)
                    print(f"Updated {path}")
