import re
with open("seed.py", "r", encoding="utf-8") as f:
    content = f.read()

# Remove timestamp=... from WebsiteActivity creations
content = re.sub(r",\s*timestamp=datetime\.utcnow\(\)\s*-\s*timedelta\(minutes=\d+\)", "", content)

with open("seed.py", "w", encoding="utf-8") as f:
    f.write(content)
