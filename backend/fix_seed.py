import re
with open("seed.py", "r", encoding="utf-8") as f:
    content = f.read()
# Replace id=..., with nothing. Only when it's just 'id=NUMBER,' on a line
content = re.sub(r"^\s*id=\d+,\s*\n", "", content, flags=re.MULTILINE)
with open("seed.py", "w", encoding="utf-8") as f:
    f.write(content)
