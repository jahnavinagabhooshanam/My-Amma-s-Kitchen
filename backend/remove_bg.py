from PIL import Image
import sys

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Change white or near-white to transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

input_file = r"c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\admin\src\assets\img\logo.jpeg"
output_user = r"c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\user\src\assets\img\logo.png"
output_admin = r"c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\admin\src\assets\img\logo.png"

try:
    remove_white_bg(input_file, output_user)
    remove_white_bg(input_file, output_admin)
    print("Done")
except Exception as e:
    print(f"Error: {e}")
