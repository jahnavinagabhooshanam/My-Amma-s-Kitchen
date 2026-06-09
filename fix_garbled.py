import os
import glob

replacements = {
    'â‚¹': 'Rs. ',
    '₹': 'Rs. ',
    'Ã—': 'x ',
    '×': 'x ',
    'ðŸ¶': '',  # Edli Sambar pot
    'ðŸ¥˜': '',  # other food emojis
    'ðŸšš': '',  # truck
    'ðŸ”': '',
    'ðŸŽ‰': '',
    'ðŸ”¥': '',
    'ðŸ›¡ï¸ ': '',
    'ðŸ‘¥': '',
    'ðŸŽ“': '',
    'ðŸŽ‚': '',
    'ðŸ’¼': '',
    'ðŸŒ¸': '',
    'ðŸ ¶': '',
    'ðŸ': '',
    'ðŸ': '',
    'ðŸ¯': '',
    'ðŸ²': '',
    'ðŸ': ''  # Fallback for any other garbled emojis starting with this sequence
}

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old_text, new_text in replacements.items():
        content = content.replace(old_text, new_text)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned {filepath}")

for d in ['user/src/**/*.jsx', 'user/src/**/*.js', 'admin/src/**/*.jsx', 'admin/src/**/*.js']:
    for f in glob.glob(d, recursive=True):
        if os.path.isfile(f):
            clean_file(f)
