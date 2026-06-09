from PIL import Image
img = Image.open('admin/src/assets/img/ammulus-kitchen-logo.jpg').convert('RGBA')
data = img.getdata()
new_data = []
target = (27, 58, 40, 255) # #1b3a28

for item in data:
    avg = (item[0]+item[1]+item[2])/3.0
    if avg > 230:
        new_data.append(target)
    elif avg > 150:
        ratio = (avg-150)/80.0
        new_data.append((
            int(item[0]*(1-ratio) + target[0]*ratio),
            int(item[1]*(1-ratio) + target[1]*ratio),
            int(item[2]*(1-ratio) + target[2]*ratio),
            255
        ))
    else:
        new_data.append(item)

img.putdata(new_data)
img.save('admin/src/assets/img/ammulus-kitchen-logo-green.png')
